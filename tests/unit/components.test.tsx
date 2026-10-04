import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Filters } from "@/components/Filters";
import { FeiraCard } from "@/components/FeiraCard";
import { ShoppingListModal } from "@/components/ShoppingListModal";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import type { Feira, FeiraFilters } from "@/types/feira";

const feira: Feira = {
  id: "cba-teste-01",
  name: "Feira do Teste",
  city: "Cuiabá",
  neighborhood: "Centro",
  lat: -15.6,
  lng: -56.1,
  daysOfWeek: ["sabado", "quarta"],
  hours: null,
  address: null,
  source: "teste",
  accuracy: "approximate",
  verified: false,
};

describe("<Filters>", () => {
  const filters: FeiraFilters = { city: "", day: "", query: "", todayOnly: false };

  it("mostra o dia de hoje no botão e liga o filtro", async () => {
    const onChange = vi.fn();
    render(
      <Filters
        cities={["Cuiabá"]}
        filters={filters}
        onChange={onChange}
        resultCount={2}
        today="domingo"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Hoje (Domingo)" }));
    expect(onChange).toHaveBeenCalledWith({ ...filters, todayOnly: true, day: "" });
  });

  it("desabilita 'Hoje' enquanto o dia não é conhecido", () => {
    render(
      <Filters cities={[]} filters={filters} onChange={() => {}} resultCount={0} today={null} />,
    );
    expect(screen.getByRole("button", { name: "Hoje" })).toBeDisabled();
  });

  it("singular/plural e limpar filtros", async () => {
    const onChange = vi.fn();
    render(
      <Filters
        cities={[]}
        filters={{ ...filters, query: "x" }}
        onChange={onChange}
        resultCount={1}
        today="sabado"
      />,
    );
    expect(screen.getByText("1 feira encontrada")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(onChange).toHaveBeenCalledWith(filters);
  });
});

describe("<FeiraCard>", () => {
  it("mostra selos de qualidade e horário não confirmado", () => {
    render(
      <FeiraCard feira={feira} selected={false} onSelect={() => {}} onOpenDetails={() => {}} />,
    );
    expect(screen.getByText("Não verificada")).toBeInTheDocument();
    expect(screen.getByText("Local aprox.")).toBeInTheDocument();
    expect(screen.getByText("horário não confirmado")).toBeInTheDocument();
    expect(screen.getByText(/Quarta, Sábado/)).toBeInTheDocument();
  });

  it("aciona seleção e detalhes", async () => {
    const onSelect = vi.fn();
    const onOpenDetails = vi.fn();
    render(<FeiraCard feira={feira} selected onSelect={onSelect} onOpenDetails={onOpenDetails} />);
    await userEvent.click(screen.getByRole("button", { name: "Mostrar Feira do Teste no mapa" }));
    await userEvent.click(screen.getByRole("button", { name: /Mural, preços e detalhes/ }));
    expect(onSelect).toHaveBeenCalledWith(feira);
    expect(onOpenDetails).toHaveBeenCalledWith(feira);
  });

  it("link 'Como chegar' abre o Google Maps em nova aba com segurança", () => {
    render(
      <FeiraCard feira={feira} selected={false} onSelect={() => {}} onOpenDetails={() => {}} />,
    );
    const link = screen.getByRole("link", { name: /Como chegar/ });
    expect(link).toHaveAttribute("href", expect.stringContaining("-15.6,-56.1"));
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("<ShoppingListModal> sem login", () => {
  it("adiciona item, calcula total e persiste no aparelho", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <ShoppingListModal isOpen onClose={() => {}} />
      </AuthProvider>,
    );
    expect(await screen.findByText(/Sua lista está vazia/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Item"), "Tomate");
    await user.type(screen.getByLabelText("Preço estimado (opcional)"), "8,50");
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    const list = await screen.findByRole("list");
    expect(within(list).getByText("Tomate")).toBeInTheDocument();
    expect(screen.getAllByText(/R\$\s8,50/).length).toBeGreaterThan(0);
    expect(localStorage.getItem("onde_tem_feira_lista_v2")).toContain("Tomate");

    await user.click(screen.getByRole("checkbox"));
    expect(screen.getByText(/R\$\s0,00/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Limpar comprados/ }));
    expect(await screen.findByText(/Sua lista está vazia/)).toBeInTheDocument();
  });

  it("rejeita item vazio com mensagem", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <ShoppingListModal isOpen onClose={() => {}} />
      </AuthProvider>,
    );
    await user.click(await screen.findByRole("button", { name: "Adicionar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Informe o item");
  });
});
