# Guia de desenvolvimento

Tudo para sair do zero até abrir o primeiro Pull Request.

## 1. Pré-requisitos

| Ferramenta | Versão           | Para quê                                  |
| ---------- | ---------------- | ----------------------------------------- |
| Node.js    | 20.9 ou superior (recomendado 22) | Rodar o projeto            |
| Git        | qualquer recente | Versionamento                             |
| Docker     | Desktop ou Engine | Supabase local (login, mural, testes de banco) |

Docker só é necessário para trabalhar com login, mural, sugestões ou rodar os testes de banco
e E2E. Para mexer em mapa, filtros e layout, basta o Node.

## 2. Primeiro uso

```bash
git clone https://github.com/israellins/onde-tem-feira.git
cd onde-tem-feira
npm install
npm run dev                # http://localhost:3000 em modo offline
```

### Com o Supabase local

```bash
npm run db:start           # 1ª vez baixa as imagens Docker (alguns minutos)
cp .env.example .env.local
```

Preencha o `.env.local` com os valores mostrados pelo `db:start` (ou por
`npx supabase status`):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY do status>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm run dev
```

| Endereço local                  | O que é                                           |
| ------------------------------- | ------------------------------------------------- |
| http://localhost:3000           | O app                                             |
| http://127.0.0.1:54323          | Supabase Studio (tabelas, SQL, usuários)          |
| http://127.0.0.1:54324          | Mailpit: e-mails de login enviados localmente     |
| http://127.0.0.1:54321          | API do Supabase                                   |
| `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Postgres direto      |

**Login local:** use "Receber link por e-mail" com qualquer endereço (ex.: `eu@teste.local`) e
abra o link no Mailpit. O login com Google não funciona no ambiente local sem configurar um
cliente OAuth próprio.

**Virar administrador local:** no Studio → SQL Editor:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'eu@teste.local');
```

## 3. Comandos

| Comando                  | O que faz                                                       | Quando usar                    |
| ------------------------ | --------------------------------------------------------------- | ------------------------------ |
| `npm run dev`            | Servidor de desenvolvimento com recarga                         | Sempre                         |
| `npm run check`          | Lint + tipos + testes unitários + build                         | **Antes de cada commit**       |
| `npm run format`         | Formata tudo com Prettier                                       | Antes de commitar              |
| `npm test`               | Testes unitários e de componentes                               | Durante o desenvolvimento      |
| `npm run test:watch`     | Idem, observando arquivos                                       | TDD                            |
| `npm run test:db`        | Testes de segurança do banco (RLS)                              | Mudou SQL ou repositório       |
| `npm run test:e2e`       | Testes no navegador (precisa de `npm run build` antes)          | Mudou fluxo de tela            |
| `npm run db:start` / `db:stop` | Sobe/derruba o Supabase local                             |                                |
| `npm run db:reset`       | Recria o banco local aplicando todas as migrations              | Depois de criar migration      |
| `npm run db:types`       | Regenera `database.types.ts` a partir do banco local            | Depois de mudar o esquema      |
| `npm run db:gerar-carga` | Gera a migration de carga a partir de `src/data/feiras.json`    | Mudou o JSON de feiras         |
| `npm run icons`          | Regenera os ícones PNG                                          | Mudou `public/icon.svg`        |

## 4. Fluxo de trabalho com Git

```mermaid
gitGraph
  commit id: "main"
  branch feat/minha-funcionalidade
  commit id: "feat: ..."
  commit id: "test: ..."
  commit id: "docs: ..."
  checkout main
  merge feat/minha-funcionalidade id: "PR aprovado + CI verde"
