# Mudanças

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [1.0.0] — 2026-10-04

Revisão completa para deixar o projeto pronto para produção.

### Segurança

- Next.js atualizado para 16.3.8 (corrige vulnerabilidade crítica de execução remota de código).
- Login falso removido. Agora o login é real, com Google ou link por e-mail, via Supabase Auth.
- Banco com RLS em todas as tabelas, limites contra spam e validação no servidor.
- O e-mail do usuário deixou de ser enviado a serviço de avatar de terceiros (DiceBear).
- Ícones do mapa servidos pelo próprio site (antes vinham do unpkg.com).
- Cabeçalhos HTTP de segurança.

### Adicionado

- Mural real e compartilhado: relatos com nota, preços e foto; apagar e denunciar.
- Confirmação de funcionamento ("Está funcionando" / "Não encontrei") com resumo público anônimo.
- Sugestões de nova feira (com mapa para marcar o local) e de correção, com moderação.
- Painel de moderação em `/admin`.
- Lista de compras sincronizada na conta, com importação dos itens salvos no aparelho.
- Exclusão de conta e de todos os dados (exigência da Google Play e da LGPD).
- Páginas Sobre os dados, Política de privacidade e Termos de uso.
- Selos de qualidade: não verificada, local aproximado, confirmada, pode ter mudado.
- Link "Como chegar", botão "Limpar filtros", busca sem acentos e com várias palavras.
- Ícones PNG (192, 512, maskable, Apple) para PWA e Google Play.
- 46 testes unitários/componentes, 20 de segurança do banco e 14 no navegador (desktop e celular).
- CI no GitHub Actions, Dependabot, Prettier, templates de PR e issue.
- Documentação: produção, arquitetura, dados, Play Store, contribuição e segurança.

### Corrigido

- Relatos inventados ("Ana Paula Silva", "Roberto Santos"…) removidos do mural.
- Itens de exemplo inventados removidos da lista de compras.
- Horários sem fonte removidos de 128 feiras; endereços genéricos removidos de 7.
- 27 feiras não verificadas deixaram de afirmar ter "coordenada oficial".
- Botão "Hoje" mostrava o dia em que o site foi publicado, e não o dia do usuário.
- `npm run lint` não rodava (configuração do ESLint quebrada).
- Janelas não fechavam com Esc nem prendiam o foco; botões sem rótulo para leitores de tela.
- Cards da lista não eram acessíveis pelo teclado.
- Menu do usuário ficava escondido atrás do cabeçalho.
- Lista de compras somava itens já comprados no total.
