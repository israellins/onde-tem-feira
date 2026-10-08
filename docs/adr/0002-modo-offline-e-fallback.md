# 0002. Modo offline e fallback para JSON embutido

- **Status:** Aceita
- **Data:** 2026-10-04

## Contexto

O valor principal do app (achar uma feira) não depende de login. O plano gratuito do
Supabase pode pausar o projeto por inatividade e pode ficar indisponível. Novos devs
precisam rodar o projeto sem configurar nada.

## Decisão

1. Sem as variáveis do Supabase, o app roda em **modo offline**: catálogo de
   `src/data/feiras.json`, lista no `localStorage`, recursos online ocultos.
2. Com Supabase configurado, se a leitura do catálogo **falhar ou vier vazia**, o servidor
   usa o JSON embutido.

## Alternativas consideradas

- **Exigir Supabase sempre:** uma queda do banco deixaria o mapa vazio.
- **Só o JSON, sem banco para o catálogo:** sugestões aprovadas exigiriam novo deploy.

## Consequências

- ✅ O mapa nunca fica vazio; onboarding de dev em um comando.
- ⚠️ O JSON precisa acompanhar o banco nas feiras oficiais (o script
  `db:gerar-carga` gera a migration a partir dele). Feiras sugeridas pela comunidade só
  existem no banco.
