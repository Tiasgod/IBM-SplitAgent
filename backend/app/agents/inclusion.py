
from decimal import Decimal, InvalidOperation


class InclusionAgent:

    def process(self, transaction):
        if not isinstance(transaction, dict):
            return {
                "status": "error",
                "message": "Dados da transação inválidos."
            }

        participants = transaction.get("participants")

        if not isinstance(participants, list) or not participants:
            return {
                "status": "error",
                "message": "Lista de participantes inválida."
            }

        issues = []

        for participant in participants:
            if not isinstance(participant, dict):
                return {
                    "status": "error",
                    "message": "Participante inválido."
                }

            name = participant.get("name")
            amount = participant.get("amount")

            if not isinstance(name, str) or not name.strip():
                return {
                    "status": "error",
                    "message": "Nome de participante inválido."
                }

            try:
                amount = Decimal(str(amount))

                if not amount.is_finite():
                    raise ValueError()

            except (InvalidOperation, ValueError, TypeError):
                return {
                    "status": "error",
                    "message": f"Valor inválido para {name}."
                }

            if amount <= 0:
                issues.append({
                    "participant": name,
                    "message": "Participante sem valor positivo na divisão."
                })

        if issues:
            return {
                "status": "warning",
                "message": "Foram identificados possíveis problemas de inclusão.",
                "issues": issues
            }

        return {
            "status": "ok",
            "message": "Todos os participantes possuem valores positivos na divisão.",
            "issues": []
        }
