# 0004. Página inicial estática com revalidação de 5 minutos

- **Status:** Aceita
- **Data:** 2026-10-04

## Contexto

A página inicial mostra o catálogo inteiro (~190 feiras), igual para todos. Sugestões
aprovadas precisam aparecer sem novo deploy. O plano gratuito da Vercel e do Supabase tem
limites de execução e de requisições.

## Decisão

`src/app/page.tsx` usa `export const revalidate = 300` (ISR): a Vercel serve HTML pronto e
regenera em segundo plano no máximo a cada 5 minutos. Dados por usuário (sessão, lista,
confirmações) são buscados pelo navegador depois da hidratação.

## Alternativas consideradas

- **Renderização dinâmica a cada acesso:** mais lenta e consome o banco a cada visita.
- **Buscar o catálogo só no navegador:** tela vazia até carregar e pior para SEO.

## Consequências

- ✅ Página rápida e barata; o banco recebe ~1 leitura de catálogo a cada 5 minutos.
- ⚠️ Feira aprovada leva até 5 minutos para aparecer (comunicado na tela de moderação).
- ⚠️ O servidor não sabe o dia do usuário: "Hoje" é calculado no navegador (`useToday`).
