
from decimal import Decimal, InvalidOperation


class CreditAgent:

    def process(self, transaction):
        if not isinstance(transaction, dict):
            return {
                "status": "error",
                "message": "Dados da transação inválidos."
            }

        credit_context = transaction.get("credit_context")

        if not isinstance(credit_context, dict):
            return {
                "status": "error",
                "message": "Contexto de crédito não informado."
            }

        try:
            credit_limit = Decimal(str(credit_context["credit_limit"]))
            current_debt = Decimal(str(credit_context["current_debt"]))
            purchase_amount = Decimal(str(transaction["total"]))

            if not all(value.is_finite() for value in [
                credit_limit, current_debt, purchase_amount
            ]):
                raise ValueError()

            if credit_limit < 0 or current_debt < 0 or purchase_amount < 0:
                raise ValueError()

        except (KeyError, InvalidOperation, ValueError, TypeError):
            return {
                "status": "error",
                "message": "Informações de crédito inválidas."
            }

        available_credit = credit_limit - current_debt

        if purchase_amount > available_credit:
            return {
                "status": "warning",
                "message": "Limite de crédito insuficiente.",
                "available_credit": str(available_credit),
                "purchase_amount": str(purchase_amount)
            }

        return {
            "status": "ok",
            "message": "Crédito disponível para a transação.",
            "available_credit": str(available_credit),
            "purchase_amount": str(purchase_amount)
        }
