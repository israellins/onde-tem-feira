import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = { title: "Sobre os dados" };

export default function SobrePage() {
  return (
    <ContentPage title="Sobre os dados">
      <p>
        O Onde tem feira reúne feiras livres a partir de dados públicos das prefeituras e de
        contribuições da comunidade. Nosso compromisso é ser transparente sobre o que sabemos e o
        que ainda não foi confirmado.
      </p>

      <h2>De onde vêm as feiras</h2>
      <ul>
        <li>
          <strong>São Paulo:</strong> GeoSampa / Prefeitura de São Paulo (coordenadas oficiais).
        </li>
        <li>
          <strong>Rio de Janeiro:</strong> relação de feiras livres da SEOP; posições aproximadas a
          partir do endereço.
        </li>
        <li>
          <strong>Cuiabá:</strong> Portal Feiras Cuiabá; posições aproximadas pelo bairro, exceto
          quando a prefeitura informa a coordenada.
        </li>
        <li>
          <strong>Outras cidades:</strong> lista inicial ainda <em>não verificada</em> em fonte
          oficial.
        </li>
        <li>
          <strong>Comunidade:</strong> feiras novas e correções sugeridas por usuários, revisadas
          antes de publicar.
        </li>
      </ul>

      <h2>O que significam os selos</h2>
      <ul>
        <li>
          <strong>Não verificada:</strong> a feira não foi conferida em uma fonte oficial.
        </li>
        <li>
          <strong>Local aprox.:</strong> o ponto no mapa é uma estimativa (bairro ou rua), não o
          local exato.
        </li>
        <li>
          <strong>Confirmada em dd/mm:</strong> alguém esteve lá e confirmou que a feira estava
          funcionando.
        </li>
        <li>
          <strong>Pode ter mudado:</strong> usuários relataram não ter encontrado a feira
          recentemente.
        </li>
        <li>
          <strong>Horário não confirmado:</strong> a fonte oficial não informa o horário.
        </li>
      </ul>

      <h2>Encontrou um erro?</h2>
      <p>
        Entre com sua conta, abra a feira e toque em <strong>Sugerir correção</strong>, ou use{" "}
        <strong>Sugerir uma feira que falta</strong> no topo da página.
      </p>
    </ContentPage>
  );
}
