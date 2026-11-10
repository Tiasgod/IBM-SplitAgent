from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.erros import NaoEncontradoError
from app.models.decisao import DecisaoSimulador
from app.schemas.decisao import DecisaoCriar


def registrar_decisao(db: Session, usuario_id: int, dados: DecisaoCriar) -> DecisaoSimulador:
    decisao = DecisaoSimulador(
        usuario_id=usuario_id,
        recomendacao=dados.recomendacao,
        escolha_usuario=dados.escolha_usuario,
        resultado_projetado=dados.resultado_projetado,
    )
    db.add(decisao)
    db.commit()
    db.refresh(decisao)
    return decisao


def listar_decisoes(db: Session, usuario_id: int) -> list[DecisaoSimulador]:
    consulta = (
        select(DecisaoSimulador)
        .where(DecisaoSimulador.usuario_id == usuario_id)
        .order_by(DecisaoSimulador.data_decisao.desc(), DecisaoSimulador.id.desc())
    )
    return list(db.scalars(consulta).all())


def consultar_decisao(db: Session, usuario_id: int, decisao_id: int) -> DecisaoSimulador:
    consulta = select(DecisaoSimulador).where(
        DecisaoSimulador.id == decisao_id,
        DecisaoSimulador.usuario_id == usuario_id,
    )
    decisao = db.scalar(consulta)
    if decisao is None:
        raise NaoEncontradoError("Decisão não encontrada.")
    return decisao
