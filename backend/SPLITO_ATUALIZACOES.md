# Atualizações do Splito

## O que mudou

- O Splito passou a usar o endpoint OpenAI-compatible do Cloudflare Workers AI (`/ai/v1/chat/completions`), necessário para o protocolo de Function Calling.
- O prompt foi reorganizado para definir personalidade, estilo, limites de segurança e uso correto dos dados financeiros.
- O backend passou a disponibilizar três ferramentas somente de leitura:
  - `consultar_fluxo_caixa`: saldo e projeção de 1 a 90 dias.
  - `analisar_com_agentes`: executa os agentes determinísticos Cash, Forecast e Tax, sem disparar uma segunda chamada de IA.
  - `consultar_movimentacoes`: consulta recebimentos, despesas e lançamentos manuais.
- As ferramentas sempre recebem o `usuario_id` da sessão autenticada. O modelo não recebe permissão para escolher outro usuário.
- As conversas e mensagens são persistidas no PostgreSQL e isoladas por usuário.
- Foram adicionadas rotas para listar conversas e recuperar mensagens.

## Migração

Depois de publicar o código, execute:

```bash
alembic upgrade head
```

A migração `0007_memoria_splito` cria `conversas_assistente` e `mensagens_assistente`.

## Contrato atualizado do chat

`POST /api/v1/assistente/conversar`

Primeira mensagem:

```json
{
  "mensagem": "Como está meu fluxo de caixa?"
}
```

A resposta inclui `conversa_id`. O frontend deve guardar esse identificador durante a conversa.

Mensagens seguintes:

```json
{
  "mensagem": "E qual será meu menor saldo?",
  "conversa_id": 1
}
```

O backend recupera o histórico do banco. O campo antigo `historico` continua aceito temporariamente para compatibilidade de payload, mas não é usado como fonte de memória confiável.

## Recuperar conversas

- `GET /api/v1/assistente/conversas`: lista até 50 conversas do usuário autenticado.
- `GET /api/v1/assistente/conversas/{conversa_id}`: retorna as mensagens de uma conversa pertencente ao usuário autenticado.

## Observações importantes

- A integração de Function Calling exige que o token Cloudflare tenha permissão Workers AI.
- As ferramentas implementadas não alteram lançamentos, saldos, pagamentos ou transferências.
- A projeção financeira usa a alíquota demonstrativa padrão de 6% já usada pelo módulo atual; isso não substitui cálculo tributário individual.
- O frontend precisa armazenar o `conversa_id` retornado e enviá-lo nas próximas mensagens para manter a continuidade da conversa.
- Os testes automatizados não puderam ser executados neste ambiente porque a dependência `pwdlib` do projeto não está instalada. A compilação sintática dos arquivos Python foi validada.
