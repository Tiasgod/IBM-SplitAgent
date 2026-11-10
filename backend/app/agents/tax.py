
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation


class TaxAgent:
    """
    Agente responsável por estimar tributos de uma transação.

    Os valores são simulações demonstrativas,
    não cálculos fiscais oficiais.
    """

    WARNING_MESSAGE = (
        "SIMULAÇÃO — não substitui consultoria fiscal."
    )

    DEFAULT_RATES = {
        "service": {
            "simples": {"ISS": "0.05"},
            "presumido": {"ISS": "0.05"},
            "real": {"ISS": "0.05"}
        },
        "product": {
            "simples": {"TRIBUTO_DEMONSTRATIVO": "0.08"},
            "presumido": {"TRIBUTO_DEMONSTRATIVO": "0.08"},
            "real": {"TRIBUTO_DEMONSTRATIVO": "0.08"}
        },
        "transfer": {
            "simples": {},
            "presumido": {},
            "real": {}
        }
    }

    def __init__(self, rates=None):
        # Permite configurar as alíquotas sem alterar a lógica.
        self.rates = rates if rates is not None else self.DEFAULT_RATES

    def process_with_rate(self, total, rate_percent, description="alíquota informada"):
        """Estima tributo com uma alíquota explicitamente fornecida pela API.

        Não associa a alíquota a um regime tributário nem substitui apuração fiscal.
        """
        try:
            value = Decimal(str(total))
            rate = Decimal(str(rate_percent))
            if (not value.is_finite() or value < 0 or not rate.is_finite()
                    or rate < 0 or rate > 100):
                raise ValueError()
            value = value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            amount = (value * rate / Decimal("100")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            return {
                "status": "warning",
                "message": "Estimativa demonstrativa realizada.",
                "base_calculo": format(value, ".2f"),
                "aliquota_percentual": format(rate, ".2f"),
                "descricao_aliquota": description,
                "tributos_estimados": format(amount, ".2f"),
                "valor_liquido_estimado": format(value - amount, ".2f"),
                "aviso": self.WARNING_MESSAGE,
            }
        except (InvalidOperation, ValueError, TypeError):
            return {"status": "error", "message": "Base ou alíquota tributária inválida."}

    def process(self, transaction):

        if not isinstance(transaction, dict):
            return {
                "status": "error",
                "message": "Transação inválida."
            }

        total = transaction.get("total")
        tax_context = transaction.get("tax_context")

        # Verifica se os dados necessários foram informados.
        if total is None or not isinstance(tax_context, dict):
            return {
                "status": "warning",
                "message": "Dados insuficientes para estimar os tributos.",
                "warning": self.WARNING_MESSAGE
            }

        transaction_type = tax_context.get("transaction_type")
        tax_profile = tax_context.get("tax_profile")

        if transaction_type not in ("service", "product", "transfer"):
            return {
                "status": "error",
                "message": "Tipo de transação inválido."
            }

        if tax_profile not in ("simples", "presumido", "real"):
            return {
                "status": "error",
                "message": "Perfil tributário inválido."
            }

        try:
            total = Decimal(str(total))

            if not total.is_finite() or total < 0:
                raise ValueError()

            total = total.quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP
            )

        except (InvalidOperation, ValueError, TypeError):
            return {
                "status": "error",
                "message": "Valor total inválido."
            }

        try:
            configured_taxes = self.rates[transaction_type][tax_profile]

            estimated_taxes = []
            total_taxes = Decimal("0.00")

            for tax_name, rate_value in configured_taxes.items():

                rate = Decimal(str(rate_value))

                if not rate.is_finite() or rate < 0 or rate > 1:
                    raise ValueError("Alíquota inválida.")

                amount = (total * rate).quantize(
                    Decimal("0.01"),
                    rounding=ROUND_HALF_UP
                )

                total_taxes += amount

                estimated_taxes.append({
                    "name": tax_name,
                    "rate": format(rate * 100, ".2f") + "%",
                    "amount": format(amount, ".2f")
                })

            net_total = total - total_taxes

            return {
                "status": "warning",
                "message": "Estimativa tributária realizada.",
                "warning": self.WARNING_MESSAGE,
                "transaction_type": transaction_type,
                "tax_profile": tax_profile,
                "estimated_taxes": estimated_taxes,
                "total_taxes": format(total_taxes, ".2f"),
                "net_total": format(net_total, ".2f")
            }

        except (KeyError, InvalidOperation, ValueError, TypeError):
            return {
                "status": "error",
                "message": "Não foi possível calcular a estimativa tributária."
            }
