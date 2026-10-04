import { expect, test } from "@playwright/test";
import { loginByEmail, uniqueEmail } from "./helpers";

test.describe("visitante (sem login)", () => {
  test("carrega o mapa, lista e filtros", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Onde tem feira", level: 1 })).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible();

    const total = await page.getByText(/feiras encontradas/).textContent();
    await page.getByLabel("Cidade").selectOption("Cuiabá");
    await expect(page.getByText(/39 feiras encontradas/)).toBeVisible();

    await page.getByLabel("Buscar feira").fill("cpa");
    await expect(page.getByText(/feiras? encontradas?/)).not.toHaveText(total ?? "");
    await page.getByRole("button", { name: "Limpar filtros" }).click();
    await expect(page.getByText(/feiras encontradas/)).toHaveText(total ?? "");

    // "Hoje" mostra o dia do aparelho (fuso America/Cuiaba no teste)
    await expect(page.getByRole("button", { name: /^Hoje \(/ })).toBeEnabled();

    // Sem erros de hidratação ou JavaScript
    expect(errors.filter((e) => !/favicon|tile\.openstreetmap/i.test(e))).toEqual([]);
  });

  test("abre detalhes de uma feira com selos e mural vazio", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Buscar feira").fill("Santa Terezinha");
    await page
      .getByRole("button", { name: /Mural, preços e detalhes/ })
      .first()
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("horário não confirmado")).toBeVisible();
    await expect(dialog.getByText(/Entre para contar como está a feira/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("lista de compras funciona sem login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Minha lista" }).click();
    const dialog = page.getByRole("dialog", { name: "Minha lista de feira" });
    await dialog.getByLabel("Item", { exact: true }).fill("Mandioca");
    await dialog.getByRole("button", { name: "Adicionar" }).click();
    await expect(dialog.getByText("Mandioca")).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "Minha lista" }).click();
    await expect(page.getByRole("dialog").getByText("Mandioca")).toBeVisible();
  });

  test("páginas institucionais", async ({ page }) => {
    for (const [path, title] of [
      ["/sobre", "Sobre os dados"],
      ["/privacidade", "Política de privacidade"],
      ["/termos", "Termos de uso"],
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
    }
    const manifest = await page.request.get("/manifest.json");
    expect(manifest.ok()).toBe(true);
    const icon = await page.request.get("/icons/icon-512.png");
    expect(icon.headers()["content-type"]).toBe("image/png");
  });
});

