from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models import Despesa, Importacao, Recebivel, SaldoInicial, Venda
from app.services.planilha_service import DadosPlanilha


def obter_atual(db: Session, usuario_id: int) -> Importacao | None:
    consulta = (
        select(Importacao)
        .where(Importacao.usuario_id == usuario_id)
        .order_by(Importacao.id.desc())
        .limit(1)
    )
    return db.scalars(consulta).first()


def obter_saldo(db: Session, importacao_id: int) -> SaldoInicial | None:
    return db.scalars(select(SaldoInicial).where(SaldoInicial.importacao_id == importacao_id)).first()


def remover_dados_do_usuario(db: Session, usuario_id: int) -> None:
    """Apaga as importações anteriores do usuário. Só deve ser chamado com autorização explícita (substituir=true)."""
    for tabela in (Venda, Recebivel, Despesa, SaldoInicial, Importacao):
        db.execute(delete(tabela).where(tabela.usuario_id == usuario_id))


def criar(db: Session, usuario_id: int, nome_arquivo: str, dados: DadosPlanilha) -> Importacao:
    importacao = Importacao(
        usuario_id=usuario_id,
        nome_arquivo=nome_arquivo,
        total_vendas=len(dados.vendas),
        total_recebiveis=len(dados.recebiveis),
        total_despesas=len(dados.despesas),
    )
    db.add(importacao)
    db.flush()  # gera o id usado pelas linhas filhas

    comum = {"importacao_id": importacao.id, "usuario_id": usuario_id}
    db.add(SaldoInicial(**comum, data_referencia=dados.saldo.data_referencia, saldo=dados.saldo.saldo))
    db.add_all(
        Venda(**comum, data=v.data, descricao=v.descricao, valor_bruto=v.valor_bruto, tipo=v.tipo)
        for v in dados.vendas
    )
    db.add_all(
        Recebivel(**comum, data_prevista=r.data_prevista, valor_esperado=r.valor_esperado, descricao=r.descricao)
        for r in dados.recebiveis
    )
    db.add_all(
        Despesa(**comum, descricao=d.descricao, vencimento=d.vencimento, valor=d.valor)
        for d in dados.despesas
    )
    return importacao
