# SplitAgent — Back-End

API REST do SplitAgent (equipe ThreeValley): fluxo de caixa e inteligência financeira para pequenos negócios.
O Front-End (PWA) consome esta API.

> **Estado atual:** Etapa 1 (saúde da API) + cards **B03** (modelo e importação da planilha Excel) e
> **B04** (movimentações financeiras). Cálculos (B05/B06), autenticação (B02) e agentes de IA ainda **não** existem.
> Enquanto o B02 não for feito, os endpoints de dados só funcionam com `USUARIO_DEV_ID` definido (ver "Autenticação provisória").

## API
https://ibm-splitagent-back-end-production.up.railway.app/docs#/

## Tecnologias
Python 3.12, FastAPI, Uvicorn, PostgreSQL (Neon), SQLAlchemy, Alembic, Pydantic, openpyxl, Pytest. Deploy no Railway.

## Estrutura
```text
app/
  main.py                 # criação da aplicação, CORS, handlers de erro e routers
  core/                   # config, banco, erros padronizados, segurança provisória
  api/                    # routers: health, importacoes, movimentacoes
  schemas/                # validação Pydantic (entrada e saída)
  models/                 # tabelas SQLAlchemy
  services/               # regras de negócio (planilha, importação, movimentações)
  repositories/           # acesso ao banco
  agents/                 # agentes de IA (ainda não implementados)
alembic/                  # migrações do banco
tests/                    # testes automatizados
```

## Rodar localmente
Requisito: Python 3.12.

```bash
python -m venv .venv
source .venv/bin/activate        # Windows (PowerShell): .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # Windows: copy .env.example .env  -> edite com a sua DATABASE_URL
alembic upgrade head             # cria as tabelas no banco (veja "Migrações")
uvicorn app.main:app --reload
```
Swagger: http://127.0.0.1:8000/docs

## Migrações (Alembic)
As tabelas **não** são criadas ao iniciar a API. Rode as migrações manualmente:

```bash
alembic upgrade head      # aplica as migrações pendentes
alembic current           # mostra a versão atual do banco
alembic downgrade -1      # desfaz a última (APAGA as tabelas dessa migração: use só em desenvolvimento)
```
Para o Neon, coloque em `DATABASE_URL_DIRECT` a URL **sem** `-pooler` (as migrações usam ela; a API usa `DATABASE_URL`).
Para aplicar no banco de produção, rode `alembic upgrade head` na sua máquina com o `.env` apontando para o Neon.

## Autenticação provisória
O card B02 (cadastro e login) ainda não foi implementado. Por isso:
- Com `USUARIO_DEV_ID=1` no `.env`, todos os dados pertencem a um único usuário de desenvolvimento.
- Sem essa variável, `/api/v1/importacoes` (POST e `/atual`) e `/api/v1/movimentacoes` respondem **501**.
- O download do modelo (`GET /api/v1/importacoes/modelo`) não exige usuário.
- Todas as consultas já filtram por `usuario_id`; quando o B02 existir, basta trocar a função `get_usuario_atual_id` em `app/core/seguranca.py`.
- **Não deixe `USUARIO_DEV_ID` ligado em um deploy público** com dados reais.

## Planilha modelo (card B03)
Baixe em `GET /api/v1/importacoes/modelo`. Abas e colunas (obrigatórias, exceto onde indicado):

| Aba | Colunas |
|---|---|
| Instruções | Explica como preencher |
| Saldo inicial | Data de referência, Saldo disponível (R$): **uma** linha; o saldo pode ser negativo |
| Vendas | Data, Descrição, Valor bruto (R$), Tipo de venda (Pix, Cartão de crédito, Cartão de débito, Boleto, Dinheiro, Outro) |
| Recebíveis | Data prevista, Valor esperado (R$), Descrição (opcional) |
| Despesas | Descrição, Vencimento, Valor (R$) |

**Regra de impostos:** vendas e recebíveis são informados em valor **bruto**. O sistema estima o tributo uma única vez, nos
cálculos, para nunca descontar imposto duas vezes. *(Decisão proposta; confirme com o time.)*

