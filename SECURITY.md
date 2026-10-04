# Segurança

## Como reportar uma vulnerabilidade

Não abra uma issue pública. Use **Security → Report a vulnerability** neste repositório no
GitHub (relato privado). Responderemos assim que possível.

## Modelo de segurança

- O navegador acessa o Supabase com a chave pública (anon). **Toda autorização é feita no banco**
  por políticas RLS e funções `security definer` — ver `supabase/migrations/`.
- Usuários só escrevem os próprios registros; o catálogo de feiras só muda por funções que
  exigem administrador; ninguém se promove a administrador pela API.
- Uploads: só imagens JPG/PNG/WebP até 5 MB, na pasta do próprio usuário.
- Limites por usuário contra spam (relatos e sugestões).
- `tests/integration/rls.test.ts` verifica essas regras a cada Pull Request.
- Dependências: Dependabot semanal e `npm audit` de produção no CI.
