# Decisões de arquitetura (ADRs)

Cada ADR registra **uma** decisão importante: o contexto, o que foi decidido, as alternativas
e as consequências. Servem para que ninguém precise adivinhar por que o projeto é como é, nem
reabrir discussões já resolvidas sem fato novo.

| Nº                                               | Título                                                   | Status |
| ------------------------------------------------ | -------------------------------------------------------- | ------ |
| [0001](0001-supabase-sem-backend-proprio.md)     | Supabase com RLS em vez de um backend próprio            | Aceita |
| [0002](0002-modo-offline-e-fallback.md)          | Modo offline e fallback para JSON embutido               | Aceita |
| [0003](0003-catalogo-moderado-por-sugestoes.md)  | Catálogo alterado só por sugestões moderadas             | Aceita |
| [0004](0004-isr-na-pagina-inicial.md)            | Página inicial estática com revalidação de 5 minutos     | Aceita |
| [0005](0005-login-sem-senha.md)                  | Login sem senha: Google e link por e-mail, com PKCE      | Aceita |
| [0006](0006-leaflet-e-openstreetmap.md)          | Leaflet + OpenStreetMap em vez de Google Maps            | Aceita |
| [0007](0007-compartilhamento-de-lista-por-email.md) | Compartilhamento de lista por e-mail via função do banco | Aceita |

## Como escrever um ADR novo

1. Copie o modelo abaixo para `NNNN-titulo-curto.md` (próximo número).
2. Escreva em até uma página.
3. Inclua no mesmo PR da mudança e adicione na tabela acima.
4. Uma decisão substituída não é apagada: mude o status para "Substituída por NNNN".

```markdown
# NNNN. Título

- **Status:** Proposta | Aceita | Substituída por NNNN
- **Data:** AAAA-MM-DD

## Contexto
Qual problema ou força levou à decisão.

## Decisão
O que foi decidido, em uma ou duas frases afirmativas.

## Alternativas consideradas
- Opção X — por que não.

## Consequências
O que fica mais fácil, o que fica mais difícil, o que precisa ser vigiado.
```
