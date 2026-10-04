import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = { title: "Política de privacidade" };

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null;

function ContactLink() {
  return CONTACT ? (
    <a className="underline" href={`mailto:${CONTACT}`}>
      {CONTACT}
    </a>
  ) : (
    <>o e-mail de contato informado na página do app na Google Play</>
  );
}
const UPDATED = "04/10/2026";

export default function PrivacidadePage() {
  return (
    <ContentPage title="Política de privacidade">
      <p className="text-xs text-stone-500">Última atualização: {UPDATED}</p>
      <p>
        Esta política explica quais dados o Onde tem feira coleta, por que e como você pode
        controlá-los, conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
      </p>

      <h2>Dados que coletamos</h2>
      <ul>
        <li>
          <strong>Sem conta:</strong> nada é enviado para nós. Sua lista de compras fica salva
          apenas no seu aparelho.
        </li>
        <li>
          <strong>Com conta:</strong> e-mail (para login), nome e foto de perfil quando você entra
          com Google.
        </li>
        <li>
          <strong>O que você publica:</strong> relatos, notas, preços e fotos no mural (públicos,
          exibidos com seu nome), confirmações de funcionamento (exibidas só de forma agregada e
          anônima), sugestões de feiras e sua lista de compras (privada).
        </li>
        <li>
          <strong>Localização:</strong> só quando você toca em &quot;Usar minha localização&quot; ao
          sugerir uma feira. Ela não é guardada; apenas o ponto da feira que você enviar.
        </li>
      </ul>

      <h2>Para que usamos</h2>
      <ul>
        <li>Permitir login e associar suas publicações à sua conta.</li>
        <li>Mostrar o mural e manter o mapa de feiras atualizado.</li>
        <li>Moderar conteúdo e evitar abuso.</li>
      </ul>
      <p>Não vendemos dados e não usamos anúncios nem rastreadores de terceiros.</p>

      <h2>Com quem compartilhamos</h2>
      <ul>
        <li>
          <strong>Supabase:</strong> hospedagem do banco de dados, login e fotos.
        </li>
        <li>
          <strong>Google:</strong> apenas se você escolher entrar com Google.
        </li>
        <li>
          <strong>OpenStreetMap:</strong> fornece as imagens do mapa (recebe seu endereço IP ao
          carregar o mapa).
        </li>
      </ul>

      <h2 id="excluir-conta">Como excluir sua conta e seus dados</h2>
      <p>
        No app, toque no seu nome no topo da tela e escolha <strong>Excluir minha conta</strong>. A
        exclusão é imediata e apaga conta, perfil, relatos, fotos, lista de compras, confirmações e
        sugestões. Se não conseguir acessar o app, peça a exclusão por e-mail para <ContactLink />.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail{" "}
        <ContactLink />.
      </p>
    </ContentPage>
  );
}