```

1. Sempre a partir de `main` atualizado: `git switch main && git pull`.
2. Crie um branch: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
3. Commits pequenos em [Conventional Commits](https://www.conventionalcommits.org/pt-br/):
   `feat: compartilhar lista por e-mail`, `fix: total ignorava itens comprados`.
4. `npm run check` (e `test:db`/`test:e2e` se mexeu em banco ou fluxos).
5. Abra o Pull Request preenchendo o template. O CI roda tudo.
6. Merge só com CI verde. A Vercel publica `main` automaticamente.
7. Mudou o banco? A migration precisa ser aplicada em produção **antes** do merge (veja
   [OPERACAO.md](OPERACAO.md#4-migrations-em-produção)).

**Versionamento:** [SemVer](https://semver.org/lang/pt-BR/) no `package.json`, com entrada no
[CHANGELOG](../CHANGELOG.md) (formato Keep a Changelog) a cada versão.

## 5. Convenções de código

- **TypeScript estrito.** Sem `any`; prefira tipos de `src/types/` e os gerados do banco.
- **Imports com alias** `@/` (ex.: `import { Modal } from "@/components/ui/Modal"`).
- **Nomes de domínio em português** (feira, relato, sugestão), código em inglês quando é termo
  técnico (`store`, `fetch`, `props`). Textos da interface sempre em português.
- **Banco em `snake_case`, TypeScript em `camelCase`**; a conversão acontece nos
  repositórios.
- **Acesso ao Supabase só em `src/lib/repositories/`** (exceções: `AuthProvider` para Auth e
  `lib/data/getFeiras.ts` para o catálogo no servidor).
- **Funções puras** em `src/lib/*.ts`, com teste unitário.
- **Comentários** explicam o _porquê_, não o _quê_.
- Formatação é do Prettier; não discuta estilo em review.

## 6. Receitas

### Adicionar um campo a uma tabela

1. `npx supabase migration new add_campo_x`
2. SQL: `alter table … add column …` + `check` + ajuste de políticas, se preciso.
3. `npm run db:reset && npm run db:types`
4. Ajuste o tipo em `src/types/` e o esquema Zod (mesmos limites do `check`).
5. Ajuste o repositório (select/insert e mapeamento).
6. Teste em `tests/integration/rls.test.ts`.
7. Atualize [BANCO-DE-DADOS.md](BANCO-DE-DADOS.md).

### Criar uma tabela nova

Siga o checklist de [BANCO-DE-DADOS.md § 6](BANCO-DE-DADOS.md#6-como-mudar-o-banco). O mínimo:
RLS ligada, políticas de select/insert/update/delete pensadas para visitante, usuário e
administrador, e um teste para cada "não pode".

### Criar uma tela/modal nova

1. Componente em `src/components/<área>/`, com `"use client"` se tiver estado.
2. Use `ui/Modal` e `ui/Alert`.
3. Dados via repositório; erros via `friendlyError`.
4. Teste de componente em `tests/unit/components.test.tsx` buscando por papel/rótulo.
5. Se for um fluxo importante, um teste em `tests/e2e/app.spec.ts`.

### Adicionar uma cidade ou feiras

Veja [DADOS.md](DADOS.md). Em resumo: edite `src/data/feiras.json` com **fonte** e
`verified`/`accuracy` honestos, adicione o centro em `src/lib/cityCenters.ts`, rode
`npm test` (valida o catálogo) e `npm run db:gerar-carga` para gerar a migration.

## 7. Problemas comuns

| Sintoma                                                       | Causa provável e solução                                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| "Entrar" não aparece                                          | App em modo offline: faltam as variáveis do Supabase no `.env.local`. Reinicie o `npm run dev` após criar o arquivo. |
| `npm run test:db` diz que o Supabase não está rodando         | Rode `npm run db:start` (Docker precisa estar aberto).                                                       |
| E2E falha logo no início                                      | Faltou `npm run build`, ou `.env.local` não aponta para o Supabase local, ou a porta 3000 está ocupada.       |
| E2E não acha o Chromium                                       | `npx playwright install chromium`, ou defina `PW_CHROMIUM_PATH` para um Chrome já instalado.                 |
| Link de login por e-mail não chega (local)                    | Veja o Mailpit em http://127.0.0.1:54324.                                                                     |
| Erro de tipo após mudar o banco                               | `npm run db:types`.                                                                                          |
| Marcadores do mapa sem ícone                                  | Arquivos em `public/leaflet/` ausentes ou caminho alterado em `leafletIcons.ts`.                              |
| Erro de hidratação envolvendo data/dia                        | Não use `new Date()` na renderização; use `useToday()` (retorna `null` no servidor).                          |
| ESLint: "setState synchronously within an effect"            | Use o padrão com `cancelled` e `reloadKey` descrito em [FRONTEND.md](FRONTEND.md#padrão-para-buscar-dados-em-efeitos). |
| `format:check` falha no CI                                    | `npm run format` e commite.                                                                                  |

## 8. Usando IA para programar

Permitido e incentivado, com revisão. Peça explicitamente para: não inventar dados, manter RLS
em toda tabela, escrever testes para o que mudou e atualizar a documentação. Rode
`npm run check` antes de commitar qualquer código gerado.
