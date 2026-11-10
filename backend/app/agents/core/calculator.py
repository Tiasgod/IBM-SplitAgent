
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation

CENT = Decimal("0.01")


def to_decimal(value):
    """Converte valores para Decimal com segurança."""
    try:
        number = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        raise ValueError("Valor monetário inválido.")

    if not number.is_finite():
        raise ValueError("O valor deve ser um número finito.")

    return number


def calculate_split(total, participants):
    """Divide um valor igualmente ou proporcionalmente."""

    total = to_decimal(total)

    if total < 0:
        raise ValueError("O total não pode ser negativo.")

    total = total.quantize(CENT, rounding=ROUND_HALF_UP)

    if not isinstance(participants, list) or not participants:
        raise ValueError("Informe pelo menos um participante.")

    weights = []

    for participant in participants:
        if not isinstance(participant, dict):
            raise ValueError("Participante inválido.")

        if not isinstance(participant.get("name"), str) or not participant["name"].strip():
            raise ValueError("Todo participante precisa ter um nome.")

        weight = participant.get("weight")

        if weight is None:
            weights.append(None)
        else:
            weight = to_decimal(weight)

            if weight <= 0:
                raise ValueError("O peso deve ser maior que zero.")

            weights.append(weight)

    if any(w is None for w in weights) and not all(w is None for w in weights):
        raise ValueError("Informe o peso de todos ou de nenhum participante.")

    if all(w is None for w in weights):
        weights = [Decimal("1")] * len(participants)

    total_weight = sum(weights)
    shares = []
    remaining = total

    for index, participant in enumerate(participants):
        if index == len(participants) - 1:
            amount = remaining
        else:
            amount = (total * weights[index] / total_weight).quantize(
                CENT, rounding=ROUND_HALF_UP
            )
            remaining -= amount

        shares.append({
            "name": participant["name"].strip(),
            "amount": amount
        })

    return shares


def detect_rounding_error(shares, total):
    """Verifica se a diferença ultrapassa um centavo."""

    total = to_decimal(total)
    distributed = sum(
        (to_decimal(share["amount"]) for share in shares),
        Decimal("0")
    )

    return abs(total - distributed) > CENT


def validate_split(transaction):
    """Valida se a divisão corresponde ao valor original."""

    if not isinstance(transaction, dict):
        return False

    try:
        return not detect_rounding_error(
            transaction["shares"],
            transaction["total"]
        )
    except (KeyError, TypeError, ValueError):
        return False
