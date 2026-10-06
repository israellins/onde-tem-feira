# Segurança

## Como reportar uma vulnerabilidade

Não abra uma issue pública. Use **Security → Report a vulnerability** neste repositório no
GitHub (relato privado). Responderemos assim que possível.

## Modelo de segurança

- O navegador acessa o Supabase com a chave pública (anon). **Toda autorização é feita no banco**
  por políticas RLS e funções `security definer` — ver `supabase/migrations/`.
- Usuários só escrevem os próprios registros (a lista de compras também pode ser editada por
  quem o dono convidou); o catálogo de feiras só muda por funções que
  exigem administrador; ninguém se promove a administrador pela API.
- Uploads: só imagens JPG/PNG/WebP até 5 MB, na pasta do próprio usuário.
- Limites por usuário contra spam (relatos e sugestões).
- `tests/integration/rls.test.ts` verifica essas regras a cada Pull Request.
- Dependências: Dependabot semanal e `npm audit` de produção no CI.

Detalhes: [matriz de permissões](docs/BANCO-DE-DADOS.md#4-matriz-de-permissões-rls) e
[modelo de segurança](docs/ARQUITETURA.md#4-modelo-de-segurança).
