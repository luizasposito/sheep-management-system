
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Inventory } from "./Inventory";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";

// Mock do useUser do UserContext
vi.mock("../../UserContext", () => ({
    useUser: vi.fn(),
}));

// Mock do react-router-dom
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: () => ({ state: undefined }),
    };
});

describe("Inventory Component", () => {
    const navigateMock = vi.fn();

    const mockInventoryData = [
        {
            id: 1,
            item_name: "Farinha",
            quantity: 10,
            unit: "kg",
            consumption_rate: 1,
            last_updated: "2025-05-01T00:00:00.000Z",
            category: "Ingrediente",
        },
        {
            id: 2,
            item_name: "Açúcar",
            quantity: 5,
            unit: "kg",
            consumption_rate: 2,
            last_updated: "2025-05-05T00:00:00.000Z",
            category: "Ingrediente",
        },
        {
            id: 3,
            item_name: "Detergente",
            quantity: 2,
            unit: "un",
            consumption_rate: 0.5,
            last_updated: "2025-04-30T00:00:00.000Z",
            category: "Limpeza",
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as unknown as vi.Mock).mockReturnValue(navigateMock);
        (useUser as unknown as vi.Mock).mockReturnValue({
            user: { id: 1, name: "Usuário Teste" }, // ou um objeto user que faça sentido para seus testes
            setUser: vi.fn(),
        });
        localStorage.setItem("token", "fake-token");

        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockInventoryData,
            }),
        );
        });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    function renderInventory() {
        return render(
        <MemoryRouter>
            <Inventory />
        </MemoryRouter>
        );
    }

    it("renderiza título, botões e loading inicialmente", () => {
        renderInventory();

        expect(document.title).toBe("Inventário");
        expect(screen.getByRole("heading", { name: /inventário/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /adicionar item/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /ajuste/i })).toBeInTheDocument();
        expect(screen.getByText(/carregando inventário/i)).toBeInTheDocument();
    });

    it("exibe tabela com dados após carregamento", async () => {
        renderInventory();

        await waitFor(() => {
            expect(screen.queryByRole("heading", { name: /farinha/i })).not.toBeInTheDocument();
        });


        expect(screen.getAllByText("Categoria").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Nome").length).toBeGreaterThan(0);


        expect(screen.getByText("Farinha")).toBeInTheDocument();
        expect(screen.getByText("Açúcar")).toBeInTheDocument();
        expect(screen.getByText("Detergente")).toBeInTheDocument();
    });

    it("filtra itens por busca", async () => {
        renderInventory();

        await waitFor(() =>
        expect(screen.queryByText(/carregando inventário/i)).not.toBeInTheDocument()
        );

        const inputSearch = screen.getByPlaceholderText(/pesquisar por nome/i);
        fireEvent.change(inputSearch, { target: { value: "far" } });

        expect(screen.getByText("Farinha")).toBeInTheDocument();
        expect(screen.queryByText("Açúcar")).not.toBeInTheDocument();
        expect(screen.queryByText("Detergente")).not.toBeInTheDocument();
    });

    it("filtra itens por categoria", async () => {
        renderInventory();

        await waitFor(() =>
        expect(screen.queryByText(/carregando inventário/i)).not.toBeInTheDocument()
        );

        const checkbox = screen.getByLabelText("Limpeza");
        fireEvent.click(checkbox);

        expect(screen.getByText("Detergente")).toBeInTheDocument();
        expect(screen.queryByText("Farinha")).not.toBeInTheDocument();
        expect(screen.queryByText("Açúcar")).not.toBeInTheDocument();
    });

    it("ativa modo ajuste e mostra botões editar e apagar", async () => {
        renderInventory();

        await waitFor(() =>
        expect(screen.queryByText(/carregando inventário/i)).not.toBeInTheDocument()
        );

        const ajusteBtn = screen.getByRole("button", { name: /ajuste/i });
        fireEvent.click(ajusteBtn);

        expect(ajusteBtn).toHaveTextContent(/sair do ajuste/i);

        expect(screen.getAllByRole("button", { name: /editar/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole("button", { name: /apagar/i }).length).toBeGreaterThan(0);
    });

    it("abre modal de confirmação para apagar, cancela e confirma", async () => {
        renderInventory();

        await waitFor(() =>
        expect(screen.queryByText(/carregando inventário/i)).not.toBeInTheDocument()
        );

        fireEvent.click(screen.getByRole("button", { name: /ajuste/i }));

        const deleteButtons = screen.getAllByRole("button", { name: /apagar/i });
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByText(/tem certeza que deseja apagar o item/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
        expect(screen.queryByText(/tem certeza que deseja apagar o item/i)).not.toBeInTheDocument();

        fireEvent.click(deleteButtons[0]);

        (fetch as unknown as vi.Mock).mockResolvedValueOnce({ ok: true });

        fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

        await waitFor(() => {
        expect(screen.queryByText("Farinha")).not.toBeInTheDocument();
        });
    });

    it("navega para /inventory/add ao clicar em adicionar item", async () => {
        renderInventory();

        await waitFor(() =>
        expect(screen.queryByText(/carregando inventário/i)).not.toBeInTheDocument()
        );

        const addButton = screen.getByRole("button", { name: /adicionar item/i });
        fireEvent.click(addButton);

        expect(navigateMock).toHaveBeenCalledWith("/inventory/add");
    });

    it("exibe erro no console se falhar ao buscar inventário", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        (fetch as unknown as vi.Mock).mockResolvedValueOnce({
            ok: false,
        });

        renderInventory();

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it("define estado corretamente ao clicar em editar", async () => {
        renderInventory();

        await waitFor(() =>
            expect(screen.queryByText(/carregando inventário/i)).not.toBeInTheDocument()
        );

        fireEvent.click(screen.getByRole("button", { name: /ajuste/i }));

        const editButtons = screen.getAllByRole("button", { name: /editar/i });
        fireEvent.click(editButtons[0]);

        expect(screen.getByRole("heading", { name: /farinha/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/quantidade em estoque/i)).toHaveValue(10);
    });

    it("atualiza item com sucesso ao salvar", async () => {
        renderInventory();

        await waitFor(() => screen.getByRole("button", { name: /ajuste/i }));
        fireEvent.click(screen.getByRole("button", { name: /ajuste/i }));

        const editButtons = screen.getAllByRole("button", { name: /editar/i });
        fireEvent.click(editButtons[0]);

        const input = screen.getByLabelText(/quantidade em estoque/i);
        fireEvent.change(input, { target: { value: "25" } });

        (fetch as unknown as vi.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ...mockInventoryData[0], quantity: 25 }),
        });

        fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

        await waitFor(() => {
            expect(screen.queryByRole("heading", { name: /farinha/i })).not.toBeInTheDocument();
        });

        expect(screen.getByText("25")).toBeInTheDocument();
    });

    it("exibe erro no console ao falhar salvar", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        renderInventory();

        await waitFor(() => screen.getByRole("button", { name: /ajuste/i }));
        fireEvent.click(screen.getByRole("button", { name: /ajuste/i }));

        const editButtons = screen.getAllByRole("button", { name: /editar/i });
        fireEvent.click(editButtons[0]);

        const input = screen.getByLabelText(/quantidade em estoque/i);
        fireEvent.change(input, { target: { value: "30" } });

        (fetch as unknown as vi.Mock).mockResolvedValueOnce({
            ok: false,
        });

        fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it("cancela edição corretamente", async () => {
        renderInventory();

        await waitFor(() => screen.getByRole("button", { name: /ajuste/i }));
        fireEvent.click(screen.getByRole("button", { name: /ajuste/i }));

        const editButtons = screen.getAllByRole("button", { name: /editar/i });
        fireEvent.click(editButtons[0]);

        fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

        await waitFor(() => {
            expect(screen.queryByRole("heading", { name: /farinha/i })).not.toBeInTheDocument();
        });
    });

    it("oculta botão 'Ajuste' no modo mobile e mostra botões nos cards", async () => {
    // Mock useIsMobile para simular mobile
    vi.mock("../../useIsMobile", () => ({
        useIsMobile: () => true,
    }));

    renderInventory();

    await waitFor(() =>
        expect(screen.queryByText(/carregando inventário/i)).not.toBeInTheDocument()
    );

    // Verifica que botão "Ajuste" não aparece no modo mobile
    expect(screen.queryByRole("button", { name: /ajuste/i })).not.toBeInTheDocument();

    // Verifica que o título dos cards está visível
    expect(screen.getByRole("heading", { name: /farinha/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /açúcar/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /detergente/i })).toBeInTheDocument();

    // Verifica que os botões editar e apagar estão presentes sem ativar o modo ajuste
    const editarButtons = screen.getAllByRole("button", { name: /editar/i });
    const apagarButtons = screen.getAllByRole("button", { name: /apagar/i });
    expect(editarButtons.length).toBe(3);
    expect(apagarButtons.length).toBe(3);
    });

});
