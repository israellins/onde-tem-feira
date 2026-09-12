# Onde tem feira

Plataforma para mapear **feiras livres** no Brasil. MVP com mapa interativo, filtros e lista sincronizada para **Rio de Janeiro**, **São Paulo** e **Cuiabá**.

## Como rodar

```bash
npm i
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Build de produção:

```bash
npm run build
npm start
```

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Mapa: `react-leaflet` + tiles OpenStreetMap
- Dados: JSON estático em `src/data/feiras.json` (cópia em `data/feiras.json`)

## Funcionalidades (v1)

- Mapa com marcadores e popup (nome, bairro, cidade, dias, horário, endereço)
- Filtros por cidade, dia da semana e busca textual
- Atalho **Hoje**
- Lista lateral sincronizada com o mapa (clique na lista centraliza o marcador)
- Interface em **pt-BR**, visual quente de feira, layout mobile-friendly

## Como adicionar feiras

1. Edite `src/data/feiras.json` (e mantenha `data/feiras.json` alinhado se quiser).
2. Cada feira deve ter o formato:

```json
{
  "id": "rj-exemplo-sab-99",
  "name": "Feira da Rua Exemplo",
  "city": "Rio de Janeiro",
  "neighborhood": "Bairro",
  "lat": -22.9,
  "lng": -43.2,
  "daysOfWeek": ["sabado"],
  "hours": "07:00–13:00",
  "address": "Rua Exemplo",
  "source": "Fonte municipal ou URL",
  "accuracy": "approximate"
}
```

3. Valores de `daysOfWeek`: `domingo`, `segunda`, `terca`, `quarta`, `quinta`, `sexta`, `sabado`.
4. Use `accuracy`: `official_coords` quando a coordenada vier de dado oficial; `approximate` para geocodificação aproximada.
5. **Não invente** horários oficiais precisos. Prefira omitir `hours` ou marcar a fonte.

Depois de editar, rode `npm run build` para validar.

## Fontes de dados (seed)

| Cidade | Fonte | Observação |
|--------|--------|------------|
| São Paulo | [GeoSampa](https://geosampa.prefeitura.sp.gov.br/) WFS `equipamento_feira_livre` | Coordenadas oficiais (convertidas de SIRGAS 2000 UTM 23S). Horário padrão tradicional 08:00–14:00 quando o campo de horário vem vazio. Subconjunto curado do cadastro (~975 feiras no WFS). |
| Rio de Janeiro | [SEOP / Coordenadoria de Feiras](https://ordempublica.prefeitura.rio/feiras) — Relação das Feiras Livres | Dias e horários da lista municipal. Coordenadas **aproximadas** por geocodificação de rua/bairro. |
| Cuiabá | [Portal Feiras Cuiabá](https://feiras.cuiaba.mt.gov.br/) API `/api/feiras` | Dias oficiais. Coordenadas oficiais quando presentes; demais aproximadas por bairro. Horários inferidos do padrão municipal (manhã aos domingos / noturno em dias úteis) quando a API não informa. |

> Os dados podem ficar desatualizados. Sempre confira com a prefeitura ou no local.

## Estrutura do projeto

```
src/
  app/                 # App Router (layout, página, CSS)
  components/          # UI: filtros, lista, mapa
  data/feiras.json     # Seed das feiras
  lib/                 # Filtros, dias da semana, centros de cidade
  types/               # Tipos TypeScript
data/                  # Cópia do seed + raw da API de Cuiabá
```

## Licença

Código do app: livre para uso do repositório. Os dados municipais permanecem sujeitos às licenças/termos das respectivas prefeituras.
