import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return (
    <ContentPage title="Termos de uso">
      <p className="text-xs text-stone-500">Última atualização: 04/10/2026</p>

      <h2>O serviço</h2>
      <p>
        O Onde tem feira é um mapa colaborativo e gratuito de feiras livres. As informações vêm de
        fontes públicas e de usuários e podem estar desatualizadas. Confirme dias e horários antes
        de ir. Não nos responsabilizamos por deslocamentos feitos com base em informações
        incorretas.
      </p>

      <h2>Sua conta</h2>
      <p>
        Você é responsável pelo que publica. Pode excluir sua conta a qualquer momento pelo próprio
        app.
      </p>

      <h2>Regras do mural</h2>
      <ul>
        <li>Publique apenas experiências reais e preços que você viu.</li>
        <li>
          Não publique ofensas, discriminação, propaganda, dados pessoais de terceiros ou conteúdo
          ilegal.
        </li>
        <li>
          Envie apenas fotos que você tirou ou tem direito de usar, sem rostos de pessoas que não
          autorizaram.
        </li>
      </ul>
      <p>
        Conteúdos que violem estas regras podem ser ocultados ou removidos, e contas reincidentes
        podem ser bloqueadas. Use o botão <strong>Denunciar</strong> para avisar a moderação.
      </p>

      <h2>Licença dos dados</h2>
      <p>
        Mapas © colaboradores do OpenStreetMap. Dados de feiras de origem municipal pertencem às
        respectivas prefeituras.
      </p>
    </ContentPage>
  );
}
