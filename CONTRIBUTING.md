# Como contribuir

## Fluxo

1. Crie um branch a partir de `main`: `git checkout -b feat/descricao-curta`
2. Faça as mudanças com commits pequenos no padrão
   [Conventional Commits](https://www.conventionalcommits.org/pt-br/):
   `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`
3. Rode `npm run check` (lint, tipos, testes e build).
4. Abra um Pull Request. O CI roda tudo de novo, inclusive os testes de banco e de navegador.
5. Só faça merge com o CI verde.

## Regras do projeto

- **Dados:** nunca invente horário, endereço ou coordenada. Na dúvida, deixe `null` e marque
  `verified: false`. Veja [docs/DADOS.md](docs/DADOS.md).
- **Banco:** toda tabela nova tem RLS e testes em `tests/integration/rls.test.ts`. Nunca edite
  migration já aplicada; crie uma nova.
- **Textos:** interface em português do Brasil, linguagem simples.
- **Acessibilidade:** botões com texto ou `aria-label`, campos com `<label>`, use o componente
  `Modal` (fecha com Esc e prende o foco).
- **Segredos:** nada de chaves `service_role`/`secret` no código. Só variáveis
  `NEXT_PUBLIC_*` vão para o navegador.

## Usando IA para programar

Tudo bem usar IA, mas revise o que ela gera e rode `npm run check`. Peça explicitamente para:
não inventar dados, escrever testes para o que mudou, e manter as regras de RLS.
