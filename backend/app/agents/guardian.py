
from app.agents.core.calculator import to_decimal


class GuardianAgent:
    """
    Agente responsável por validar os dados
    e identificar inconsistências nas transações.
    """

    def process(self, transaction):
        errors = []

        if not isinstance(transaction, dict):
            return {
                "status": "error",
                "errors": ["INVALID_TRANSACTION"]
            }

        # Regra 1: verificar campos obrigatórios
        if "total" not in transaction or "participants" not in transaction:
            errors.append("MISSING_FIELD")

        if errors:
            return {
                "status": "error",
                "errors": errors
            }

        # Regra 2: verificar o valor total
        try:
            total = to_decimal(transaction["total"])

            if total < 0:
                errors.append("INVALID_TOTAL")

        except (ValueError, TypeError):
            errors.append("INVALID_TOTAL")

        # Regra 3: verificar participantes
        participants = transaction["participants"]

        if not isinstance(participants, list) or not participants:
            errors.append("INVALID_PARTICIPANTS")
            participants = []

        names = []
        weights = []

        for participant in participants:
            if not isinstance(participant, dict):
                errors.append("INVALID_PARTICIPANTS")
                continue

            name = participant.get("name")

            if not isinstance(name, str) or not name.strip():
                errors.append("INVALID_PARTICIPANTS")
                continue

            names.append(name.strip().casefold())

            weight = participant.get("weight")

            if weight is not None:
                try:
                    weight = to_decimal(weight)

                    if weight <= 0:
                        errors.append("INVALID_WEIGHT")

                    weights.append(weight)

                except (ValueError, TypeError):
                    errors.append("INVALID_WEIGHT")

            else:
                weights.append(None)

        # Regra 4: identificar participantes duplicados
        if len(names) != len(set(names)):
            errors.append("DUPLICATE_PARTICIPANT")

        # Regra 5: verificar consistência dos pesos
        if weights and any(w is None for w in weights):
            if not all(w is None for w in weights):
                errors.append("INVALID_WEIGHT")

        # Remover erros repetidos
        errors = list(dict.fromkeys(errors))

        if errors:
            return {
                "status": "error",
                "errors": errors
            }

        return {
            "status": "ok",
            "message": "Transação validada com sucesso.",
            "errors": []
        }
