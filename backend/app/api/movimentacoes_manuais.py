from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.seguranca import get_usuario_atual_id
from app.core.erros import NaoEncontradoError
from app.models import SaldoManual, MovimentacaoManual
from app.schemas.movimentacao_manual import (SaldoManualEntrada, SaldoManualSaida, MovimentacaoManualEntrada,
    MovimentacaoManualAtualizacao, MovimentacaoManualSaida)

router = APIRouter(tags=["Lançamentos manuais"])

@router.post("/saldo-inicial", response_model=SaldoManualSaida, status_code=201)
def criar_ou_atualizar_saldo(dados: SaldoManualEntrada, db: Session = Depends(get_db), usuario_id: int = Depends(get_usuario_atual_id)):
    registro = db.scalars(select(SaldoManual).where(SaldoManual.usuario_id == usuario_id, SaldoManual.data_referencia == dados.data_referencia)).first()
    if registro is None:
        registro = SaldoManual(usuario_id=usuario_id, **dados.model_dump())
        db.add(registro)
    else:
        registro.saldo = dados.saldo
    db.commit(); db.refresh(registro)
    return registro

@router.get("/saldo-inicial", response_model=list[SaldoManualSaida])
def listar_saldos(db: Session = Depends(get_db), usuario_id: int = Depends(get_usuario_atual_id)):
    return list(db.scalars(select(SaldoManual).where(SaldoManual.usuario_id == usuario_id).order_by(SaldoManual.data_referencia.desc())).all())

@router.put("/saldo-inicial/{saldo_id}", response_model=SaldoManualSaida)
def atualizar_saldo(saldo_id: int, dados: SaldoManualEntrada, db: Session = Depends(get_db), usuario_id: int = Depends(get_usuario_atual_id)):
    registro = db.scalars(select(SaldoManual).where(SaldoManual.id == saldo_id, SaldoManual.usuario_id == usuario_id)).first()
    if registro is None: raise NaoEncontradoError("Saldo inicial não encontrado.")
    registro.data_referencia = dados.data_referencia; registro.saldo = dados.saldo
    db.commit(); db.refresh(registro); return registro

@router.delete("/saldo-inicial/{saldo_id}", status_code=204)
def excluir_saldo(saldo_id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_usuario_atual_id)):
    registro = db.scalars(select(SaldoManual).where(SaldoManual.id == saldo_id, SaldoManual.usuario_id == usuario_id)).first()
    if registro is None: raise NaoEncontradoError("Saldo inicial não encontrado.")
    db.delete(registro); db.commit()

@router.post("/movimentacoes/manuais", response_model=MovimentacaoManualSaida, status_code=201)
def criar_movimentacao(dados: MovimentacaoManualEntrada, db: Session = Depends(get_db), usuario_id: int = Depends(get_usuario_atual_id)):
    registro = MovimentacaoManual(usuario_id=usuario_id, **dados.model_dump()); db.add(registro); db.commit(); db.refresh(registro); return registro

@router.get("/movimentacoes/manuais", response_model=list[MovimentacaoManualSaida])
def listar_movimentacoes(db: Session = Depends(get_db), usuario_id: int = Depends(get_usuario_atual_id)):
    return list(db.scalars(select(MovimentacaoManual).where(MovimentacaoManual.usuario_id == usuario_id).order_by(MovimentacaoManual.data.desc(), MovimentacaoManual.id.desc())).all())

@router.get("/movimentacoes/manuais/{movimentacao_id}", response_model=MovimentacaoManualSaida)
def obter_movimentacao(movimentacao_id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_usuario_atual_id)):
    registro = db.scalars(select(MovimentacaoManual).where(MovimentacaoManual.id == movimentacao_id, MovimentacaoManual.usuario_id == usuario_id)).first()
    if registro is None: raise NaoEncontradoError("Movimentação manual não encontrada.")
    return registro

@router.put("/movimentacoes/manuais/{movimentacao_id}", response_model=MovimentacaoManualSaida)
def atualizar_movimentacao(movimentacao_id: int, dados: MovimentacaoManualAtualizacao, db: Session = Depends(get_db), usuario_id: int = Depends(get_usuario_atual_id)):
    registro = db.scalars(select(MovimentacaoManual).where(MovimentacaoManual.id == movimentacao_id, MovimentacaoManual.usuario_id == usuario_id)).first()
    if registro is None: raise NaoEncontradoError("Movimentação manual não encontrada.")
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        if valor is None and campo in {"data", "descricao", "valor", "tipo"}:
            raise HTTPException(status_code=422, detail=f"O campo '{campo}' não pode ser nulo.")
        setattr(registro, campo, valor)
    db.commit(); db.refresh(registro); return registro

@router.delete("/movimentacoes/manuais/{movimentacao_id}", status_code=204)
def excluir_movimentacao(movimentacao_id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_usuario_atual_id)):
    registro = db.scalars(select(MovimentacaoManual).where(MovimentacaoManual.id == movimentacao_id, MovimentacaoManual.usuario_id == usuario_id)).first()
    if registro is None: raise NaoEncontradoError("Movimentação manual não encontrada.")
    db.delete(registro); db.commit()
