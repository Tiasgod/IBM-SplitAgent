# SplitAgent — Inteligência Financeira Agêntica

<p align="center">
  <strong>Inteligência artificial para transformar dados financeiros em decisões mais estratégicas.</strong>
</p>

<p align="center">
  Uma solução baseada em agentes de IA para apoiar empreendedores na compreensão do Split Payment, na análise do fluxo de caixa e na previsão de cenários financeiros.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge" alt="Status do projeto">
  <img src="https://img.shields.io/badge/Frontend-PWA-6C63FF?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA">
  <img src="https://img.shields.io/badge/Backend-Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/AI-Multi--Agent%20System-8A2BE2?style=for-the-badge" alt="Sistema multiagente">
</p>

<p align="center">
  Projeto desenvolvido pela equipe <strong>ThreeValley</strong>, em parceria com a <strong>IBM e o Banco do Brasil</strong>.
</p>

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [A proposta](#a-proposta)
- [Problema que buscamos resolver](#problema-que-buscamos-resolver)
- [Objetivos](#objetivos)
- [Agentes de inteligência artificial](#agentes-de-inteligência-artificial)
- [Funcionalidades previstas](#funcionalidades-previstas)
- [Arquitetura da aplicação](#arquitetura-da-aplicação)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [IBM Bob](#ibm-bob--assistência-ao-desenvolvimento)
- [Comunicação entre frontend e backend](#comunicação-entre-frontend-e-backend)
- [Segurança e governança](#segurança-governança-e-uso-responsável-da-ia)
- [Diferenciais](#diferenciais-do-splitagent)
- [Roadmap](#roadmap)
- [Equipe](#equipe--threevalley)
- [Agradecimentos](#agradecimentos)
- [Contexto do projeto](#contexto-do-projeto)
- [Impacto esperado](#impacto-esperado)
- [Licença](#licença)

---

## Sobre o projeto

O **SplitAgent** é uma solução de inteligência artificial agêntica desenvolvida para apoiar empreendedores na análise e no planejamento financeiro, considerando os desafios relacionados ao Split Payment e à gestão do fluxo de caixa.

A proposta combina agentes especializados de inteligência artificial que trabalham de forma coordenada para analisar informações, identificar possíveis riscos, gerar previsões e fornecer recomendações que auxiliem a tomada de decisão.

A aplicação busca tornar informações financeiras mais compreensíveis e úteis para o empreendedor, contribuindo para um planejamento mais organizado e para uma visão antecipada de possíveis impactos no caixa do negócio.

O projeto utiliza uma arquitetura que separa a interface de usuário da camada de processamento, permitindo que a solução seja acessada pela Web e por dispositivos móveis por meio de uma **Progressive Web App (PWA)**, enquanto o backend é desenvolvido em Python com FastAPI.

---

## A proposta

> **Transformar a complexidade financeira em informações claras, previsões úteis e decisões mais conscientes.**

O SplitAgent parte da ideia de que a gestão financeira não deve se limitar à consulta de números já registrados. Com o apoio da inteligência artificial, é possível analisar cenários, identificar tendências e antecipar situações que merecem atenção.

Em vez de concentrar todas as responsabilidades em um único modelo de IA, a solução organiza o processamento em agentes especializados, coordenados por um agente orquestrador.

Cada agente possui uma responsabilidade específica dentro da arquitetura, contribuindo para uma análise integrada das necessidades do negócio.

---

## Problema que buscamos resolver

A gestão do fluxo de caixa exige atenção constante às entradas, saídas, obrigações financeiras e necessidades futuras de capital.

Ao mesmo tempo, mudanças nos processos de pagamento e recolhimento de tributos podem aumentar a complexidade do planejamento financeiro, especialmente para empreendedores que não dispõem de ferramentas avançadas de análise.

Entre os principais desafios estão:

- Dificuldade para antecipar impactos financeiros no caixa;
- Falta de visibilidade sobre cenários futuros;
- Complexidade na interpretação de informações financeiras e tributárias;
- Dificuldade para identificar riscos antes que se tornem problemas;
- Necessidade de reunir informações para apoiar decisões de crédito e planejamento;
- Barreiras para utilizar ferramentas avançadas de análise financeira.

O SplitAgent busca enfrentar esses desafios por meio de uma experiência integrada, com agentes de IA especializados e informações organizadas para facilitar a compreensão do empreendedor.

---

## Objetivos

### Objetivo geral

Desenvolver uma solução baseada em inteligência artificial agêntica para apoiar a gestão financeira, a análise do fluxo de caixa e a avaliação de cenários relacionados ao Split Payment.

### Objetivos específicos

- Organizar a análise de informações financeiras por meio de agentes especializados;
- Apoiar o acompanhamento e a previsão do fluxo de caixa;
- Auxiliar na identificação de riscos e possíveis necessidades financeiras;
- Facilitar a compreensão de informações fiscais e tributárias;
- Gerar análises e recomendações que apoiem a tomada de decisão;
- Disponibilizar uma interface acessível pela Web e por dispositivos móveis;
- Estruturar uma arquitetura modular, preparada para evoluções futuras.

---

## Agentes de inteligência artificial

A arquitetura do SplitAgent é organizada em agentes especializados, cada um responsável por uma parte do processo de análise.

| Agente | Responsabilidade |
|---|---|
| Orquestrador | Coordena os agentes, organiza as solicitações e direciona o processamento das tarefas. |
| Fiscal / Tributário | Auxilia na análise de informações fiscais e tributárias relevantes ao contexto financeiro. |
| Fluxo de Caixa | Apoia a análise das entradas, saídas e da disponibilidade financeira do negócio. |
| Previsão / Forecast | Auxilia na projeção de cenários futuros com base nas informações disponíveis. |
| Crédito | Apoia a análise de necessidades financeiras e de cenários relacionados ao crédito. |
| Segurança / Guardian | Contribui para a aplicação de controles, verificações e princípios de uso responsável da IA. |
| Inclusão | Busca contribuir para uma experiência mais acessível e compreensível para diferentes perfis de usuários. |

### Como os agentes trabalham em conjunto

O Orquestrador funciona como ponto central de coordenação. A partir de uma solicitação, ele direciona as tarefas pertinentes aos agentes especializados e organiza os resultados para compor uma resposta integrada.

Essa abordagem permite dividir problemas complexos em tarefas menores, respeitando as responsabilidades de cada agente.

O funcionamento definitivo, as ferramentas disponíveis para cada agente e os critérios de encaminhamento serão definidos conforme a implementação técnica da solução.

---

## Funcionalidades previstas

### Análise financeira

- Análise de informações financeiras disponíveis;
- Acompanhamento do fluxo de caixa;
- Identificação de possíveis riscos financeiros;
- Apoio à compreensão dos impactos do Split Payment;
- Organização de informações para auxiliar o planejamento.

### Previsão e planejamento

- Projeção de cenários financeiros;
- Análise de possíveis necessidades futuras de caixa;
- Apoio à avaliação de alternativas;
- Geração de informações para auxiliar decisões estratégicas.

### Inteligência agêntica

- Orquestração de tarefas entre agentes especializados;
- Encaminhamento de solicitações conforme o contexto;
- Consolidação de resultados de diferentes agentes;
- Estrutura modular para evolução das capacidades da solução.

### Experiência de uso

- Interface acessível pela Web;
- Experiência adaptada a dispositivos móveis;
- Comunicação com o backend por meio de uma API;
- Organização das informações para facilitar a interpretação dos resultados.

*As funcionalidades acima representam o escopo proposto para a solução. A disponibilidade de cada recurso dependerá do estágio de implementação.*

---

## Arquitetura da aplicação

O SplitAgent utiliza uma arquitetura modular, separando a interface de usuário, a API e a camada de inteligência artificial.

```text
                       SPLITAGENT
                           |
             +-------------+-------------+
             |                           |
             v                           v
       FRONTEND PWA                  BACKEND
        Web + Mobile              Python + FastAPI
             |                           |
             |       API REST            |
             +---------- HTTP/JSON -------+
                                         |
                                         v
                                ORQUESTRADOR DE IA
                                         |
                   +----------+----------+----------+
                   |          |          |          |
                   v          v          v          v
                Fiscal     Fluxo de   Forecast    Crédito
                /Trib.      Caixa
                   |          |          |          |
                   +----------+----------+----------+
                                         |
                            +------------+------------+
                            |                         |
                            v                         v
                        Guardian                  Inclusão
```

*Representação conceitual da arquitetura. Os mecanismos de comunicação entre agentes, as integrações e a camada de persistência serão detalhados na implementação técnica.*

### Frontend — PWA

A interface será desenvolvida como uma **Progressive Web App (PWA)**, permitindo que a aplicação seja utilizada em navegadores de computadores e dispositivos móveis.

A abordagem PWA permite construir uma experiência responsiva e oferece a possibilidade de instalação da aplicação em dispositivos compatíveis, sem exigir necessariamente a distribuição por uma loja de aplicativos.

### Backend — Python + FastAPI

O backend será desenvolvido em **Python**, utilizando **FastAPI** para disponibilizar os endpoints responsáveis pela comunicação entre o frontend e os serviços da aplicação.

Essa camada será responsável por receber requisições, validar dados, organizar o processamento e integrar as funcionalidades de inteligência artificial.

### Camada de inteligência artificial

A camada agêntica será responsável pela coordenação e execução das tarefas atribuídas aos agentes especializados.

A separação entre os agentes busca facilitar a manutenção, a evolução individual de cada componente e a integração de novas capacidades ao sistema.

---

## Tecnologias utilizadas

### Frontend

<p>
  <img src="https://img.shields.io/badge/Progressive%20Web%20App-PWA-6C63FF?style=flat-square&logo=pwa&logoColor=white" alt="PWA">
  <img src="https://img.shields.io/badge/Web%20%2B%20Mobile-Responsive-444444?style=flat-square" alt="Web e Mobile">
</p>

- Progressive Web App (PWA);
- Interface responsiva para Web e dispositivos móveis.

### Backend

<p>
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI">
</p>

- Python;
- FastAPI;
- APIs REST;
- Comunicação HTTP com dados em JSON.

### Inteligência artificial

- Arquitetura multiagente;
- Orquestração de agentes especializados;
- Análise e consolidação de informações;
- Previsão e apoio à tomada de decisão.

### Ferramentas de desenvolvimento

- IBM Bob;
- Git e GitHub;
- Ferramentas de edição, testes e prototipação definidas pela equipe.

---

## IBM Bob — Assistência ao desenvolvimento

<p align="center">
  <a href="https://www.ibm.com/">
    <img src="https://www.ibm.com/content/dam/connectedassets-adobe-cms/worldwide-content/creative-assets/ibm-bob/ibm-bob.png" width="220" alt="IBM Bob">
  </a>
</p>

O **IBM Bob** é uma ferramenta de inteligência artificial da IBM voltada à assistência no desenvolvimento de software. No contexto do SplitAgent, sua utilização faz parte da experiência de explorar ferramentas de IA aplicadas à construção de soluções tecnológicas.

A ferramenta pode apoiar atividades de programação, análise de código, investigação de erros e elaboração de soluções técnicas, contribuindo para o processo de desenvolvimento.

### Aplicação no SplitAgent

- **Desenvolvimento de software:** assistência na elaboração e evolução do código;
- **Análise técnica:** apoio na investigação de problemas e na avaliação de alternativas;
- **Organização do código:** suporte à estruturação e manutenção dos componentes;
- **Produtividade:** auxílio em tarefas durante o ciclo de desenvolvimento.

O IBM Bob é utilizado como ferramenta de apoio ao trabalho dos desenvolvedores. As decisões de arquitetura, a validação das implementações e a responsabilidade pelo resultado permanecem com a equipe.

---

## Comunicação entre frontend e backend

A comunicação entre as camadas será realizada por meio de uma API desenvolvida com FastAPI.

```text
+---------------------------+
|       FRONTEND PWA        |
|       Web + Mobile        |
+-------------+-------------+
              |
              | Requisição HTTP
              | Dados em JSON
              v
+---------------------------+
|       API FASTAPI         |
| Validação e processamento |
+-------------+-------------+
              |
              v
+---------------------------+
|   ORQUESTRAÇÃO DE AGENTES |
+-------------+-------------+
              |
              v
+---------------------------+
|        AGENTES DE IA      |
| Análise e recomendações   |
+---------------------------+
```

Essa separação permite que a interface e o backend evoluam de maneira independente, mantendo uma comunicação padronizada entre os componentes.

Também facilita a realização de testes, a manutenção da aplicação e a futura integração com serviços externos, conforme os requisitos do projeto.

---

## Segurança, governança e uso responsável da IA

A utilização de inteligência artificial em um contexto financeiro exige atenção à confiabilidade das informações, à proteção dos dados e aos limites das recomendações geradas.

O SplitAgent considera esses aspectos como parte importante de sua concepção.

Entre os princípios relevantes para o desenvolvimento estão:

- Proteção das informações processadas pela aplicação;
- Controle de acesso aos recursos do sistema;
- Validação das informações recebidas;
- Transparência sobre limitações e incertezas das análises;
- Separação de responsabilidades entre os agentes;
- Supervisão das recomendações em contextos financeiros sensíveis;
- Uso responsável das informações para apoiar decisões.

A implementação concreta desses mecanismos será documentada à medida que os controles técnicos forem definidos e desenvolvidos.

---

## Diferenciais do SplitAgent

### Arquitetura multiagente

A divisão das responsabilidades entre agentes especializados permite organizar tarefas distintas e coordenar análises complementares.

### Foco no planejamento financeiro

A solução busca ir além da apresentação de informações históricas, oferecendo apoio à interpretação de cenários e à antecipação de possíveis necessidades financeiras.

### Acessibilidade multiplataforma

A utilização de PWA permite projetar uma experiência consistente para computadores e dispositivos móveis a partir de uma aplicação web.

### Modularidade

A separação dos agentes e das camadas da aplicação facilita a manutenção e permite incorporar novas capacidades conforme a evolução do projeto.

### Apoio à tomada de decisão

O objetivo é transformar os resultados das análises em informações compreensíveis e recomendações úteis, mantendo a decisão final sob responsabilidade do usuário.

---

## Roadmap

O desenvolvimento do SplitAgent está organizado em etapas que podem ser atualizadas conforme as prioridades da equipe.

- [ ] Definição dos requisitos funcionais e não funcionais;
- [ ] Estruturação da arquitetura da aplicação;
- [ ] Desenvolvimento da interface PWA para Web e Mobile;
- [ ] Implementação da API com Python e FastAPI;
- [ ] Definição dos contratos e endpoints da API;
- [ ] Implementação do agente Orquestrador;
- [ ] Desenvolvimento dos agentes especializados;
- [ ] Integração entre frontend, backend e agentes;
- [ ] Implementação dos mecanismos de segurança e governança;
- [ ] Testes unitários e de integração;
- [ ] Validação das análises e previsões;
- [ ] Implantação e documentação da versão demonstrável.

*As etapas deverão ser marcadas como concluídas conforme o progresso real do desenvolvimento.*

---

## Equipe — ThreeValley

<p align="center">
  <table>
    <tr>
      <td align="center" width="25%">
        <a href="https://github.com/Tiasgod">
          <img src="https://avatars.githubusercontent.com/Tiasgod" width="100px" alt="Tiago Pereira Dias">
          <br>
          <strong>Tiago Pereira Dias</strong>
        </a>
        <br>
        <sub>Líder da equipe</sub>
        <br>
        <sub>Engenheiro de IA</sub>
        <br>
        <sub>Back-End</sub>
        <br><br>
        <a href="https://github.com/Tiasgod">
          <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub de Tiago">
        </a>
        &nbsp;
        <a href="https://www.linkedin.com/in/tiagopdias-02-2004-ti/">
          <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn de Tiago">
        </a>
      </td>
      <td align="center" width="25%">
        <strong>Juliana Alves</strong>
        <br>
        <sub>Designer da Solução</sub>
        <br>
        <sub>UI/UX</sub>
      </td>
      <td align="center" width="25%">
        <strong>Vitória Amélia</strong>
        <br>
        <sub>Líder de Pesquisa</sub>
        <br>
        <sub>Front-End</sub>
      </td>
      <td align="center" width="25%">
        <strong>Rafaela Marques</strong>
        <br>
        <sub>Líder Técnica</sub>
        <br>
        <sub>Comunicação</sub>
      </td>
    </tr>
  </table>
</p>

### Mentoria

- Silas Fernandes;
- João Carlos Manozzo Junior.

---

## Agradecimentos

<p align="center">
  <a href="https://www.ibm.com/">
    <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" width="160" alt="IBM">
  </a>
</p>

A equipe **ThreeValley** agradece à **IBM** pela oportunidade de participar desta iniciativa e desenvolver o SplitAgent em um contexto de inovação, tecnologia e inteligência artificial.

A experiência representa uma oportunidade de aplicar conhecimentos técnicos na construção de uma solução voltada a desafios reais, explorar novas possibilidades de desenvolvimento e aprofundar o aprendizado sobre inteligência artificial agêntica.

Agradecemos também pelo contato com ferramentas e recursos que contribuem para o desenvolvimento da solução, incluindo o IBM Bob, que integra a experiência de construção do projeto.

Estendemos nosso agradecimento ao **Banco do Brasil**, parceiro desta iniciativa, pela oportunidade de explorar soluções tecnológicas voltadas à inovação financeira.

Para todos os integrantes da equipe, essa experiência representa não apenas o desenvolvimento de um projeto, mas também uma oportunidade de aprendizado, colaboração e crescimento profissional.

**Obrigado, IBM e Banco do Brasil, por fazerem parte desta jornada!**

---

## Contexto do projeto

O SplitAgent é desenvolvido pela equipe ThreeValley no contexto de uma iniciativa em parceria com a IBM e o Banco do Brasil.

O projeto reúne conceitos de desenvolvimento de software, inteligência artificial agêntica e análise financeira para explorar como agentes especializados podem contribuir para a compreensão de problemas e o apoio ao planejamento de negócios.

A solução tem como objetivo aproximar capacidades de inteligência artificial das necessidades práticas de gestão financeira, com uma arquitetura modular e uma interface acessível.

---

## Impacto esperado

O SplitAgent busca contribuir para:

- Maior compreensão dos impactos financeiros do Split Payment;
- Melhor organização do planejamento de caixa;
- Identificação antecipada de possíveis riscos financeiros;
- Acesso mais simples a análises e projeções;
- Apoio à avaliação de cenários e necessidades de crédito;
- Uso mais acessível de ferramentas de inteligência artificial;
- Decisões financeiras mais conscientes e fundamentadas.

---

## Licença

Os termos de licenciamento e distribuição do SplitAgent deverão ser definidos pela equipe responsável pelo projeto.

Até que uma licença seja formalmente estabelecida, a utilização e a redistribuição do código devem respeitar as autorizações aplicáveis ao repositório.