**Regras de preenchimento:** datas `dd/mm/aaaa` (anos de 2000 a 2100); valores em reais, aceitando texto como `R$ 1.234,56`,
arredondados a 2 casas; valores de vendas, recebíveis e despesas maiores que zero; descrição até 200 caracteres; linhas totalmente
vazias são ignoradas; nomes de abas e cabeçalhos são comparados sem acento e sem diferenciar maiúsculas; a ordem das colunas é livre.
Limites: `.xlsx` de até 5 MB e 5.000 linhas preenchidas por aba (configuráveis).

**Importação:** `POST /api/v1/importacoes` (multipart, campo `arquivo`).
- Tudo ou nada: se houver qualquer erro, **nada é salvo** e a resposta é `422` com a lista de problemas.
- Se já existe uma planilha importada, a resposta é `409`, a menos que se envie `?substituir=true`, que autoriza trocar os dados
  antigos pelos novos. Uma planilha inválida **nunca** apaga os dados existentes.

Exemplo de resposta de erro (`422`):
```json
{
  "mensagem": "Encontramos 2 problemas na planilha. Corrija e envie novamente.",
  "erros": [
    {"aba": "Vendas", "linha": 3, "coluna": "Valor bruto (R$)", "mensagem": "O valor deve ser maior que zero."},
    {"aba": "Despesas", "linha": 2, "coluna": "Vencimento", "mensagem": "Campo obrigatório vazio."}
  ],
  "total_erros": 2,
  "erros_truncados": false
}
```
`linha` é a linha do Excel (a linha 1 é o cabeçalho). São listados até 200 erros.

## Movimentações financeiras (card B04)
As movimentações são derivadas da planilha ativa: **entradas** são recebíveis (pela data prevista) e **saídas** são despesas (pelo vencimento). Vendas já realizadas ficam separadas para evitar contar a mesma receita novamente quando houver recebíveis correspondentes. Todas as consultas são isoladas por usuário e ordenadas cronologicamente.

- `GET /api/v1/movimentacoes`: consulta unificada; aceita `data_inicio` (padrão: hoje, fuso `America/Sao_Paulo`), `data_fim`, `tipo` (`entrada` ou `saida`), `limite` (1–500) e `offset`.
- `GET /api/v1/movimentacoes/entradas`: consulta específica de entradas com descrição, data, valor e origem.
- `GET /api/v1/movimentacoes/saidas`: consulta específica de saídas com descrição, data, valor e origem.
- `GET /api/v1/movimentacoes/analise`: conjunto normalizado para cálculos financeiros e consumo pelo SplitAgent. Por padrão considera todo o intervalo aceito pela planilha (2000–2100) e retorna totais, saldo líquido (entradas menos saídas), movimentos ordenados e consolidação diária. Aceita `data_inicio` e `data_fim` para limitar o período.

As respostas incluem `total_itens`, `total_entradas` e `total_saidas` do filtro inteiro (não só da página). Valores monetários são serializados como texto decimal (ex.: `"1234.50"`) para preservar precisão. A rota `/analise` é uma interface de dados para os módulos de cálculo e o futuro agente; os agentes de IA ainda precisam ser conectados a essa rota/serviço separadamente.

## Endpoints
| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | A API está no ar |
| GET | `/health/db` | A API consegue falar com o PostgreSQL |
| GET | `/api/v1/importacoes/modelo` | Baixa a planilha modelo |
| POST | `/api/v1/importacoes` | Envia a planilha e importa os dados |
| GET | `/api/v1/importacoes/atual` | Resumo da planilha importada |
| GET | `/api/v1/movimentacoes` | Próximas entradas e saídas |
| GET | `/api/v1/movimentacoes/entradas` | Consulta de entradas |
| GET | `/api/v1/movimentacoes/saidas` | Consulta de saídas |
| GET | `/api/v1/movimentacoes/analise` | Dados consolidados para cálculos e SplitAgent |

