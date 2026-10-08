# 0007. Compartilhamento de lista por e-mail via função do banco

- **Status:** Aceita
- **Data:** 2026-10-05

## Contexto

Famílias fazem a feira juntas e queriam uma lista comum. O e-mail é o identificador que as
pessoas conhecem, mas ele fica em `auth.users`, que não pode ser exposto (privacidade).

## Decisão

- Tabela `shopping_list_shares (owner_id, member_id)` **sem política de insert**.
- Compartilhar só pela função `share_shopping_list(email)` (`security definer`), que procura o
  e-mail em `auth.users`, valida as regras e devolve apenas o **nome de exibição**.
- O acesso aos itens passa por `can_access_shopping_list(dono)` na RLS de `shopping_items`.
- `added_by` é definido por gatilho, para mostrar quem adicionou sem permitir falsificação.
- A pessoa precisa já ter conta; não há convite por e-mail para quem não tem.

## Alternativas consideradas

- **Link de convite com token:** não exige conta prévia, mas precisa de tela de aceite,
  expiração e envio de e-mail (que exigiria servidor com segredo).
- **Listas como entidade própria com vários donos:** mais flexível, mas muda o modelo
  inteiro por um caso de uso que hoje é "uma lista por pessoa".

## Consequências

- ✅ Ninguém descobre e-mails de outras pessoas pela API; o dono só vê o e-mail que ele mesmo
  digitou.
- ⚠️ A função revela se um e-mail tem conta (mensagem "não encontramos ninguém"). Aceito:
  exige estar logado e o uso é entre conhecidos.
- ⚠️ Atualização entre pessoas não é em tempo real (recarrega ao voltar ao app).
