import { expect, type Page } from "@playwright/test";

const MAILPIT = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

/** Busca no Mailpit (caixa de e-mail falsa do Supabase local) o link de acesso. */
async function waitForMagicLink(email: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const res = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`);
    const { messages } = (await res.json()) as { messages: { ID: string }[] };
    if (messages?.length) {
      const msg = (await (await fetch(`${MAILPIT}/api/v1/message/${messages[0].ID}`)).json()) as {
        Text: string;
        HTML: string;
      };
      const match = (msg.HTML || msg.Text).match(
        /https?:\/\/[^"'\s<>]+\/auth\/v1\/verify[^"'\s<>]+/,
      );
      if (match) return match[0].replace(/&amp;/g, "&");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Link de acesso não chegou para ${email}`);
}

/** Faz login pelo fluxo real de "link por e-mail". */
export async function loginByEmail(page: Page, email: string) {
  await page.getByRole("button", { name: "Entrar" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Entrar no Onde tem feira" });
  await dialog.getByLabel("Receber link de acesso por e-mail").fill(email);
  await dialog.getByRole("button", { name: "Enviar link" }).click();
  await expect(dialog.getByText(/Enviamos um link de acesso/)).toBeVisible();
  const link = await waitForMagicLink(email);
  await page.goto(link);
  await expect(
    page.getByRole("button", { name: new RegExp(email.split("@")[0].slice(0, 10)) }),
  ).toBeVisible({
    timeout: 15_000,
  });
}

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@teste.local`;
}