test.describe("usuário logado", () => {
  test("login real por e-mail, relato, confirmação, lista sincronizada e logout", async ({
    page,
  }) => {
    const email = uniqueEmail("e2e");
    await page.goto("/");
    await loginByEmail(page, email);

    // Relato no mural
    await page.getByLabel("Buscar feira").fill("Vila Madalena");
    await page
      .getByRole("button", { name: /Mural, preços e detalhes/ })
      .first()
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Seu relato").fill("Tomate muito bom hoje!");
    await dialog.getByLabel("Produto", { exact: true }).fill("Tomate");
    await dialog.getByLabel("Preço", { exact: true }).fill("R$ 6/kg");
    await dialog.getByRole("button", { name: "Adicionar", exact: true }).click();
    await dialog.getByRole("radio", { name: "4 estrelas" }).click();
    await dialog.getByRole("button", { name: "Publicar relato" }).click();
    await expect(dialog.getByText("Tomate muito bom hoje!")).toBeVisible();
    await expect(dialog.getByText("R$ 6/kg")).toBeVisible();

    // Confirmação de funcionamento
    await dialog.getByRole("button", { name: "✓ Está funcionando" }).click();
    await expect(dialog.getByText(/Você informou em/)).toBeVisible();
    await expect(dialog.getByText(/Confirmada em/)).toBeVisible();

    // Apagar o próprio relato
    page.once("dialog", (d) => d.accept());
    await dialog.getByRole("button", { name: "Apagar" }).click();
    await expect(dialog.getByText("Tomate muito bom hoje!")).toBeHidden();
    await page.keyboard.press("Escape");

    // Lista sincronizada na conta
    await page.getByRole("button", { name: "Minha lista" }).click();
    const list = page.getByRole("dialog", { name: "Minha lista de feira" });
    await expect(list.getByText(/Salva na sua conta/)).toBeVisible();
    await list.getByLabel("Item", { exact: true }).fill("Pastel de queijo");
    await list.getByRole("button", { name: "Adicionar" }).click();
    await expect(list.getByText("Pastel de queijo")).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "Minha lista" }).click();
    await expect(page.getByRole("dialog").getByText("Pastel de queijo")).toBeVisible();
    await page.keyboard.press("Escape");

    // Logout
    await page.getByRole("button", { name: /e2e/ }).click();
    await page.getByRole("menuitem", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("sugerir nova feira e excluir a conta", async ({ page }) => {
    const email = uniqueEmail("sugere");
    await page.goto("/");
    await loginByEmail(page, email);

    await page.getByRole("button", { name: "+ Sugerir uma feira que falta" }).click();
    const dialog = page.getByRole("dialog", { name: "Sugerir nova feira" });
    await dialog.getByLabel("Nome da feira").fill("Feira do Teste E2E");
    await dialog.getByLabel("Cidade").fill("Cuiabá");
    await dialog.getByLabel("Bairro").fill("Centro");
    await dialog.getByRole("button", { name: "Sábado" }).click();
    await dialog.getByRole("button", { name: "Enviar sugestão" }).click();
    await expect(dialog.getByText("Marque no mapa onde a feira acontece.")).toBeVisible();
    await dialog.locator(".leaflet-container").click();
    await expect(dialog.getByText(/^Marcado:/)).toBeVisible();
    await dialog.getByRole("button", { name: "Enviar sugestão" }).click();
    await expect(dialog.getByText(/sugestão foi enviada/)).toBeVisible();
    await dialog.getByRole("button", { name: "Fechar", exact: true }).first().click();

    // Exclusão de conta (exigência da Play Store)
    await page.getByRole("button", { name: /sugere/ }).click();
    await page.getByRole("menuitem", { name: "Excluir minha conta" }).click();
    await page.getByRole("button", { name: "Excluir para sempre" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });
});

test.describe("moderação", () => {
  const SERVICE = process.env.SUPABASE_TEST_SERVICE_KEY;
  const API = process.env.SUPABASE_TEST_URL ?? "http://127.0.0.1:54321";
  test.skip(!SERVICE, "precisa de SUPABASE_TEST_SERVICE_KEY para promover o moderador");

  test("moderador aprova correção sugerida por usuário", async ({ page, browser }) => {
    // 1) Usuário comum sugere correção de horário
    const email = uniqueEmail("colab");
    await page.goto("/");
    await loginByEmail(page, email);
    await page.getByLabel("Buscar feira").fill("Feira do CPA II");
    await page
      .getByRole("button", { name: /Mural, preços e detalhes/ })
      .first()
      .click();
    await page.getByRole("dialog").getByRole("button", { name: "Sugerir correção" }).click();
    const form = page.getByRole("dialog", { name: "Sugerir correção" });
    await form.getByLabel("Horário (opcional)").fill("06:00–11:00");
    await form.getByRole("button", { name: "Enviar sugestão" }).click();
    await expect(form.getByText(/sugestão foi enviada/)).toBeVisible();

    // 2) Moderador entra (promovido via chave de serviço, como no SQL Editor)
    const modPage = await (await browser.newContext()).newPage();
    const modEmail = uniqueEmail("moderador");
    await modPage.goto("/");
    await loginByEmail(modPage, modEmail);
    const headers = {
      apikey: SERVICE!,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
    };
    const users = await (
      await fetch(`${API}/auth/v1/admin/users?per_page=200`, { headers })
    ).json();
    const mod = users.users.find((u: { email: string }) => u.email === modEmail);
    await fetch(`${API}/rest/v1/profiles?id=eq.${mod.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ is_admin: true }),
    });
    await modPage.goto("/admin");

    const card = modPage.locator("article", { hasText: email.split("@")[0] });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Aprovar" }).click();
    await expect(modPage.getByText(/Sugestão aprovada/)).toBeVisible();

    // 3) Restaura o dado original
    await fetch(`${API}/rest/v1/feiras?id=eq.cba-cpa-ii-dom-14`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ hours: null }),
    });
  });
});
