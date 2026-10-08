# Requisitos

Especificação do produto **como ele está implementado** (versão 1.1.0). Cada requisito tem um
código estável (`RF-xx`, `RNF-xx`, `RN-xx`) para ser citado em issues, PRs e testes.

## 1. Visão do produto

**Problema.** Feiras livres são uma forma barata e fresca de comprar comida, mas a informação
sobre elas é espalhada: listas de prefeitura em PDF, posts antigos em redes sociais, boca a
boca. Não dá para saber com facilidade qual feira acontece hoje perto de casa, nem se ela ainda
existe.

**Proposta.** Um mapa público e gratuito das feiras livres do Brasil, com dados de fontes
oficiais quando existem, sinais claros de confiabilidade e uma comunidade que confirma, corrige
e comenta.

**Objetivos**

1. Responder em segundos: _"Que feira tem hoje perto de mim?"_
2. Ser honesto sobre a qualidade de cada dado (nada inventado).
3. Deixar a comunidade manter o mapa atualizado, com moderação.
4. Ajudar a planejar a compra (lista de compras, preços vistos por outras pessoas).

**Fora do escopo (por enquanto):** venda ou pagamento, cadastro de feirantes e barracas,
notificações push, app iOS nativo, idiomas além do português.

## 2. Atores

| Ator                  | Quem é                                                                 | Como é identificado                                  |
| --------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------- |
| **Visitante**         | Qualquer pessoa, sem conta                                             | Sem sessão                                           |
| **Usuário**           | Pessoa que entrou com Google ou link por e-mail                        | Sessão do Supabase Auth (`auth.uid()`)               |
| **Dono da lista**     | Usuário, em relação à própria lista de compras                         | `shopping_items.user_id = auth.uid()`                |
| **Convidado da lista** | Usuário com quem um dono compartilhou a lista                         | Linha em `shopping_list_shares`                      |
| **Administrador**     | Usuário com permissão de moderação                                     | `profiles.is_admin = true` (só via SQL Editor)       |
| **Fonte oficial**     | Prefeituras (GeoSampa, SEOP-Rio, Portal Feiras Cuiabá)                 | Ator externo; dados importados por script            |

## 3. Requisitos funcionais

Legenda da coluna **Quem**: V = visitante, U = usuário, A = administrador.

### 3.1 Encontrar feiras

