
from __future__ import annotations

from typing import Any

from app.agents.core.calculator import calculate_split, validate_split


class SplitPaymentAgent:
    """
    Agente responsável por dividir pagamentos
    entre os participantes de uma transação.
    """

    def process(self, transaction: Any) -> dict[str, Any]:
        try:
            if not isinstance(transaction, dict):
                raise ValueError("Transação inválida.")

            total = transaction.get("total")
            participants = transaction.get("participants")

            if total is None:
                raise ValueError("O valor total não foi informado.")

            if participants is None:
                raise ValueError("Os participantes não foram informados.")

            # Realiza a divisão utilizando o Calculator
            shares = calculate_split(total, participants)

            # Prepara os valores para validação
            transaction_result = {
                "total": total,
                "shares": shares
            }

            if not validate_split(transaction_result):
                raise ValueError("A divisão dos pagamentos apresenta inconsistência.")

            # Converte Decimal para texto para facilitar a integração via JSON
            formatted_shares = [
                {
                    "name": share["name"],
                    "amount": format(share["amount"], ".2f")
                }
                for share in shares
            ]

            return {
                "status": "ok",
                "message": "Divisão realizada com sucesso.",
                "total": format(
                    sum(
                        (share["amount"] for share in shares),
                        start=shares[0]["amount"] * 0
                    ),
                    ".2f"
                ),
                "shares": formatted_shares
            }

        except (ValueError, TypeError) as error:
            return {
                "status": "error",
                "message": str(error)
            }
