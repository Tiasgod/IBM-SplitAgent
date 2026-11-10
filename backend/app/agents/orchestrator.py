"""Coordenação dos agentes determinísticos do SplitAgent."""

from app.agents.split_payment import SplitPaymentAgent
from app.agents.guardian import GuardianAgent
from app.agents.tax import TaxAgent
from app.agents.cash import CashAgent
from app.agents.forecast import ForecastAgent
from app.agents.credit import CreditAgent
from app.agents.inclusion import InclusionAgent


class SplitAgentOrchestrator:
    def __init__(self):
        self.split_agent = SplitPaymentAgent()
        self.guardian_agent = GuardianAgent()
        self.tax_agent = TaxAgent()
        self.cash_agent = CashAgent()
        self.forecast_agent = ForecastAgent()
        self.credit_agent = CreditAgent()
        self.inclusion_agent = InclusionAgent()

    def process_split_payment(self, transaction):
        """Executa validação, divisão e inclusão sem exigir dados financeiros."""
        validation = self.guardian_agent.process(transaction)
        if validation.get("status") != "ok":
            return {"status": "error", "message": "A transação não passou pela validação.", "results": {"guardian": validation}}
        split = self.split_agent.process(transaction)
        results = {"guardian": validation, "split_payment": split}
        if split.get("status") == "ok":
            results["inclusion"] = self.inclusion_agent.process({"participants": split["shares"]})
        statuses = [item.get("status") for item in results.values()]
        status = "error" if "error" in statuses else ("warning" if "warning" in statuses else "ok")
        return {"status": status, "message": "Análise de divisão concluída.", "results": results}

    def process_credit(self, transaction):
        return self.credit_agent.process(transaction)

    def process_financial(self, movements, forecast_date, opening_balance, tax_base, tax_rate):
        """Executa Cash, Forecast e Tax sobre dados já consolidados pelo back-end."""
        cash = self.cash_agent.process(movements)
        forecast = self.forecast_agent.process(movements, forecast_date, opening_balance)
        tax = self.tax_agent.process_with_rate(tax_base, tax_rate)
        statuses = [cash.get("status"), forecast.get("status"), tax.get("status")]
        status = "error" if "error" in statuses else ("warning" if "warning" in statuses else "ok")
        return {"status": status, "results": {"cash": cash, "forecast": forecast, "tax": tax}}

    def process(self, transaction):
        """Compatibilidade com a chamada geral anterior; fluxos especializados são preferíveis."""
        if not isinstance(transaction, dict):
            return {"status": "error", "message": "Dados da transação inválidos."}
        if "total" in transaction and "participants" in transaction:
            return self.process_split_payment(transaction)
        if "movements" in transaction and "forecast_date" in transaction:
            return self.process_financial(
                transaction.get("movements", []), transaction["forecast_date"],
                transaction.get("opening_balance", "0.00"),
                transaction.get("tax_base", "0.00"), transaction.get("tax_rate", "0.00")
            )
        if "credit_context" in transaction:
            return self.process_credit(transaction)
        return {"status": "error", "message": "Não foi possível identificar o fluxo de agentes solicitado."}
