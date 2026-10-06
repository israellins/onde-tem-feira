# 0006. Leaflet + OpenStreetMap em vez de Google Maps

- **Status:** Aceita
- **Data:** 2026-10-04

## Contexto

O mapa é a tela principal. A API do Google Maps exige chave, conta de faturamento e cobra
acima da cota; o projeto não tem orçamento nem quer rastreadores de terceiros.

## Decisão

Usar **Leaflet** com **tiles do OpenStreetMap**, carregado só no navegador. "Como chegar" é
apenas um **link** para o Google Maps (sem API e sem chave).

## Alternativas consideradas

- **Google Maps JavaScript API:** custo, chave exposta, rastreamento.
- **Mapbox/MapLibre com tiles vetoriais:** visual melhor, mas exige conta e chave.

## Consequências

- ✅ Gratuito, sem chave, código aberto.
- ⚠️ Os tiles públicos do OSM têm política de uso justo; se o tráfego crescer muito, migrar
  para um provedor de tiles (o endereço está centralizado em `OSM_TILES`).
- ⚠️ O IP do usuário chega aos servidores do OSM (declarado na política de privacidade).
