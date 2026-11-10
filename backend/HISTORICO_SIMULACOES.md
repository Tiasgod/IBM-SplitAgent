# Histórico de simulações

## Comportamento

- `POST /api/v1/simulador/simular` calcula a projeção, grava os parâmetros e o resultado no histórico e retorna o resultado com `id` e `criado_em`.
- O registro histórico não altera vendas, recebíveis, despesas, saldos ou lançamentos manuais.
- `GET /api/v1/simulador/simulacoes` lista somente simulações do usuário autenticado.
- `GET /api/v1/simulador/simulacoes/{simulacao_id}` consulta uma simulação do usuário autenticado.
- O endpoint antigo `/api/v1/simulador/decisoes` deixou de ser registrado. A tabela antiga `decisoes_simulador` é mantida pela migração para não apagar dados históricos existentes.

## Migração

Após publicar o código, executar `alembic upgrade head`. A migração `0006_historico_simulacoes` cria a tabela `simulacoes_historico`.

## Integração financeira

O cálculo continua combinando as fontes importadas (`saldos_iniciais`, `recebiveis`, `despesas` e `vendas`) com os lançamentos manuais (`saldos_manuais` e `movimentacoes_manuais`). O saldo-base é o registro mais recente entre saldo importado e saldo manual; em caso de mesma data, prevalece o saldo manual. Lançamentos manuais não dependem de importação de planilha.
