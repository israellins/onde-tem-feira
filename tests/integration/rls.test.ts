// @vitest-environment node
/**
 * Testes de segurança do banco (RLS) contra um Supabase LOCAL.
 *
 * Como rodar:
 *   npx supabase start
 *   npm run test:db
 *
 * São pulados automaticamente quando SUPABASE_TEST_URL não está definido.
 * NUNCA aponte para o projeto de produção: o teste cria e apaga usuários.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const URL = process.env.SUPABASE_TEST_URL;
const ANON = process.env.SUPABASE_TEST_ANON_KEY;
const SERVICE = process.env.SUPABASE_TEST_SERVICE_KEY;
const enabled = Boolean(URL && ANON && SERVICE);

type Client = SupabaseClient<Database>;
const FEIRA = "sp-vila-madalena-sab-01";
const PASSWORD = "senha-de-teste-123";

let clientCount = 0;
const opts = () => ({
  auth: { persistSession: false, autoRefreshToken: false, storageKey: `teste-${clientCount++}` },
});

describe.skipIf(!enabled)("segurança do banco (RLS)", { timeout: 30_000 }, () => {
  let admin: Client; // service role — ignora RLS, só para preparar o cenário
  let anon: Client;
  let alice: Client;
  let bob: Client;
  let moderator: Client;
  const ids: Record<string, string> = {};
  const run = Date.now();

  async function makeUser(name: string): Promise<Client> {
    const email = `${name}-${run}@teste.local`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: `${name} Teste` },
    });
    if (error) throw error;
    ids[name] = data.user.id;
    const client = createClient<Database>(URL!, ANON!, opts());
    const { error: signInError } = await client.auth.signInWithPassword({
      email,
      password: PASSWORD,
    });
    if (signInError) throw signInError;
    return client;
  }

  beforeAll(async () => {
    admin = createClient<Database>(URL!, SERVICE!, opts());
    anon = createClient<Database>(URL!, ANON!, opts());
    alice = await makeUser("alice");
    bob = await makeUser("bob");
    moderator = await makeUser("moderador");
    const { error } = await admin
      .from("profiles")
      .update({ is_admin: true })
      .eq("id", ids.moderador);
    if (error) throw error;
  });

  afterAll(async () => {
    if (!admin) return;
    for (const id of Object.values(ids)) await admin.auth.admin.deleteUser(id).catch(() => {});
  });

  // ---------------------------------------------------------------- perfis
  it("cria perfil automaticamente com o nome do cadastro", async () => {
    const { data } = await anon
      .from("profiles")
      .select("display_name")
      .eq("id", ids.alice)
      .single();
    expect(data?.display_name).toBe("alice Teste");
  });

  it("usuário não consegue se promover a admin", async () => {
    const { error } = await alice.from("profiles").update({ is_admin: true }).eq("id", ids.alice);
    expect(error?.message).toMatch(/is_admin/);
  });

  it("usuário não edita o perfil de outra pessoa", async () => {
    await alice.from("profiles").update({ display_name: "hacker" }).eq("id", ids.bob);
    const { data } = await anon.from("profiles").select("display_name").eq("id", ids.bob).single();
    expect(data?.display_name).toBe("bob Teste");
  });

  // ---------------------------------------------------------------- feiras
  it("anônimo lê feiras mas não altera", async () => {
    const { data } = await anon.from("feiras").select("id").eq("id", FEIRA);
    expect(data).toHaveLength(1);
    const { error } = await anon.from("feiras").insert({
      id: "invasao-01",
      name: "X",
      city: "X",
      neighborhood: "X",
      lat: -10,
      lng: -50,
      days_of_week: ["sabado"],
      source: "x",
    });
    expect(error).not.toBeNull();
  });

  it("usuário comum não altera feiras diretamente", async () => {
    await alice.from("feiras").update({ name: "Hackeada" }).eq("id", FEIRA);
    const { data } = await anon.from("feiras").select("name").eq("id", FEIRA).single();
    expect(data?.name).not.toBe("Hackeada");
  });

  // ----------------------------------------------------------------- mural
  it("relato: publica, aparece para todos, só o autor apaga", async () => {
    const { data: post, error } = await alice
      .from("posts")
      .insert({
        feira_id: FEIRA,
        user_id: ids.alice,
        text: "Feira ótima",
        rating: 5,
        price_reports: [{ product: "Tomate", price: "R$ 5" }],
      })
      .select("id")
      .single();
    expect(error).toBeNull();

    const { data: seen } = await anon.from("posts").select("id").eq("id", post!.id);
    expect(seen).toHaveLength(1);

    const { data: deletedByBob } = await bob.from("posts").delete().eq("id", post!.id).select();
    expect(deletedByBob).toHaveLength(0);

    const { data: deletedByAlice } = await alice.from("posts").delete().eq("id", post!.id).select();
    expect(deletedByAlice).toHaveLength(1);
  });

  it("não é possível publicar em nome de outra pessoa", async () => {
    const { error } = await alice
      .from("posts")
      .insert({ feira_id: FEIRA, user_id: ids.bob, text: "falso" });
    expect(error).not.toBeNull();
  });

  it("anônimo não publica", async () => {
    const { error } = await anon
      .from("posts")
      .insert({ feira_id: FEIRA, user_id: ids.alice, text: "x" });
    expect(error).not.toBeNull();
  });

  it("rejeita preços malformados e nota inválida", async () => {
    const bad = await alice.from("posts").insert({
      feira_id: FEIRA,
      user_id: ids.alice,
      text: "x",
      price_reports: [{ product: 1 }],
    });
    expect(bad.error).not.toBeNull();
    const badRating = await alice
      .from("posts")
      .insert({ feira_id: FEIRA, user_id: ids.alice, text: "x", rating: 9 });
    expect(badRating.error).not.toBeNull();
  });

  it("relato oculto pela moderação some para o público", async () => {
    const { data: post } = await bob
      .from("posts")
      .insert({ feira_id: FEIRA, user_id: ids.bob, text: "spam" })
      .select("id")
      .single();
    await alice
      .from("post_reports")
      .insert({ post_id: post!.id, user_id: ids.alice, reason: "spam" });

    // Bob não consegue ver denúncias de outros nem ocultar
    const { data: reportsSeenByBob } = await bob
      .from("post_reports")
      .select("*")
      .eq("post_id", post!.id);
    expect(reportsSeenByBob).toHaveLength(0);
    await bob.from("posts").update({ hidden: true }).eq("id", post!.id);

    const { data: reports } = await moderator
      .from("post_reports")
      .select("reason")
      .eq("post_id", post!.id);
    expect(reports).toHaveLength(1);
    const { error } = await moderator.from("posts").update({ hidden: true }).eq("id", post!.id);
    expect(error).toBeNull();

    const { data: publicView } = await anon.from("posts").select("id").eq("id", post!.id);
    expect(publicView).toHaveLength(0);
  });

  it("limita a 10 relatos por hora", async () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({
      feira_id: FEIRA,
      user_id: ids.alice,
      text: `r${i}`,
    }));
    for (const row of rows) await alice.from("posts").insert(row);
    const { error } = await alice
      .from("posts")
      .insert({ feira_id: FEIRA, user_id: ids.alice, text: "11º" });
    expect(error?.message).toMatch(/Limite/);
  });

  // ------------------------------------------------------- lista de compras
  it("lista de compras é privada", async () => {
    await alice.from("shopping_items").insert({ user_id: ids.alice, item: "Alho" });
    const { data: mine } = await alice.from("shopping_items").select("item");
    const { data: bobs } = await bob.from("shopping_items").select("item");
    const { data: anons } = await anon.from("shopping_items").select("item");
    expect(mine?.map((r) => r.item)).toContain("Alho");
    expect(bobs).toHaveLength(0);
    expect(anons).toHaveLength(0);
  });

  // ---------------------------------------------------------- confirmações
  it("confirmação: uma por dia, corrigível, resumo anônimo", async () => {
    const first = await alice
      .from("feira_confirmations")
      .upsert(
        { feira_id: FEIRA, user_id: ids.alice, status: "nao_encontrada" },
        { onConflict: "feira_id,user_id,confirmed_on" },
      );
    expect(first.error).toBeNull();
    const second = await alice
      .from("feira_confirmations")
      .upsert(
        { feira_id: FEIRA, user_id: ids.alice, status: "funcionando" },
        { onConflict: "feira_id,user_id,confirmed_on" },
      );
    expect(second.error).toBeNull();

    const { data: stats } = await anon.rpc("feira_confirmation_stats");
    const row = stats?.find((s) => s.feira_id === FEIRA);
    expect(row?.confirmations_30d).toBeGreaterThanOrEqual(1);

    // Anônimo não vê quem confirmou
    const { data: raw } = await anon.from("feira_confirmations").select("*");
    expect(raw).toHaveLength(0);
  });

  it("não aceita confirmação com data falsa", async () => {
    const { error } = await alice.from("feira_confirmations").insert({
      feira_id: FEIRA,
      user_id: ids.alice,
      status: "funcionando",
      confirmed_on: "2020-01-01",
    });
    expect(error).not.toBeNull();
  });

  // ------------------------------------------------------------- sugestões
  it("sugestão nova: usuário envia, não aprova; moderador aprova e a feira aparece", async () => {
    const forged = await alice.from("feira_suggestions").insert({
      user_id: ids.alice,
      kind: "nova",
      payload: { name: "x" },
      status: "aprovada",
    });
    expect(forged.error).not.toBeNull();

    const { data: s, error } = await alice
      .from("feira_suggestions")
      .insert({
        user_id: ids.alice,
        kind: "nova",
        payload: {
          name: "Feira Teste Integração",
          city: "Cuiabá",
          neighborhood: "Centro",
          daysOfWeek: ["sabado"],
          lat: -15.6,
          lng: -56.1,
          address: null,
          hours: null,
        },
      })
      .select("id")
      .single();
    expect(error).toBeNull();

    const byAlice = await alice.rpc("approve_suggestion", { suggestion_id: s!.id });
    expect(byAlice.error).not.toBeNull();

    const byAnon = await anon.rpc("approve_suggestion", { suggestion_id: s!.id });
    expect(byAnon.error).not.toBeNull();

    const { data: newId, error: approveError } = await moderator.rpc("approve_suggestion", {
      suggestion_id: s!.id,
    });
    expect(approveError).toBeNull();
    expect(newId).toMatch(/^cuiaba-feira-teste-integracao-/);

    const { data: feira } = await anon
      .from("feiras")
      .select("name, verified, accuracy")
      .eq("id", newId!)
      .single();
    expect(feira).toEqual({
      name: "Feira Teste Integração",
      verified: false,
      accuracy: "approximate",
    });

    await admin.from("feiras").delete().eq("id", newId!);
  });

  it("sugestão de alteração aplica só os campos enviados; encerrar esconde a feira", async () => {
    const target = "rj-saude-sex-01";
    const { data: before } = await anon.from("feiras").select("*").eq("id", target).single();

    const { data: s } = await bob
      .from("feira_suggestions")
      .insert({
        user_id: ids.bob,
        kind: "alteracao",
        feira_id: target,
        payload: { hours: "06:00–12:00" },
      })
      .select("id")
      .single();
    await moderator.rpc("approve_suggestion", { suggestion_id: s!.id });
    const { data: after } = await anon.from("feiras").select("*").eq("id", target).single();
    expect(after?.hours).toBe("06:00–12:00");
    expect(after?.name).toBe(before?.name);
    expect(after?.days_of_week).toEqual(before?.days_of_week);

    const { data: s2 } = await bob
      .from("feira_suggestions")
      .insert({ user_id: ids.bob, kind: "alteracao", feira_id: target, payload: { active: false } })
      .select("id")
      .single();
    await moderator.rpc("approve_suggestion", { suggestion_id: s2!.id });
    const { data: hidden } = await anon.from("feiras").select("id").eq("id", target);
    expect(hidden).toHaveLength(0);

    // restaura
    await admin.from("feiras").update({ active: true, hours: before!.hours }).eq("id", target);
  });

  it("usuário só vê as próprias sugestões", async () => {
    const { data } = await alice.from("feira_suggestions").select("user_id");
    expect(data?.every((r) => r.user_id === ids.alice)).toBe(true);
  });

  // --------------------------------------------------------------- storage
  it("foto só pode ser enviada para a pasta do próprio usuário", async () => {
    const png = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" });
    const own = await alice.storage
      .from("post-photos")
      .upload(`${ids.alice}/t-${run}.png`, png, { contentType: "image/png" });
    expect(own.error).toBeNull();
    const other = await alice.storage
      .from("post-photos")
      .upload(`${ids.bob}/t-${run}.png`, png, { contentType: "image/png" });
    expect(other.error).not.toBeNull();
    const svg = await alice.storage
      .from("post-photos")
      .upload(`${ids.alice}/x-${run}.svg`, new Blob(["<svg/>"], { type: "image/svg+xml" }), {
        contentType: "image/svg+xml",
      });
    expect(svg.error).not.toBeNull();
    await alice.storage.from("post-photos").remove([`${ids.alice}/t-${run}.png`]);
  });

  // ------------------------------------------------------- exclusão de conta
  it("excluir conta apaga o usuário e os dados dele", async () => {
    const temp = await makeUser("temporario");
    await temp.from("posts").insert({ feira_id: FEIRA, user_id: ids.temporario, text: "tchau" });
    await temp.from("shopping_items").insert({ user_id: ids.temporario, item: "Pão" });

    const { error } = await temp.rpc("delete_my_account");
    expect(error).toBeNull();

    const { data: profile } = await admin.from("profiles").select("id").eq("id", ids.temporario);
    const { data: posts } = await admin.from("posts").select("id").eq("user_id", ids.temporario);
    const { data: items } = await admin
      .from("shopping_items")
      .select("id")
      .eq("user_id", ids.temporario);
    expect(profile).toHaveLength(0);
    expect(posts).toHaveLength(0);
    expect(items).toHaveLength(0);
    delete ids.temporario;
  });

  it("anônimo não consegue chamar exclusão de conta", async () => {
    const { error } = await anon.rpc("delete_my_account");
    expect(error).not.toBeNull();
  });

  // ------------------------------------------------- lista compartilhada
  describe("compartilhamento da lista de compras", () => {
    it("só compartilha com e-mail cadastrado e não consigo compartilhar comigo", async () => {
      const ghost = await alice.rpc("share_shopping_list", { target_email: "ninguem@nada.local" });
      expect(ghost.error?.message).toMatch(/Não encontramos/);
      const self = await alice.rpc("share_shopping_list", {
        target_email: `ALICE-${run}@teste.local`,
      });
      expect(self.error?.message).toMatch(/próprio/);
    });

    it("convidado vê, adiciona e marca itens; terceiros não veem nada", async () => {
      const { data: owned } = await alice
        .from("shopping_items")
        .insert({ user_id: ids.alice, item: "Banana" })
        .select("id")
        .single();

      // Antes de compartilhar, Bob não vê
      const before = await bob.from("shopping_items").select("id").eq("user_id", ids.alice);
      expect(before.data).toHaveLength(0);
      const forbidden = await bob.from("shopping_items").insert({ user_id: ids.alice, item: "x" });
      expect(forbidden.error).not.toBeNull();

      const { data: name, error } = await alice.rpc("share_shopping_list", {
        target_email: ` Bob-${run}@TESTE.local `,
      });
      expect(error).toBeNull();
      expect(name).toBe("bob Teste");

      // Bob vê a lista da Alice, adiciona e marca
      const seen = await bob.from("shopping_items").select("item").eq("user_id", ids.alice);
      expect(seen.data?.map((r) => r.item)).toContain("Banana");
      const added = await bob
        .from("shopping_items")
        .insert({ user_id: ids.alice, item: "Ovos" })
        .select("added_by")
        .single();
      expect(added.data?.added_by).toBe(ids.bob);
      const toggled = await bob
        .from("shopping_items")
        .update({ completed: true })
        .eq("id", owned!.id)
        .select("completed, added_by")
        .single();
      expect(toggled.data).toEqual({ completed: true, added_by: ids.alice });

      // Ninguém se passa por outra pessoa
      const forged = await bob
        .from("shopping_items")
        .insert({ user_id: ids.alice, item: "Falso", added_by: ids.alice })
        .select("added_by")
        .single();
      expect(forged.data?.added_by).toBe(ids.bob);

      // O moderador (terceiro) não vê a lista da Alice
      const third = await moderator.from("shopping_items").select("id").eq("user_id", ids.alice);
      expect(third.data).toHaveLength(0);
      // Nem o compartilhamento
      const thirdShares = await moderator.from("shopping_list_shares").select("*");
      expect(thirdShares.data).toHaveLength(0);
    });

    it("não dá para criar compartilhamento direto na tabela", async () => {
      const { error } = await bob
        .from("shopping_list_shares")
        .insert({ owner_id: ids.alice, member_id: ids.bob, member_email: "x@y.z" });
      expect(error).not.toBeNull();
    });

    it("convidado sai da lista e perde o acesso", async () => {
      const left = await bob
        .from("shopping_list_shares")
        .delete()
        .eq("owner_id", ids.alice)
        .eq("member_id", ids.bob)
        .select();
      expect(left.data).toHaveLength(1);
      const after = await bob.from("shopping_items").select("id").eq("user_id", ids.alice);
      expect(after.data).toHaveLength(0);
      // A lista da Alice continua intacta
      const own = await alice.from("shopping_items").select("item").eq("user_id", ids.alice);
      expect(own.data?.map((r) => r.item)).toEqual(expect.arrayContaining(["Banana", "Ovos"]));
    });
  });
});
