# 0003. Catálogo alterado só por sugestões moderadas

- **Status:** Aceita
- **Data:** 2026-10-04

## Contexto

Usuários devem poder corrigir e incluir feiras, mas o mapa é a parte mais visível do app e
um dado errado faz alguém perder a viagem. A primeira versão tinha dados inventados.

## Decisão

A tabela `feiras` **não tem política de escrita**. Usuários enviam `feira_suggestions`;
somente `approve_suggestion()`, que exige `is_admin()`, aplica a mudança. Feiras vindas da
comunidade entram sempre como **não verificadas** e com **local aproximado**. Feiras
encerradas são desativadas (`active = false`), nunca apagadas.

## Alternativas consideradas

- **Edição direta tipo wiki com histórico:** risco de vandalismo e de dados errados
  visíveis imediatamente.
- **Votação da comunidade para aprovar:** exige massa de usuários que o app ainda não tem.

## Consequências

- ✅ Nenhuma mudança no mapa sem olho humano; histórico de quem sugeriu e quem aprovou.
- ⚠️ O administrador vira gargalo; a rotina semanal está em [OPERACAO.md](../OPERACAO.md).
- 🔄 Rever quando houver volume: moderadores adicionais ou aprovação por confirmações.
