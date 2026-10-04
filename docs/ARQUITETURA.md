# Arquitetura

## Visão geral

```
Navegador / app Android (TWA)
        │
        ▼
Next.js na Vercel ── página inicial gerada estática e revalidada a cada 5 min (ISR)
        │                lê o catálogo de feiras do Supabase (ou do JSON embutido)
        ▼
Supabase
  ├── Postgres + RLS   feiras, perfis, relatos, lista, confirmações, sugestões
  ├── Auth             Google OAuth e link por e-mail (PKCE)
  └── Storage          fotos dos relatos (bucket público "post-photos")
```

O navegador fala **direto com o Supabase** usando a chave pública (anon). Não existe servidor
próprio com regras de negócio: **toda a segurança está no banco**, nas políticas RLS e em
funções `security definer` (ver `supabase/migrations/`). Por isso os testes de RLS
(`tests/integration/rls.test.ts`) são os mais importantes do projeto.

## Pastas

```
src/
  app/                  rotas (/, /admin, /sobre, /privacidade, /termos)
  components/
    map/                mapas Leaflet (carregados só no navegador)
    feira/              detalhes da feira, mural, confirmação, sugestões
    admin/              painel de moderação
    ui/                 Modal, Alert, Avatar
  lib/
    auth/               AuthProvider (sessão, perfil, login, exclusão de conta)
    data/getFeiras.ts   leitura do catálogo no servidor, com fallback para o JSON
    repositories/       acesso ao Supabase (posts, lista, confirmações, sugestões)
    supabase/           cliente e tipos gerados do banco
    hooks/useToday.ts   dia da semana do aparelho (sem erro de hidratação)
  types/                tipos e esquemas Zod (validação compartilhada)
  data/feiras.json      catálogo inicial / fallback offline
supabase/
  migrations/           esquema do banco, RLS e carga das feiras
  templates/            e-mails de login em português
tests/
  unit/                 lógica, dados e componentes (Vitest + Testing Library)
  integration/          segurança do banco contra Supabase local
  e2e/                  fluxos completos no navegador (Playwright)
```

## Decisões

**Modo offline como base.** Sem variáveis do Supabase, o app mostra o mapa com o JSON embutido e
guarda a lista no `localStorage`. Isso deixa o site útil mesmo se o Supabase cair, e facilita
desenvolver sem configurar nada.

**Catálogo no banco, com moderação.** As feiras vivem na tabela `feiras`. Usuários não editam a
tabela: enviam `feira_suggestions`, e só `approve_suggestion()` (que exige `is_admin`) aplica a
mudança. Feiras sugeridas entram sempre como `verified = false` e `accuracy = approximate`.

**Confirmações anônimas.** `feira_confirmations` não é legível pelo público; o resumo vem da
função `feira_confirmation_stats()`, que só devolve contagens.

**Limites contra abuso.** Gatilhos no banco limitam 10 relatos por hora e 20 sugestões por dia
por usuário. Textos, preços (JSON) e fotos (tipo e 5 MB) são validados no banco, não só na tela.

**Sem rastreadores de terceiros.** Avatares são a foto do Google ou a inicial do nome (antes o
e-mail era enviado ao DiceBear). Ícones do mapa são servidos pelo próprio site.

**Exclusão de conta.** `delete_my_account()` apaga o usuário e, em cascata, todos os dados. As
fotos são apagadas pelo app antes da chamada. Exigência da Google Play e da LGPD.

## Mudando o banco

1. Crie uma migration nova: `npx supabase migration new descricao_curta`
2. Escreva o SQL (sempre com RLS para tabelas novas) e rode `npm run db:reset`
3. Atualize os tipos: `npm run db:types`
4. Escreva/ajuste testes em `tests/integration/rls.test.ts` e rode `npm run test:db`
5. Em produção: `npx supabase db push`

Nunca edite uma migration que já foi aplicada em produção; crie outra.
