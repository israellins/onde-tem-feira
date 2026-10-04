# Onde tem feira 🧺

Mapa colaborativo de **feiras livres no Brasil**. Encontre feiras perto de você, filtre por
cidade, dia e bairro, monte sua lista de compras e compartilhe preços com a comunidade.

[![CI](https://github.com/israellins/onde-tem-feira/actions/workflows/ci.yml/badge.svg)](https://github.com/israellins/onde-tem-feira/actions/workflows/ci.yml)

## Funcionalidades

| Para todos (sem conta)                                | Com conta (Google ou link por e-mail)            |
| ----------------------------------------------------- | ------------------------------------------------ |
| Mapa com 188 feiras em 13 cidades                     | Mural de relatos com nota, preços e foto         |
| Filtros por cidade, dia, "Hoje" e busca sem acentos   | Confirmar que a feira está funcionando           |
| Selos de qualidade do dado (verificada, aproximada…)  | Sugerir correções e feiras novas (com moderação) |
| Lista de compras salva no aparelho                    | Lista de compras sincronizada entre aparelhos    |
| "Como chegar" pelo Google Maps                        | Excluir a conta e todos os dados a qualquer hora |

Administradores têm um **painel de moderação** em `/admin` para aprovar sugestões e tratar
denúncias.

## Como rodar no seu computador

Pré-requisitos: [Node.js 20.9+](https://nodejs.org) e, para login/mural,
[Docker](https://www.docker.com/) (usado pelo Supabase local).

```bash
npm install
npm run dev            # abre em http://localhost:3000
```

Sem configurar nada, o app roda em **modo offline**: mapa com os dados embutidos e lista de
compras no aparelho. Para ligar login, mural e sugestões localmente:

```bash
npm run db:start       # sobe o Supabase local (primeira vez demora alguns minutos)
cp .env.example .env.local
# preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
# com os valores mostrados pelo comando acima (API URL e anon key)
npm run dev
```

Os e-mails de login do ambiente local chegam em http://127.0.0.1:54324 (Mailpit).

## Comandos

| Comando                  | O que faz                                                       |
| ------------------------ | --------------------------------------------------------------- |
| `npm run dev`            | Servidor de desenvolvimento                                     |
| `npm run check`          | Lint + tipos + testes + build — rode antes de cada commit       |
| `npm test`               | Testes unitários e de componentes (Vitest)                      |
| `npm run test:db`        | Testes de segurança do banco (precisa do Supabase local)        |
| `npm run test:e2e`       | Testes no navegador, desktop e celular (Playwright)             |
| `npm run db:reset`       | Recria o banco local a partir das migrations                    |
| `npm run db:types`       | Regenera os tipos TypeScript do banco                           |
| `npm run db:gerar-carga` | Gera a migration de carga a partir de `src/data/feiras.json`    |
| `npm run icons`          | Gera os ícones PNG a partir de `public/icon.svg`                |

## Documentação

- [Colocar no ar (Supabase + Vercel + login com Google)](docs/CONFIGURAR-PRODUCAO.md)
- [Arquitetura e decisões](docs/ARQUITETURA.md)
- [Dados das feiras: fontes e como atualizar](docs/DADOS.md)
- [Publicar na Google Play](docs/PLAY-STORE.md)
- [Como contribuir](CONTRIBUTING.md) · [Segurança](SECURITY.md) · [Mudanças](CHANGELOG.md)

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Leaflet + OpenStreetMap ·
Supabase (Postgres, Auth, Storage) · Zod · Vitest · Playwright · GitHub Actions.

## Sobre os dados

Feiras de São Paulo, Rio de Janeiro e Cuiabá vêm de fontes municipais. As demais cidades estão
marcadas como **não verificadas**. Horários só aparecem quando a fonte oficial informa. Detalhes
em [docs/DADOS.md](docs/DADOS.md) e na página `/sobre` do app.

Mapas © colaboradores do [OpenStreetMap](https://www.openstreetmap.org/copyright).
