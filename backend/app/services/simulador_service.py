from copy import deepcopy
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from app.models.simulacao import SimulacaoHistorico

from app.core.erros import RequisicaoInvalidaError
from app.schemas.simulador import SimulacaoRequest
from app.services.calculos_financeiros_service import (
    CENTAVOS,
    ZERO,
    _periodos_abaixo_minimo,
    _situacao,
    _dinheiro,
    calcular_fluxo_caixa,
)
from app.services.movimentacao_service import hoje

HORIZONTE_DIAS = 30


def _resumo(projecao: dict) -> dict:
    return {
        "saldo_atual": projecao["saldo_atual"],
        "menor_saldo_previsto": projecao["menor_saldo_previsto"],
        "data_menor_saldo_previsto": projecao["data_menor_saldo_previsto"],
        "situacao_caixa": projecao["situacao_caixa"],
        "saldo_minimo_configurado": projecao["saldo_minimo_configurado"],
        "periodos_abaixo_minimo": projecao["periodos_abaixo_minimo"],
        "dias": projecao["dias"],
    }


def _recalcular(projecao: dict, saldo_minimo: Decimal) -> dict:
    saldo = _dinheiro(projecao["saldo_atual"])
    dias = projecao["dias"]
    for dia in dias:
        dia["saldo_inicial_dia"] = saldo
        dia["total_entradas_brutas"] = _dinheiro(dia["total_entradas_brutas"])
        dia["tributos_estimados"] = _dinheiro(dia["tributos_estimados"])
        dia["total_entradas_liquidas"] = _dinheiro(dia["total_entradas_liquidas"])
        dia["total_saidas"] = _dinheiro(dia["total_saidas"])
        saldo = _dinheiro(saldo + dia["total_entradas_liquidas"] - dia["total_saidas"])
        dia["saldo_previsto"] = saldo
        dia["abaixo_minimo"] = saldo < saldo_minimo

    if dias:
        menor = min(dias, key=lambda item: (item["saldo_previsto"], item["data"]))
        projecao["menor_saldo_previsto"] = menor["saldo_previsto"]
        projecao["data_menor_saldo_previsto"] = menor["data"]
    else:
        projecao["menor_saldo_previsto"] = projecao["saldo_atual"]
        projecao["data_menor_saldo_previsto"] = hoje()
    projecao["saldo_minimo_configurado"] = _dinheiro(saldo_minimo)
    projecao["periodos_abaixo_minimo"] = _periodos_abaixo_minimo(dias, saldo_minimo)
    projecao["situacao_caixa"] = _situacao(projecao["menor_saldo_previsto"], saldo_minimo)
    return projecao


def simular_movimentacao(db: Session, usuario_id: int, dados: SimulacaoRequest) -> dict:
    hoje_local = hoje()
    data_fim = hoje_local + timedelta(days=HORIZONTE_DIAS)
    if dados.data < hoje_local:
        raise RequisicaoInvalidaError("A data simulada não pode ser anterior a hoje.")
    if dados.data > data_fim:
        raise RequisicaoInvalidaError("A data simulada deve estar dentro dos próximos 30 dias.")

    original = calcular_fluxo_caixa(
        db,
        usuario_id,
        dados.aliquota_tributaria_percentual,
        dados.saldo_minimo,
        hoje_local,
        HORIZONTE_DIAS,
    )
    simulada = deepcopy(original)
    valor = _dinheiro(dados.valor)
    taxa = dados.aliquota_tributaria_percentual / Decimal("100")
    tributos = _dinheiro(valor * taxa) if dados.tipo == "venda" else ZERO
    liquido = _dinheiro(valor - tributos) if dados.tipo == "venda" else None
    impacto = liquido if dados.tipo == "venda" else -valor

    if dados.data == hoje_local:
        simulada["saldo_atual"] = _dinheiro(simulada["saldo_atual"] + impacto)
    else:
        dia_alvo = next((dia for dia in simulada["dias"] if dia["data"] == dados.data), None)
        if dia_alvo is None:
            raise RequisicaoInvalidaError("Não foi possível localizar a data na projeção de 30 dias.")
        if dados.tipo == "venda":
            dia_alvo["total_entradas_brutas"] = _dinheiro(dia_alvo["total_entradas_brutas"] + valor)
            dia_alvo["tributos_estimados"] = _dinheiro(dia_alvo["tributos_estimados"] + tributos)
            dia_alvo["total_entradas_liquidas"] = _dinheiro(dia_alvo["total_entradas_liquidas"] + liquido)
        else:
            dia_alvo["total_saidas"] = _dinheiro(dia_alvo["total_saidas"] + valor)

    simulada = _recalcular(simulada, dados.saldo_minimo)
    menor_original = original["menor_saldo_previsto"]
    menor_simulado = simulada["menor_saldo_previsto"]
    resultado = {
        "tipo": dados.tipo,
        "descricao": dados.descricao,
        "data_simulada": dados.data,
        "valor_simulado": valor,
        "tributos_estimados_simulacao": tributos,
        "valor_liquido_simulacao": liquido,
        "impacto_no_saldo": _dinheiro(impacto),
        "saldo_atual_original": original["saldo_atual"],
        "saldo_atual_simulado": simulada["saldo_atual"],
        "menor_saldo_original": menor_original,
        "data_menor_saldo_original": original["data_menor_saldo_previsto"],
        "menor_saldo_simulado": menor_simulado,
        "data_menor_saldo_simulado": simulada["data_menor_saldo_previsto"],
        "gera_saldo_negativo": menor_simulado < ZERO or simulada["saldo_atual"] < ZERO,
        "fica_abaixo_minimo": menor_simulado < dados.saldo_minimo or simulada["saldo_atual"] < dados.saldo_minimo,
        "situacao_original": original["situacao_caixa"],
        "situacao_simulada": simulada["situacao_caixa"],
        "periodos_abaixo_minimo_simulados": simulada["periodos_abaixo_minimo"],
        "projecao_original": _resumo(original),
        "projecao_simulada": _resumo(simulada),
        "observacao_tributaria": (
            "Tributos são uma estimativa simples sobre o valor bruto da venda, usando a alíquota informada. "
            "Não substitui apuração contábil/fiscal. A simulação é registrada no histórico, mas não altera os lançamentos financeiros."
        ),
    }
    registro = SimulacaoHistorico(
        usuario_id=usuario_id,
        parametros=dados.model_dump(mode="json"),
        resultado=jsonable_encoder(resultado),
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    resultado["id"] = registro.id
    resultado["criado_em"] = registro.criado_em
    return resultado


def listar_simulacoes(db: Session, usuario_id: int) -> list[SimulacaoHistorico]:
    consulta = (
        select(SimulacaoHistorico)
        .where(SimulacaoHistorico.usuario_id == usuario_id)
        .order_by(SimulacaoHistorico.criado_em.desc(), SimulacaoHistorico.id.desc())
    )
    return list(db.scalars(consulta).all())


def consultar_simulacao(db: Session, usuario_id: int, simulacao_id: int) -> SimulacaoHistorico:
    from app.core.erros import NaoEncontradoError

    registro = db.scalar(
        select(SimulacaoHistorico).where(
            SimulacaoHistorico.id == simulacao_id,
            SimulacaoHistorico.usuario_id == usuario_id,
        )
    )
    if registro is None:
        raise NaoEncontradoError("Simulação não encontrada.")
    return registro
