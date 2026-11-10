from decimal import Decimal, ROUND_HALF_UP, InvalidOperation


class CashAgent:
    """
    Agente responsável por organizar entradas,
    saídas e saldo das movimentações financeiras.
    """

    def process(self, movements):

        if not isinstance(movements, list):
            return {
                "status": "error",
                "message": "Informe uma lista de movimentações válida."
            }

        total_income = Decimal("0.00")
        total_expense = Decimal("0.00")
        summary = []

        for movement in movements:

            if not isinstance(movement, dict):
                return {
                    "status": "error",
                    "message": "Movimentação inválida."
                }

            movement_type = movement.get("type")
            amount = movement.get("amount")

            if movement_type not in ("income", "expense"):
                return {
                    "status": "error",
                    "message": "Tipo de movimentação inválido."
                }

            try:
                if isinstance(amount, bool):
                    raise ValueError()

                amount = Decimal(str(amount))

                if not amount.is_finite() or amount <= 0:
                    raise ValueError()

                amount = amount.quantize(
                    Decimal("0.01"),
                    rounding=ROUND_HALF_UP
                )

            except (InvalidOperation, ValueError, TypeError):
                return {
                    "status": "error",
                    "message": "Valor da movimentação inválido."
                }

            description = movement.get("description", "")

            if not isinstance(description, str):
                return {
                    "status": "error",
                    "message": "Descrição inválida."
                }

            if movement_type == "income":
                total_income += amount
            else:
                total_expense += amount

            summary.append({
                "type": movement_type,
                "description": description,
                "amount": format(amount, ".2f")
            })

        balance = total_income - total_expense

        return {
            "status": "ok",
            "total_income": format(total_income, ".2f"),
            "total_expense": format(total_expense, ".2f"),
            "balance": format(balance, ".2f"),
            "movements": summary
        }