| Código    | Requisito                                                                                                                                                         | Quem  |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **RF-01** | Exibir as feiras ativas num **mapa** (OpenStreetMap) e numa **lista** lateral, sincronizados: selecionar numa seleciona na outra.                                 | V U A |
| **RF-02** | **Filtrar** por cidade, por dia da semana e pelo atalho **Hoje** (dia do aparelho do usuário). Mostrar a quantidade de resultados e um botão **Limpar filtros**.  | V U A |
| **RF-03** | **Buscar** por texto em nome, bairro, cidade, endereço e nome do dia, ignorando acentos e maiúsculas; todas as palavras digitadas precisam aparecer.              | V U A |
| **RF-04** | Ao escolher uma cidade, o mapa centraliza nela.                                                                                                                   | V U A |
| **RF-05** | Abrir os **detalhes** da feira: nome, bairro, endereço, dias, horário (ou "horário não confirmado"), fonte do dado, selos e link **Como chegar** (Google Maps).    | V U A |
| **RF-06** | Exibir **selos de qualidade**: _Não verificada_, _Local aprox._, _Confirmada em dd/mm_ e _Pode ter mudado_ (regras em [RN-01 a RN-04](#5-regras-de-negócio)).  | V U A |
| **RF-07** | Ordenar o catálogo com **feiras verificadas primeiro**, depois por cidade e nome (ordem do português).                                                            | V U A |

### 3.2 Conta

| Código    | Requisito                                                                                                                         | Quem |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **RF-10** | **Entrar com Google** (OAuth) ou com **link de acesso por e-mail** (sem senha). O primeiro acesso cria a conta.                  | V    |
| **RF-11** | Criar o **perfil público** automaticamente no cadastro: nome (do Google ou parte do e-mail antes do @) e foto do Google, se houver. | U    |
| **RF-12** | **Sair** da conta.                                                                                                                | U    |
| **RF-13** | **Excluir a conta** pelo menu, apagando conta, perfil, relatos, fotos, lista, compartilhamentos, confirmações e sugestões.        | U    |

### 3.3 Mural da feira

| Código    | Requisito                                                                                                                                         | Quem  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **RF-20** | Ver os relatos de uma feira, do mais novo para o mais antigo (até 50), com autor, data relativa, nota, preços e foto.                             | V U A |
| **RF-21** | **Publicar relato** com texto (obrigatório), nota de 1 a 5 (opcional), até 10 preços (produto + preço) e uma foto opcional (JPG, PNG ou WebP, até 5 MB). | U     |
| **RF-22** | **Apagar** o próprio relato (e a foto dele).                                                                                                      | U     |
| **RF-23** | **Denunciar** um relato informando o motivo. Uma denúncia por pessoa por relato.                                                                  | U     |

### 3.4 Manter o mapa atualizado

| Código    | Requisito                                                                                                                                                                       | Quem |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **RF-30** | **Confirmar funcionamento** de uma feira: "Está funcionando" ou "Não encontrei". Uma resposta por pessoa por dia, que pode ser trocada no mesmo dia.                           | U    |
| **RF-31** | Mostrar a todos um **resumo anônimo** das confirmações dos últimos 30 dias (quantidades e data da última confirmação positiva), sem revelar quem confirmou.                     | V U A |
| **RF-32** | **Sugerir uma feira nova** com nome, cidade, bairro, endereço e horário opcionais, dias da semana e o ponto no mapa (clicando ou usando a localização do aparelho).             | U    |
| **RF-33** | **Sugerir correção** de uma feira existente (nome, bairro, endereço, horário, dias) ou informar que ela **não existe mais**, com comentário opcional. Só os campos alterados são enviados. | U    |

### 3.5 Moderação (`/admin`)

| Código    | Requisito                                                                                                                                       | Quem |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **RF-40** | Listar **sugestões pendentes** com autor, data, tipo, campos enviados, link para ver o ponto no mapa (feira nova) e comentário.                                              | A    |
| **RF-41** | **Aprovar** sugestão: uma feira nova entra no catálogo; uma correção altera só os campos enviados; "não existe mais" desativa a feira. | A    |
| **RF-42** | **Rejeitar** sugestão. (As funções do banco aceitam uma nota de revisão; a tela ainda não a pede.)                                                                                                        | A    |
| **RF-43** | Listar **relatos denunciados** com os motivos e **ocultar** ou **manter e descartar denúncias**. As denúncias do relato são limpas em seguida.               | A    |
| **RF-44** | Feiras aprovadas aparecem no mapa público em até **5 minutos**, sem novo deploy.                                                                | A    |

### 3.6 Lista de compras

| Código    | Requisito                                                                                                                                                     | Quem |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **RF-50** | Adicionar itens com nome, quantidade, preço estimado opcional e categoria (frutas, legumes, pastéis, peixes, temperos, outros); marcar como comprado; remover; limpar comprados. | V U  |
| **RF-51** | Mostrar o **total estimado** só dos itens ainda não comprados.                                                                                                | V U  |
| **RF-52** | Sem login, a lista fica salva **só no aparelho**.                                                                                                             | V    |
| **RF-53** | Com login, a lista fica **na conta** e sincroniza entre aparelhos; ao abrir, oferece **importar** os itens que estavam salvos no aparelho.                    | U    |
| **RF-54** | **Compartilhar a lista por e-mail** com outra pessoa que já tenha entrado no app pelo menos uma vez (até 20 pessoas por lista).                               | U    |
| **RF-55** | O **convidado** vê a lista do dono numa aba própria ("Lista de Maria") e pode adicionar, marcar e remover itens; cada item mostra **quem adicionou**.         | U    |
| **RF-56** | O dono vê quem tem acesso e pode **remover** qualquer pessoa; o convidado pode **sair** da lista.                                                             | U    |
| **RF-57** | A lista é recarregada quando o app volta para o primeiro plano, para mostrar o que outras pessoas mudaram.                                                     | U    |

### 3.7 Institucional e plataforma

| Código    | Requisito                                                                                                                          | Quem  |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **RF-60** | Páginas **Sobre os dados** (`/sobre`), **Política de privacidade** (`/privacidade`) e **Termos de uso** (`/termos`).              | V U A |
| **RF-61** | **Modo offline de configuração:** sem as variáveis do Supabase, o app funciona com o catálogo embutido e a lista no aparelho; login, mural e sugestões ficam ocultos. | V     |
| **RF-62** | **Instalável** como app (PWA com manifesto e ícones) e publicável na Google Play como TWA.                                         | V U A |

## 4. Requisitos não funcionais

| Código     | Categoria         | Requisito                                                                                                                                                       | Como é garantido                                                 |
| ---------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **RNF-01** | Segurança         | Toda autorização é feita **no banco** (RLS e funções `security definer`). O navegador só tem a chave pública.                                                  | Migrations + `tests/integration/rls.test.ts` no CI               |
| **RNF-02** | Segurança         | Ninguém consegue se tornar administrador pela API.                                                                                                              | Gatilho `protect_profile_admin_flag` + teste                     |
| **RNF-03** | Segurança         | Cabeçalhos HTTP de segurança (HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`).                                               | `next.config.ts`                                                 |
| **RNF-04** | Segurança         | Nenhuma vulnerabilidade **alta ou crítica** nas dependências de produção.                                                                                       | `npm audit --omit=dev --audit-level=high` no CI + Dependabot     |
| **RNF-05** | Privacidade/LGPD  | Coletar o mínimo; e-mail nunca exposto publicamente; confirmações só em agregado; sem anúncios nem rastreadores; exclusão de conta imediata pelo próprio app. | Esquema (`profiles` sem e-mail), `feira_confirmation_stats`, RF-13 |
| **RNF-06** | Integridade       | Dados validados no banco (tamanhos, formatos, coordenadas dentro do Brasil, JSON de preços), não só na tela.                                                   | `check` constraints + esquemas Zod espelhados                    |
| **RNF-07** | Antiabuso         | Limites por usuário: 10 relatos/hora, 20 sugestões/dia, 20 convidados por lista.                                                                               | Gatilhos e função no banco                                       |
| **RNF-08** | Disponibilidade   | O mapa **nunca fica vazio**: se o Supabase falhar, o servidor usa o JSON embutido.                                                                             | `getFeiras()` com fallback                                       |
| **RNF-09** | Desempenho        | Página inicial gerada estaticamente e revalidada a cada 5 min (ISR); mapa carregado só no navegador.                                                           | `revalidate = 300`, `dynamic(..., { ssr: false })`               |
| **RNF-10** | Acessibilidade    | Navegável por teclado; janelas fecham com Esc e prendem o foco; campos com rótulo; botões só com ícone têm `aria-label`; mensagens com `role="alert"/"status"`. | Componente `Modal`, testes com Testing Library por papel/rótulo  |
| **RNF-11** | Responsividade    | Uso confortável em celular e desktop.                                                                                                                          | E2E rodam em "desktop" e "celular" (Pixel 7)                     |
| **RNF-12** | Idioma            | Interface, mensagens de erro e e-mails em **português do Brasil**, linguagem simples.                                                                          | `friendlyError()`, templates em `supabase/templates/`            |
| **RNF-13** | Honestidade dos dados | Nunca inventar horário, endereço ou coordenada; marcar o que não foi verificado.                                                                           | `tests/unit/data.test.ts`, [DADOS.md](DADOS.md)                  |
| **RNF-14** | Custo             | Operar nos planos gratuitos de Vercel e Supabase.                                                                                                              | Arquitetura sem servidor próprio                                 |
| **RNF-15** | Qualidade         | Todo PR passa por lint, formatação, tipos, testes unitários, testes de banco, build e testes no navegador.                                                     | `.github/workflows/ci.yml`                                       |

## 5. Regras de negócio

| Código    | Regra                                                                                                                                                         | Onde está                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **RN-01** | Selo **Não verificada**: `verified = false`.                                                                                                                 | `FeiraBadges.tsx`                               |
| **RN-02** | Selo **Local aprox.**: `accuracy = 'approximate'`.                                                                                                           | `FeiraBadges.tsx`                               |
| **RN-03** | Selo **Confirmada em dd/mm**: houve ao menos uma confirmação "funcionando" nos últimos 30 dias; mostra a data da mais recente.                              | `FeiraBadges.tsx`, `feira_confirmation_stats()` |
| **RN-04** | Selo **Pode ter mudado**: nos últimos 30 dias, os "não encontrei" são maioria ou empatam com os "funcionando" (e há pelo menos um).                         | `FeiraBadges.tsx`                               |
| **RN-05** | Feira sugerida pela comunidade entra **sempre** como `verified = false` e `accuracy = 'approximate'`, com a fonte "Sugestão da comunidade (aprovada em dd/mm/aaaa)". | `approve_suggestion()`                         |
| **RN-06** | Correção aprovada altera **só os campos enviados**; endereço ou horário enviados vazios são apagados (`null`).                                               | `approve_suggestion()`                          |
| **RN-07** | "Não existe mais" aprovado define `active = false`: a feira some do mapa, mas não é apagada.                                                                 | `approve_suggestion()`                          |
| **RN-08** | Uma sugestão só pode ser revisada uma vez (status `pendente` → `aprovada` ou `rejeitada`).                                                                   | `approve_suggestion()`, `reject_suggestion()`   |
| **RN-09** | Confirmação: uma por pessoa, por feira, por dia; só a do **dia atual** pode ser criada ou alterada.                                                          | Chave primária + políticas RLS                  |
| **RN-10** | Relato oculto pela moderação some do mural para todos. (A RLS ainda deixa o autor e os administradores lerem o registro; o app filtra `hidden = false`.) | Política "Relatos visíveis são públicos", `listPosts()` |
| **RN-11** | Compartilhamento: só com e-mail de **conta existente**; não é possível compartilhar consigo mesmo; repetir o mesmo e-mail não duplica.                      | `share_shopping_list()`                         |
| **RN-12** | O autor de um item (`added_by`) é definido **pelo banco** na criação e nunca muda.                                                                           | Gatilho `shopping_items_set_added_by`           |
| **RN-13** | O convidado **não** pode compartilhar a lista de outra pessoa; só o dono compartilha a própria lista.                                                        | `share_shopping_list()` usa sempre `auth.uid()` como dono |
| **RN-14** | Itens importados do aparelho só podem ir para a **própria** lista.                                                                                           | `ShoppingListModal.tsx`                         |
| **RN-15** | O horário só é exibido quando a fonte informa; caso contrário aparece "horário não confirmado".                                                             | `HoursText`, [DADOS.md](DADOS.md)               |

## 6. Casos de uso principais

### UC-01 Encontrar uma feira para hoje

1. Visitante abre o site.
2. Escolhe a cidade e toca em **Hoje**.
3. O sistema filtra pelas feiras do dia do aparelho e centraliza o mapa na cidade.
4. Visitante toca numa feira e abre os detalhes.
5. Toca em **Como chegar** e o Google Maps abre numa nova aba.

**Alternativo 3a:** nenhuma feira encontrada. O sistema mostra a mensagem de lista vazia e o
botão **Limpar filtros**.

### UC-02 Publicar um relato com preços

**Pré-condição:** usuário logado.

1. Usuário abre os detalhes da feira.
2. Escreve o relato, dá uma nota, adiciona preços e anexa uma foto.
3. O sistema valida na tela (Zod) e envia a foto para `post-photos/<id-do-usuário>/`.
4. O sistema grava o relato; o banco valida de novo e aplica o limite de 10 por hora.
5. O relato aparece no topo do mural.

**Exceções:** foto com tipo ou tamanho inválido (mensagem antes do envio); limite atingido
("Limite de relatos atingido. Tente novamente mais tarde.").

### UC-03 Sugerir uma feira que falta e ver no mapa

1. Usuário toca em **+ Sugerir uma feira que falta** (se não estiver logado, abre o login).
2. Preenche os dados e marca o ponto no mapa (ou usa a localização do aparelho).
3. O sistema grava a sugestão como `pendente`.
4. Administrador abre `/admin` e aprova.
5. Em até 5 minutos a feira aparece no mapa com os selos _Não verificada_ e _Local aprox._

### UC-04 Fazer a feira em família com a lista compartilhada

1. Dono abre **Minha lista** e, em **Compartilhar lista**, digita o e-mail da pessoa.
2. O sistema confirma: "Lista compartilhada com {nome}."
3. Convidado abre **Minha lista** e vê a aba **Lista de {dono}**.
4. Convidado adiciona "Banana"; o dono vê o item com "por {convidado}" ao voltar ao app.
5. Na feira, qualquer um marca os itens comprados.
6. Dono remove a pessoa (ou o convidado toca em **Sair desta lista**).

**Exceções:** e-mail sem conta ("A pessoa precisa entrar no app uma vez antes."), o próprio
e-mail, limite de 20 pessoas.

### UC-05 Excluir a conta

1. Usuário abre o menu com seu nome e toca em **Excluir minha conta**.
2. Confirma.
3. O sistema apaga as fotos do Storage e chama `delete_my_account()`, que apaga o usuário e,
   em cascata, todos os dados.
4. O usuário volta a ser visitante.

## 7. Rastreabilidade: requisitos × testes

| Requisitos                    | Testes                                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| RF-01, RF-02, RF-03, RF-04    | `tests/unit/lib.test.ts` (filterFeiras), `tests/unit/components.test.tsx` (`<Filters>`), E2E "carrega o mapa, lista e filtros" |
| RF-05, RF-06                  | `components.test.tsx` (`<FeiraCard>`), E2E "abre detalhes de uma feira com selos e mural vazio"                              |
| RF-07, RNF-13, RN-15          | `tests/unit/data.test.ts`                                                                                                     |
| RF-10, RF-11, RF-12           | RLS "cria perfil automaticamente…", E2E "login real por e-mail…"                                                              |
| RF-13                         | RLS "excluir conta apaga o usuário…", "anônimo não consegue chamar exclusão…", E2E "sugerir nova feira e excluir a conta"     |
| RF-20 a RF-23, RN-10, RNF-07  | RLS "relato: publica…", "não é possível publicar em nome…", "rejeita preços malformados…", "relato oculto…", "limita a 10…", "foto só pode ser enviada…" |
| RF-30, RF-31, RN-09           | RLS "confirmação: uma por dia…", "não aceita confirmação com data falsa"                                                      |
| RF-32, RF-33, RF-40 a RF-42, RN-05 a RN-08 | RLS "sugestão nova…", "sugestão de alteração…", "usuário só vê as próprias sugestões", E2E "moderador aprova correção…" |
| RF-50 a RF-53                 | `tests/unit/community.test.ts` (lista local), `components.test.tsx` (`<ShoppingListModal>`), RLS "lista de compras é privada", E2E "lista de compras funciona sem login" |
| RF-54 a RF-56, RN-11 a RN-13  | RLS "compartilhamento da lista de compras" (4 testes), E2E "dono compartilha por e-mail…"                                     |
| RF-60                         | E2E "páginas institucionais"                                                                                                  |
| RNF-01, RNF-02                | Toda a suíte `tests/integration/rls.test.ts`                                                                                  |
| RNF-11                        | Todos os E2E rodam nos projetos "desktop" e "celular"                                                                         |

## 8. Limitações conhecidas e backlog

| Item                                                                                       | Impacto                                            |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| E-mails de login usam o servidor padrão do Supabase (poucos envios por hora, remetente genérico). | Configurar SMTP próprio (Resend) e domínio.        |
| Horários das feiras do Rio não foram reconferidos na fonte.                                | Ver [DADOS.md](DADOS.md).                          |
| 10 cidades com lista **não verificada**.                                                   | Buscar fontes oficiais.                            |
| Lista compartilhada atualiza ao voltar ao app, não em tempo real.                          | Avaliar Supabase Realtime.                         |
| Não há service worker: o PWA instala, mas não abre sem internet.                           | Avaliar cache offline do catálogo.                 |
| Sem backup automático no plano gratuito do Supabase.                                       | Rotina manual em [OPERACAO.md](OPERACAO.md).       |
| Relatos são apagados de verdade (sem lixeira).                                             | Aceito por simplicidade e LGPD.                    |
