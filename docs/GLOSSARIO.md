# Glossário

## Domínio

| Termo                     | Significado                                                                                              | No código / banco                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Feira livre**           | Mercado de rua em dia e local fixos, geralmente semanal                                                  | `feiras`                              |
| **Catálogo**              | Conjunto de feiras ativas exibidas no mapa                                                               | `feiras where active`                 |
| **Verificada**            | Feira conferida em fonte oficial (prefeitura)                                                            | `verified = true`                     |
| **Não verificada**        | Feira sem conferência oficial (lista inicial ou sugestão da comunidade)                                  | `verified = false`                    |
| **Coordenada oficial**    | Ponto do mapa informado pela fonte                                                                       | `accuracy = 'official_coords'`        |
| **Local aproximado**      | Ponto estimado a partir de bairro ou endereço                                                            | `accuracy = 'approximate'`            |
| **Fonte**                 | Origem declarada do dado de cada feira                                                                   | `feiras.source`                       |
| **Feira encerrada**       | Feira que deixou de existir; some do mapa, mas continua no banco                                         | `active = false`                      |
| **Selo**                  | Etiqueta de qualidade no card: Não verificada, Local aprox., Confirmada em dd/mm, Pode ter mudado       | `FeiraBadges.tsx`                     |
| **Confirmação**           | Registro de que alguém esteve na feira: "Está funcionando" ou "Não encontrei"                            | `feira_confirmations`                 |
| **Relato**                | Publicação no mural de uma feira: texto, nota, preços e foto                                             | `posts`                               |
| **Mural**                 | Lista de relatos de uma feira                                                                            | `PostFeed`                            |
| **Preço informado**       | Par produto + preço dentro de um relato (texto livre, ex.: "R$ 5 o kg")                                  | `posts.price_reports`                 |
| **Denúncia**              | Aviso de um usuário de que um relato viola as regras                                                     | `post_reports`                        |
| **Sugestão**              | Pedido de inclusão (`nova`) ou correção (`alteracao`) de feira, sujeito a moderação                      | `feira_suggestions`                   |
| **Moderação**             | Revisão de sugestões e denúncias por um administrador                                                    | `/admin`                              |
| **Administrador**         | Usuário com permissão de moderar                                                                         | `profiles.is_admin`                   |
| **Lista de compras**      | Itens a comprar, com quantidade, preço estimado e categoria                                              | `shopping_items`                      |
| **Dono da lista**         | Usuário a quem a lista pertence                                                                          | `shopping_items.user_id`              |
| **Convidado**             | Usuário com quem o dono compartilhou a lista                                                             | `shopping_list_shares.member_id`      |
| **Total estimado**        | Soma dos preços estimados dos itens ainda não comprados                                                  | `pendingTotal()`                      |
| **Hoje**                  | Atalho de filtro pelo dia da semana do aparelho do usuário                                               | `useToday()`                          |

## Técnico

| Termo                     | Significado                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **RLS (Row Level Security)** | Recurso do Postgres que filtra linhas por política, conforme o usuário. Base da segurança do projeto.        |
| **Política (policy)**     | Regra de RLS para uma operação (select, insert, update, delete) numa tabela                                     |
| **`security definer`**    | Função SQL que roda com os privilégios de quem a criou; usada para operações controladas (aprovar sugestão)     |
| **RPC**                   | Chamada de uma função SQL pela API (`supabase.rpc("nome")`)                                                     |
| **Chave anon / publishable** | Chave pública do Supabase, enviada ao navegador; sozinha não dá acesso a dados protegidos                    |
| **Chave service_role / secret** | Chave que ignora a RLS. **Nunca** vai para o app; só usada nos testes locais                             |
| **JWT**                   | Token da sessão do usuário; o banco lê dele o `auth.uid()`                                                      |
| **PKCE**                  | Variante segura do fluxo OAuth para apps no navegador (código + verificador)                                    |
| **Magic link / link de acesso** | Login sem senha: o usuário recebe um link por e-mail                                                      |
| **Migration**             | Arquivo SQL versionado que altera o banco; aplicado em ordem e nunca editado depois de ir para produção        |
| **ISR**                   | _Incremental Static Regeneration_: página estática que o Next regenera em segundo plano (aqui, a cada 300 s)    |
| **Hidratação**            | Momento em que o React assume no navegador o HTML gerado no servidor                                            |
| **Modo offline**          | Funcionamento sem variáveis do Supabase: catálogo do JSON e lista no `localStorage`                             |
| **Fallback**              | Plano B automático: se o Supabase falhar, o servidor usa o JSON embutido                                        |
| **Repositório (camada)**  | Módulo em `src/lib/repositories/` que concentra o acesso ao Supabase                                            |
| **PWA**                   | _Progressive Web App_: site instalável na tela inicial                                                          |
| **TWA**                   | _Trusted Web Activity_: forma de publicar o PWA na Google Play                                                  |
| **Tiles**                 | Imagens quadradas que formam o mapa (vindas do OpenStreetMap)                                                   |
| **Preview (Vercel)**      | Deploy temporário de um branch/PR                                                                               |
| **Mailpit**               | Caixa de e-mail falsa do Supabase local, para ver e-mails de login                                              |
| **ADR**                   | _Architecture Decision Record_: registro curto de uma decisão de arquitetura e seus motivos                     |
