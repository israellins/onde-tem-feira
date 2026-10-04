# Publicar na Google Play

O app Android é uma **TWA** (Trusted Web Activity): um "invólucro" que abre o site em tela
cheia. Toda atualização do site já chega ao app, sem nova versão na loja.

## O que já está pronto no código

- `public/manifest.json` com ícones PNG 192/512 e ícone _maskable_ (exigidos pela loja)
- `public/.well-known/assetlinks.json` (liga o domínio ao app `app.vercel.ondetemfeira.twa`)
- Política de privacidade em `/privacidade`, com seção de exclusão de conta (`#excluir-conta`)
- Exclusão de conta dentro do app (menu com o seu nome → Excluir minha conta)
- Termos de uso e regras do mural em `/termos`; denúncia e moderação de conteúdo

## Gerar o app

1. Instale o Bubblewrap: `npm i -g @bubblewrap/cli`
2. `bubblewrap init --manifest https://SEU_SITE/manifest.json`
3. Use o pacote `app.vercel.ondetemfeira.twa` (o mesmo do `assetlinks.json`).
4. `bubblewrap build` gera o `.aab` para enviar à Play Console.

**Impressão digital (SHA-256):** se você usar a _assinatura de apps do Google Play_, o
certificado que vale é o da Play Console (**Configuração → Integridade do app → Assinatura de
apps**). Copie o SHA-256 de lá para `public/.well-known/assetlinks.json`. Se a impressão estiver
errada, o app abre com a barra de endereço do navegador no topo.

Confira em: `https://SEU_SITE/.well-known/assetlinks.json` e na ferramenta
https://developers.google.com/digital-asset-links/tools/generator

## Formulários da Play Console

**Segurança dos dados** (resumo do que o app faz):

| Dado                       | Coletado | Compartilhado | Obrigatório | Finalidade                     |
| -------------------------- | -------- | ------------- | ----------- | ------------------------------ |
| E-mail                     | Sim      | Não           | Só com conta| Gerenciamento de conta         |
| Nome / foto de perfil      | Sim      | Não           | Só com conta| Gerenciamento de conta, mural  |
| Fotos                      | Sim      | Não           | Não         | Funcionalidade (mural)         |
| Outros conteúdos do usuário| Sim      | Não           | Não         | Funcionalidade (relatos, lista)|
| Localização aproximada     | Não*     | —             | —           | —                              |

\* A localização do aparelho só é usada na hora de marcar uma feira sugerida e não é guardada;
o que fica salvo é o ponto da feira enviado pelo usuário.

- Dados criptografados em trânsito: **Sim** (HTTPS).
- O usuário pode pedir exclusão: **Sim**. URL: `https://SEU_SITE/privacidade#excluir-conta`

**Classificação de conteúdo:** o app tem conteúdo gerado por usuários (mural) com moderação e
denúncia. Responda "Sim" para interação entre usuários / conteúdo gerado pelo usuário.

**Público-alvo:** maiores de 18 anos (evita as exigências extras de apps para crianças).

## Antes de enviar

- [ ] `NEXT_PUBLIC_CONTACT_EMAIL` configurado na Vercel (aparece na política de privacidade)
- [ ] SMTP próprio configurado no Supabase (ver CONFIGURAR-PRODUCAO.md)
- [ ] Testou login com Google pelo app instalado (não só no navegador)
- [ ] Capturas de tela do celular (o modo celular do Chrome serve)
