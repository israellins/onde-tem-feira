# 0001. Supabase com RLS em vez de um backend próprio

- **Status:** Aceita
- **Data:** 2026-10-04

## Contexto

O projeto precisava de login, banco compartilhado, upload de fotos e moderação. É mantido por
uma pessoa, sem orçamento, e deve rodar em planos gratuitos. A versão anterior tinha login
falso e dados só no navegador.

## Decisão

Usar o **Supabase** (Postgres, Auth, Storage) acessado **diretamente do navegador** com a
chave pública, colocando **toda a autorização no banco**: RLS em todas as tabelas, campos
sensíveis definidos por padrão/gatilho e operações privilegiadas em funções
`security definer`.

## Alternativas consideradas

- **API própria (Route Handlers do Next ou servidor Node) com ORM:** mais código para
  manter, mais superfície de bug de autorização, e a segurança dependeria de nunca esquecer
  uma checagem no servidor.
- **Firebase:** banco de documentos dificulta as consultas e restrições que o domínio pede
  (checks, joins, agregações); regras de segurança menos testáveis localmente.

## Consequências

- ✅ Menos código, custo zero, API REST gerada automaticamente.
- ✅ A segurança é testável de ponta a ponta contra um banco real (`tests/integration`).
- ⚠️ Regras de negócio ficam em SQL: exige cuidado em review de migrations.
- ⚠️ Qualquer coisa que precise de segredo (e-mail transacional, integrações pagas) exige uma
  Edge Function ou Route Handler — ainda não há nenhum.
- ⚠️ Dependência de um fornecedor; mitigada por ser Postgres padrão (migrations portáveis).
