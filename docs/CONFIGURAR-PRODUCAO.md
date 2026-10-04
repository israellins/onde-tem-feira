# Colocar no ar (produção)

Passo a passo para ligar login, mural e sugestões no site publicado. Tempo estimado: 30–45
minutos. Tudo cabe nos planos gratuitos do Supabase e da Vercel.

> Sem estes passos o site continua funcionando em **modo offline** (mapa + lista de compras no
> aparelho). Login, mural e sugestões aparecem sozinhos quando as variáveis forem configuradas.

## 1. Criar o projeto no Supabase

1. Crie uma conta em https://supabase.com e clique em **New project**.
2. Nome: `onde-tem-feira`. Região: **South America (São Paulo)**. Guarde a senha do banco.
3. Quando o projeto terminar de criar, abra **Project Settings → API** e anote:
   - **Project URL** (ex.: `https://abcd1234.supabase.co`)
   - **anon / publishable key** (pública, pode ir para o navegador)
   - **Reference ID** do projeto (em Project Settings → General)

> A chave **service_role / secret** nunca deve ir para o código, para a Vercel nem para o app.

## 2. Criar as tabelas (migrations)

No seu computador, dentro da pasta do projeto:

```bash
npx supabase login
npx supabase link --project-ref SEU_REFERENCE_ID
npx supabase db push
```

Isso cria todas as tabelas, regras de segurança (RLS), o bucket de fotos e carrega as 188
feiras. Rodar de novo só aplica migrations novas.

## 3. Configurar URLs de login

Em **Authentication → URL Configuration**:

- **Site URL:** o endereço do site, ex.: `https://ondetemfeira.vercel.app`
- **Redirect URLs:** adicione
  - `https://ondetemfeira.vercel.app/**`
  - `http://localhost:3000/**` (para testar no seu computador)

## 4. Login com Google

1. Em https://console.cloud.google.com crie um projeto (ou use um existente).
2. **APIs e serviços → Tela de consentimento OAuth**: tipo **Externo**, nome "Onde tem feira",
   seu e-mail de suporte, e os links das páginas `/privacidade` e `/termos` do site.
3. **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**:
   - Tipo: **Aplicativo da Web**
   - **URIs de redirecionamento autorizados:** `https://SEU_PROJETO.supabase.co/auth/v1/callback`
4. Copie o **Client ID** e o **Client secret**.
5. No Supabase, **Authentication → Sign In / Providers → Google**: ative e cole os dois valores.

## 5. E-mails de login em português

Em **Authentication → Emails → Templates**, edite **Magic Link** e **Confirm signup** colando o
conteúdo de `supabase/templates/magic-link.html` e `supabase/templates/confirmation.html`.

**Importante:** o envio de e-mail padrão do Supabase tem um limite baixo de mensagens por hora,
feito só para testes. Antes de divulgar o app, configure um SMTP próprio em
**Authentication → Emails → SMTP Settings** (ex.: Resend, Brevo ou Amazon SES; todos têm plano
gratuito).

## 6. Variáveis na Vercel

Em **Vercel → seu projeto → Settings → Environment Variables**, adicione (para Production e
Preview):

| Variável                        | Valor                                       |
| ------------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project URL do passo 1                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key do passo 1           |
| `NEXT_PUBLIC_SITE_URL`          | endereço do site                            |
| `NEXT_PUBLIC_CONTACT_EMAIL`     | e-mail para pedidos de privacidade/exclusão |

Depois, faça um novo deploy (**Deployments → ⋯ → Redeploy**).

## 7. Tornar-se administrador

1. Entre no site com a sua conta (Google ou e-mail).
2. No Supabase, abra **SQL Editor** e rode, trocando pelo seu e-mail:

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'seu-email@gmail.com');
```

3. Recarregue o site: no menu com o seu nome aparece **Painel de moderação**.

## 8. Conferência final

- [ ] Entrar com Google funciona e volta para o site já logado
- [ ] Link por e-mail chega e faz login
- [ ] Publicar um relato com foto e apagá-lo
- [ ] Enviar uma sugestão e aprová-la em `/admin` (o mapa atualiza em até 5 minutos)
- [ ] Menu → Excluir minha conta funciona (teste com uma conta descartável)

## Rotina de moderação

- Abra `/admin` uma vez por semana (ou quando quiser) para aprovar sugestões e tratar denúncias.
- Para bloquear um usuário abusivo: **Authentication → Users → ⋯ → Ban user**.
- Backups: o plano gratuito do Supabase não tem backup automático com restauração. Exporte o
  banco de vez em quando com `npx supabase db dump --data-only > backup.sql`.
