# Dados das feiras

## Fontes

| Cidade(s)          | Fonte                                                 | Coordenadas         | Horário            |
| ------------------ | ----------------------------------------------------- | ------------------- | ------------------ |
| São Paulo (60)     | GeoSampa / Prefeitura (equipamento_feira_livre)       | oficiais            | não informado      |
| Rio de Janeiro (60)| Relação de Feiras Livres da SEOP                      | aproximadas         | mantido (ver nota) |
| Cuiabá (39)        | Portal Feiras Cuiabá (`data/sources/`)                | 1 oficial, 38 aprox.| não informado      |
| Outras 10 cidades  | Lista inicial **não verificada**                      | aproximadas         | removido           |

**Nota sobre o Rio:** os horários do Rio foram mantidos porque são atribuídos à lista da SEOP e
variam entre feiras, mas não foram reconferidos na fonte. Vale conferir na próxima atualização.

## Correções feitas em 04/10/2026

A primeira versão dos dados foi gerada com ajuda de IA e continha informações sem respaldo na
fonte. Foram corrigidas:

- **Horários removidos (128 feiras):** os 60 de São Paulo eram todos iguais ("08:00–14:00"); os
  39 de Cuiabá foram "inferidos" (a API não informa horário); os das cidades não verificadas não
  tinham fonte. O app agora mostra "horário não confirmado".
- **Endereços genéricos removidos (7 feiras de Cuiabá):** ex.: "Av. A com Av. B", "Av. Principal".
- **Coordenadas rebaixadas (27 feiras):** feiras não verificadas marcadas como
  `official_coords` passaram para `approximate`.
- **Campo `verified`:** `true` só para SP, Rio e Cuiabá (fontes municipais).
- Espaços duplicados em nomes/endereços normalizados; cópia duplicada `data/feiras.json`
  removida; dados brutos de Cuiabá movidos para `data/sources/`.

Os testes em `tests/unit/data.test.ts` impedem que esses problemas voltem.

## Formato

```json
{
  "id": "sp-vila-madalena-sab-01",
  "name": "Feira Vila Madalena",
  "city": "São Paulo",
  "neighborhood": "Vila Madalena",
  "lat": -23.556633,
  "lng": -46.691754,
  "daysOfWeek": ["sabado"],
  "hours": null,
  "address": "Rua Mourato Coelho, 1100",
  "source": "GeoSampa / Prefeitura de São Paulo (equipamento_feira_livre, carga 2026-06)",
  "accuracy": "official_coords",
  "verified": true
}
```

- `id`: minúsculas, números e hífen (`cidade-bairro-dia-NN`).
- `daysOfWeek`: `domingo`, `segunda`, `terca`, `quarta`, `quinta`, `sexta`, `sabado`.
- `hours`: só preencha se a fonte informar. Caso contrário, `null`.
- `accuracy`: `official_coords` apenas quando a coordenada vem da fonte oficial.
- `verified`: `true` apenas quando a feira foi conferida em fonte oficial.

## Atualizando

**No dia a dia:** use as sugestões da comunidade e aprove em `/admin`. Isso altera o banco
direto, sem mexer no JSON.

**Carga em massa (nova cidade, nova versão da fonte oficial):**

1. Edite `src/data/feiras.json`.
2. Rode `npm test` (valida esquema, ids, distância do centro da cidade etc.).
3. Se a cidade for nova, adicione o centro dela em `src/lib/cityCenters.ts`.
4. Rode `npm run db:gerar-carga` e crie uma migration nova copiando o arquivo gerado, para não
   reaplicar a antiga em produção:
   `cp supabase/migrations/20261004120100_carga_feiras.sql supabase/migrations/$(date +%Y%m%d%H%M%S)_carga_feiras_v2.sql`
5. `npx supabase db push`.

A carga usa _upsert_: atualiza feiras com o mesmo `id` e não apaga as aprovadas pela comunidade.