## Banco no Neon
1. Crie um projeto no [Neon](https://neon.tech) e, no painel, abra **Connect**.
2. Para a aplicação use a URL com **pooler** (host com `-pooler`) em `DATABASE_URL`; para as migrações, a URL direta em `DATABASE_URL_DIRECT`.
3. Mantenha `sslmode=require`. A aplicação aceita `postgresql://` e `postgres://` e ajusta o driver sozinha.
4. O Neon suspende o banco quando ocioso: o primeiro acesso depois de um tempo parado pode demorar alguns segundos.

## Deploy no Railway
1. Suba o projeto para o GitHub (sem o `.env`).
2. No Railway: **New Project → Deploy from GitHub repo**.
3. Em **Variables**, cadastre `DATABASE_URL`, `ENVIRONMENT=production` e `CORS_ORIGINS` (URL do Front-End). Opcional: `DOCS_ENABLED=false`.
4. O `railway.json` já define o comando de início (`--host 0.0.0.0 --port $PORT`) e o healthcheck em `/health`.
5. Antes do primeiro uso, aplique as migrações no Neon (`alembic upgrade head`, rodando na sua máquina).
6. **Settings → Networking**: gere um domínio. **Deployments → View logs**: acompanhe o build e a execução.
7. Teste `https://SEU-DOMINIO/health` e `/health/db`; ambos devem responder `200`.
8. Sem `USUARIO_DEV_ID`, os endpoints de dados respondem 501 no Railway, o que é o esperado até o card B02.

## Testes
```bash
pytest
```
Os testes não usam o `.env` nem o Neon: usam SQLite temporário e conexões inválidas.

## Acesso e conta (B02)

A API inclui cadastro, login por e-mail ou CPF/CNPJ, logout com revogação de sessão, recuperação de senha e login opcional com Google OAuth.

### Instalação e migração

```bash
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Endpoints

- `POST /api/v1/acesso/cadastro` — `{ "nome": "Nome Sobrenome", "documento": "52998224725", "email": "pessoa@example.com", "senha": "uma-senha-forte" }`
- `GET /api/v1/acesso/me` — consulta a conta autenticada; exige `Authorization: Bearer <access_token>`.
- `PUT /api/v1/acesso/me` — atualiza um ou mais campos do perfil (`nome`, `documento`, `email`); exige autenticação e impede e-mail/documento duplicado.
- `DELETE /api/v1/acesso/me` — desativa a conta autenticada, revoga as sessões e invalida tokens de recuperação; preserva o histórico financeiro.
- `POST /api/v1/acesso/login` — `{ "identificador": "pessoa@example.com", "senha": "uma-senha-forte" }`; `identificador` também aceita CPF/CNPJ.
- `POST /api/v1/acesso/logout` — enviar `Authorization: Bearer <access_token>`.
- `POST /api/v1/acesso/recuperar-senha` — `{ "email": "pessoa@example.com" }`.
- `POST /api/v1/acesso/redefinir-senha` — `{ "token": "token-recebido", "nova_senha": "outra-senha-forte" }`.
- `POST /api/v1/acesso/google` — `{ "credential": "ID_TOKEN_DO_GOOGLE" }`; o front-end deve obter a credencial via Google Identity Services. Configure `GOOGLE_CLIENT_ID` com o Client ID Web.

As senhas locais são armazenadas com hash Argon2 via `pwdlib` (nunca em texto puro); contas Google não armazenam senha local. O endpoint de usuário não devolve CPF/CNPJ nem hash de senha. Tokens de sessão e de recuperação são aleatórios e somente seus hashes são persistidos. Tokens de sessão e de recuperação são aleatórios e somente seus hashes são persistidos. Sessões expiram em 12 horas; tokens de recuperação expiram em 30 minutos, são de uso único e redefinir a senha revoga as sessões existentes.

Em ambiente diferente de `production`, o endpoint de recuperação inclui `token_desenvolvimento` para facilitar testes locais. Em produção, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` e `FRONTEND_RESET_URL`; a API envia um link por e-mail e nunca retorna o token na resposta. A resposta é genérica para não revelar se um e-mail está cadastrado. O front-end deve ler o parâmetro `token` do link e enviá-lo a `/api/v1/acesso/redefinir-senha`.

**Produção:** defina `ENVIRONMENT=production`, remova `USUARIO_DEV_ID` do ambiente e execute `alembic upgrade head`. Os endpoints financeiros exigem `Authorization: Bearer <access_token>`; o usuário fixo de desenvolvimento só é aceito fora de produção. CPF/CNPJ é normalizado para dígitos e tem tamanho/formato básico verificado; para validação de dígitos verificadores conforme regras fiscais, adicione validador específico antes de usar como verificação de identidade.


### Google OAuth e proteção de dados

1. No Google Cloud Console, configure a tela de consentimento e crie uma credencial OAuth Client ID do tipo Aplicativo da Web. Cadastre as origens autorizadas do front-end e configure `GOOGLE_CLIENT_ID` no ambiente da API.
2. No front-end, use Google Identity Services e envie o ID token retornado como `credential` para `POST /api/v1/acesso/google`. A API valida assinatura, emissor, validade e audiência usando a biblioteca oficial `google-auth`; não aceite apenas nome/e-mail enviados pelo cliente.
3. Execute `alembic upgrade head` para aplicar a migração `0003`. Contas criadas via Google podem não ter CPF/CNPJ cadastrado; solicite o documento em etapa posterior se o produto exigir.
4. Em produção, use HTTPS, mantenha `.env` fora do Git, limite acesso ao banco, use conexão PostgreSQL com TLS (`sslmode=require`) e defina permissões mínimas. O CPF/CNPJ é dado pessoal: não o inclua em logs ou respostas desnecessárias. A criptografia do disco/backup deve ser habilitada no provedor do banco.


## Cálculos financeiros — Visão geral e fluxo de caixa

Endpoints autenticados (todos os valores monetários são retornados com precisão decimal):

- `GET /api/v1/calculos-financeiros/visao-geral`: total vendido no período (padrão: mês atual até hoje), tributos estimados, valor líquido das vendas, saldo atual, menor saldo previsto nos próximos 30 dias, situação do caixa e períodos abaixo do mínimo. Aceita `data_inicio`, `data_fim`, `aliquota_tributaria_percentual` (padrão ilustrativo de 6%) e `saldo_minimo` (padrão R$ 0,00).
- `GET /api/v1/calculos-financeiros/fluxo-caixa`: projeção diária para os próximos 30 dias com saldo, entradas brutas, tributos estimados, entradas líquidas e saídas. Aceita `aliquota_tributaria_percentual` e `saldo_minimo`.

**Premissas:** vendas e recebíveis da planilha são informados em valor bruto. A estimativa tributária usa a alíquota enviada na requisição (6% por padrão apenas como estimativa técnica; não representa orientação fiscal). A projeção usa recebíveis futuros líquidos de tributos estimados e despesas por vencimento, evitando contar vendas e recebíveis como duas entradas distintas. O saldo atual é estimado a partir do saldo inicial importado, somando recebíveis com data posterior à referência e até hoje líquidos da alíquota estimada, menos despesas do mesmo intervalo. Como o modelo atual não registra confirmação de pagamento/recebimento, movimentos vencidos são tratados como realizados para essa estimativa; para precisão contábil, o modelo deverá distinguir valores pagos/recebidos de valores apenas previstos.

A situação é `critica` quando o menor saldo previsto fica negativo, `atencao` quando fica abaixo do mínimo configurado mas não negativo, e `saudavel` nos demais casos. Não é necessária migração de banco para esses endpoints.

## Simulador financeiro

O endpoint `POST /api/v1/simulador/simular` recebe uma venda ou despesa hipotética e devolve uma comparação entre a projeção original e a projeção simulada para 30 dias. A simulação não persiste dados nem modifica movimentações existentes. É necessário enviar um token de autenticação.

Exemplo de corpo para simular uma venda:

```json
{
  "tipo": "venda",
  "descricao": "Venda hipotética",
  "data": "2026-10-30",
  "valor": "1500.00",
  "aliquota_tributaria_percentual": "6.00",
  "saldo_minimo": "500.00"
}
```

Para simular uma despesa, use `"tipo": "despesa"`. A data deve estar entre hoje e os próximos 30 dias. A alíquota é aplicada somente às vendas e representa uma estimativa simplificada, não apuração fiscal.

## Histórico de decisões do simulador

O histórico persiste as decisões confirmadas pelo usuário, separadas por conta. A simulação por si só continua sem gravar dados; quando o usuário decidir registrar uma decisão, o front-end deve enviar a recomendação exibida, a escolha feita e o resultado projetado.

- `POST /api/v1/simulador/decisoes` — registra uma decisão; a data/hora é definida automaticamente pelo banco.
- `GET /api/v1/simulador/decisoes` — lista da mais recente para a mais antiga. Retorna `total`, `estado_vazio` e `decisoes`; quando não há registros, `estado_vazio` é `true` e `decisoes` é `[]`, permitindo exibir o estado vazio na interface.
- `GET /api/v1/simulador/decisoes/{id}` — consulta uma decisão específica. Uma decisão de outro usuário não é revelada e retorna 404.

Exemplo de corpo para registrar uma decisão:

```json
{
  "recomendacao": "Adiar a compra para manter o caixa acima do mínimo",
  "escolha_usuario": "Adiar compra por 15 dias",
  "resultado_projetado": {
    "menor_saldo_original": "450.00",
    "menor_saldo_simulado": "950.00",
    "situacao_simulada": "saudavel",
    "data_menor_saldo_simulado": "2026-11-05"
  }
}
```

Após atualizar o código, aplique a nova migração no ambiente configurado com `alembic upgrade head`. Não é necessário alterar manualmente as tabelas existentes.

## Lançamentos financeiros manuais

A API mantém dois caminhos independentes de entrada de dados:

- **Planilha:** `POST /api/v1/importacoes` continua importando os dados XLSX e a opção `substituir=true` substitui somente os dados da importação anterior.
- **Manual:** endpoints em `Lançamentos manuais` gravam em tabelas próprias (`saldos_manuais` e `movimentacoes_manuais`). A substituição de uma planilha não apaga esses registros.

Todos os endpoints manuais exigem `Authorization: Bearer <token>` e isolam os registros pelo usuário autenticado.

### Saldo manual

- `POST /api/v1/saldo-inicial` — cria ou atualiza o saldo para a data de referência (um registro por usuário/data).
- `GET /api/v1/saldo-inicial` — lista saldos do usuário.
- `PUT /api/v1/saldo-inicial/{saldo_id}` — atualiza um saldo.
- `DELETE /api/v1/saldo-inicial/{saldo_id}` — exclui um saldo.

Exemplo: `{"data_referencia":"2026-10-30","saldo":15000.00}`

### Movimentações manuais

- `POST /api/v1/movimentacoes/manuais` — cadastra entrada ou saída.
- `GET /api/v1/movimentacoes/manuais` — lista lançamentos manuais.
- `GET /api/v1/movimentacoes/manuais/{movimentacao_id}` — consulta um lançamento.
- `PUT /api/v1/movimentacoes/manuais/{movimentacao_id}` — atualiza um lançamento.
- `DELETE /api/v1/movimentacoes/manuais/{movimentacao_id}` — exclui um lançamento.

Exemplo: `{"data":"2026-11-05","descricao":"Pagamento fornecedor","valor":3500.00,"tipo":"saida","categoria":"fornecedores"}`

As movimentações manuais também são consolidadas nas consultas financeiras existentes. Valores manuais são considerados líquidos e não recebem nova estimativa tributária; a tributação já existente continua aplicada aos recebíveis importados.

Após atualizar o código, aplique a migração com `alembic upgrade head`.

## Lançamentos financeiros manuais

A API mantém dois caminhos independentes de entrada de dados:

- **Planilha:** `POST /api/v1/importacoes` continua importando XLSX. `substituir=true` substitui somente os dados da importação anterior.
- **Manual:** endpoints em `Lançamentos manuais` gravam em tabelas próprias (`saldos_manuais` e `movimentacoes_manuais`). A substituição de uma planilha não apaga esses registros.

Todos os endpoints manuais exigem `Authorization: Bearer <token>` e isolam os registros pelo usuário autenticado.

### Saldo manual
- `POST /api/v1/saldo-inicial` — cria ou atualiza o saldo para a data de referência (um registro por usuário/data).
- `GET /api/v1/saldo-inicial` — lista saldos do usuário.
- `PUT /api/v1/saldo-inicial/{saldo_id}` — atualiza um saldo.
- `DELETE /api/v1/saldo-inicial/{saldo_id}` — exclui um saldo.

Exemplo: `{"data_referencia":"2026-10-30","saldo":15000.00}`

### Movimentações manuais
- `POST /api/v1/movimentacoes/manuais` — cadastra entrada ou saída.
- `GET /api/v1/movimentacoes/manuais` — lista lançamentos manuais.
- `GET /api/v1/movimentacoes/manuais/{movimentacao_id}` — consulta um lançamento.
- `PUT /api/v1/movimentacoes/manuais/{movimentacao_id}` — atualiza um lançamento.
- `DELETE /api/v1/movimentacoes/manuais/{movimentacao_id}` — exclui um lançamento.

Exemplo: `{"data":"2026-11-05","descricao":"Pagamento fornecedor","valor":3500.00,"tipo":"saida","categoria":"fornecedores"}`

As movimentações manuais também são consolidadas nas consultas financeiras existentes. Valores manuais são considerados líquidos e não recebem nova estimativa tributária; a tributação continua aplicada aos recebíveis importados.

Após atualizar o código, aplique a migração com `alembic upgrade head`.


## Integração dos agentes e IBM watsonx.ai

Os agentes determinísticos estão integrados em `app/agents/`. Eles executam validações e cálculos localmente no processo FastAPI; o serviço financeiro continua sendo a fonte dos dados consolidados do PostgreSQL (importações e lançamentos manuais). A integração generativa é opcional e usa IBM watsonx.ai para interpretar indicadores, sem alterar valores calculados.

### Variáveis opcionais do IBM watsonx.ai

Configure no ambiente (por exemplo, Railway):

- `WATSONX_API_KEY`: API key do IBM Cloud IAM.
- `WATSONX_PROJECT_ID`: Project ID do projeto watsonx.ai.
- `WATSONX_URL`: URL regional, padrão `https://us-south.ml.cloud.ibm.com`.
- `WATSONX_MODEL_ID`: modelo, padrão `ibm/granite-3-3-8b-instruct`.
- `WATSONX_API_VERSION`: versão da API, padrão `2024-05-31`.
- `WATSONX_TIMEOUT_SECONDS`: timeout, padrão `45`.

Sem credenciais, os endpoints determinísticos continuam funcionando e a resposta informa `ia_generativa.status = nao_configurada`. Nunca coloque API keys no GitHub ou no código.

### Endpoints novos

Todos ficam sob `/api/v1` e exigem autenticação Bearer:

- `GET /agentes/financeiro/analisar`: integra Cash, Forecast e indicadores tributários com a projeção financeira já consolidada. Parâmetros: `aliquota_tributaria_percentual`, `saldo_minimo`, `horizonte_dias` (1 a 90) e `incluir_ia`.
- `POST /agentes/split-payment/simular`: valida participantes, calcula divisão e verifica inclusão.
- `POST /agentes/credito/analisar`: verifica limite disponível com os valores informados; não é análise bancária nem aprovação de crédito.
- `POST /agentes/tributos/estimar`: estimativa matemática com alíquota fornecida; não substitui apuração fiscal.

A rota financeira usa a autenticação existente para limitar as consultas ao usuário atual. A IA recebe apenas indicadores agregados, não credenciais, identificadores pessoais ou a lista detalhada de movimentações.
