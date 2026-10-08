# Documentação do Onde tem feira

Índice de toda a documentação técnica e de produto. Comece pelo roteiro do seu perfil.

## Roteiro por perfil

| Perfil                              | Leia nesta ordem                                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Analista de requisitos / produto** | [Requisitos](REQUISITOS.md) → [Glossário](GLOSSARIO.md) → [Dados das feiras](DADOS.md) → [Arquitetura](ARQUITETURA.md) (só a visão geral) |
| **Dev novo no projeto**              | [Desenvolvimento](DESENVOLVIMENTO.md) → [Arquitetura](ARQUITETURA.md) → [Banco de dados](BANCO-DE-DADOS.md) → [Frontend](FRONTEND.md) → [Testes](TESTES.md) |
| **Quem cuida da produção**           | [Operação](OPERACAO.md) → [Colocar no ar](CONFIGURAR-PRODUCAO.md) → [Ferramentas e serviços](FERRAMENTAS.md)     |
| **Quem vai publicar na loja**        | [Publicar na Google Play](PLAY-STORE.md)                                                                        |

## Todos os documentos

### Produto

- [**Requisitos**](REQUISITOS.md): visão do produto, atores, requisitos funcionais e não
  funcionais, regras de negócio, casos de uso e rastreabilidade para os testes.
- [**Glossário**](GLOSSARIO.md): termos do domínio (feira, selo, confirmação, sugestão…) e
  termos técnicos.
- [**Dados das feiras**](DADOS.md): de onde vêm as 188 feiras, o que foi corrigido e como
  atualizar.

### Técnica

- [**Arquitetura**](ARQUITETURA.md): contexto, contêineres, fluxos principais (login,
  sugestão, compartilhamento), modelo de segurança e decisões.
- [**Banco de dados**](BANCO-DE-DADOS.md): diagrama ER, dicionário de dados, políticas RLS,
  funções, gatilhos e Storage.
- [**Frontend**](FRONTEND.md): rotas, árvore de componentes, estado, camada de repositórios,
  padrões de UI e acessibilidade.
- [**Ferramentas e serviços**](FERRAMENTAS.md): cada biblioteca, ferramenta e serviço externo,
  com versão, para que serve e onde é configurado.
- [**Decisões de arquitetura (ADRs)**](adr/README.md): por que o projeto é como é.

### Engenharia

- [**Desenvolvimento**](DESENVOLVIMENTO.md): preparar o ambiente, variáveis, comandos, fluxo
  de Git, convenções de código, receitas e problemas comuns.
- [**Testes**](TESTES.md): estratégia, o que cada suíte cobre, como rodar e como escrever.
- [**Operação**](OPERACAO.md): ambientes, CI/CD, deploy, migrations em produção, moderação,
  backup, monitoramento e resposta a incidentes.
- [**Colocar no ar**](CONFIGURAR-PRODUCAO.md): passo a passo da primeira configuração de
  Supabase, Vercel e login com Google.
- [**Publicar na Google Play**](PLAY-STORE.md): app Android via TWA.

### Na raiz do repositório

- [README](../README.md) · [Como contribuir](../CONTRIBUTING.md) ·
  [Segurança](../SECURITY.md) · [Mudanças (CHANGELOG)](../CHANGELOG.md)

## Como manter esta documentação

- A documentação vive no mesmo repositório que o código e muda **no mesmo Pull Request** da
  funcionalidade. O template de PR lembra disso.
- Mudou o banco? Atualize [BANCO-DE-DADOS.md](BANCO-DE-DADOS.md).
- Requisito novo? Dê um código `RF-xx` em [REQUISITOS.md](REQUISITOS.md) e aponte o teste.
- Decisão difícil de reverter? Registre um ADR em [`adr/`](adr/README.md).
- Diagramas são escritos em [Mermaid](https://mermaid.js.org/) e o GitHub os desenha
  automaticamente.
