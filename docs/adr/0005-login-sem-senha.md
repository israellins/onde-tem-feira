# 0005. Login sem senha: Google e link por e-mail, com PKCE

- **Status:** Aceita
- **Data:** 2026-10-04

## Contexto

O público é amplo e não técnico, em sua maioria no celular. Guardar senhas traz
responsabilidade (vazamento, recuperação) que o projeto não precisa ter.

## Decisão

Oferecer apenas **Entrar com Google** e **link de acesso por e-mail**, via Supabase Auth, com
o fluxo **PKCE** (`flowType: "pkce"`). O redirecionamento volta para a mesma página.

## Alternativas consideradas

- **E-mail e senha:** atrito maior, telas de recuperação, risco de senha fraca.
- **Só Google:** exclui quem não quer usar conta Google.

## Consequências

- ✅ Nenhuma senha armazenada; cadastro e login são o mesmo passo.
- ⚠️ O link por e-mail depende de entrega de e-mail confiável; o servidor padrão do Supabase
  tem limite baixo — um SMTP próprio (Resend) é necessário para escala.
- ⚠️ O link precisa ser aberto no mesmo navegador que o pediu (exigência do PKCE).
