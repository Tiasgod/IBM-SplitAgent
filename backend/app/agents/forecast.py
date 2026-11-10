from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from datetime import date


class ForecastAgent:
    """
    Agente responsável por projetar o saldo financeiro
    com base nas movimentações e suas datas.
    """

    def process(self, movements, forecast_date, opening_balance="0.00"):

        if not isinstance(movements, list):
            return {
                "status": "error",
                "message": "Lista de movimentações inválida."
            }

        try:
            if not isinstance(forecast_date, str):
                raise ValueError()

            target_date = date.fromisoformat(forecast_date)

        except (ValueError, TypeError):
            return {
                "status": "error",
                "message": "Data de previsão inválida. Use AAAA-MM-DD."
            }

        try:
            if isinstance(opening_balance, bool):
                raise ValueError()

            balance = Decimal(str(opening_balance))

            if not balance.is_finite():
                raise ValueError()

            balance = balance.quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP
            )

        except (InvalidOperation, ValueError, TypeError):
            return {
                "status": "error",
                "message": "Saldo inicial inválido."
            }

        total_income = Decimal("0.00")
        total_expense = Decimal("0.00")
        projected_movements = []

        for movement in movements:

            if not isinstance(movement, dict):
                return {
                    "status": "error",
                    "message": "Movimentação inválida."
                }

            movement_type = movement.get("type")
            amount = movement.get("amount")
            movement_date = movement.get("date")

            if movement_type not in ("income", "expense"):
                return {
                    "status": "error",
                    "message": "Tipo de movimentação inválido."
                }

            try:
                if not isinstance(movement_date, str):
                    raise ValueError()

                movement_date = date.fromisoformat(movement_date)

            except (ValueError, TypeError):
                return {
                    "status": "error",
                    "message": "Data de movimentação inválida."
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

            if movement_date <= target_date:

                if movement_type == "income":
                    total_income += amount
                else:
                    total_expense += amount

                projected_movements.append({
                    "type": movement_type,
                    "amount": format(amount, ".2f"),
                    "date": movement_date.isoformat()
                })

        projected_balance = balance + total_income - total_expense

        return {
            "status": "ok",
            "forecast_date": target_date.isoformat(),
            "opening_balance": format(balance, ".2f"),
            "total_income": format(total_income, ".2f"),
            "total_expense": format(total_expense, ".2f"),
            "projected_balance": format(projected_balance, ".2f"),
            "movements_considered": len(projected_movements),
            "movements": projected_movements
        }