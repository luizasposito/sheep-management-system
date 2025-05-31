import "@testing-library/jest-dom";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Menu } from "./Menu";
import { useUser } from "../../UserContext";

// Mock do useUser para controlar o usuário e setUser
vi.mock("../../UserContext", () => ({
    useUser: vi.fn(),
}));

// Mock do useNavigate do react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock fetch para logout
globalThis.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    })
) as any;

describe("Menu component", () => {
    const mockSetUser = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock do usuário farmer
        (useUser as vi.Mock).mockReturnValue({
        user: { role: "farmer", name: "João" },
        setUser: mockSetUser,
        });
        // Limpar token
        localStorage.clear();
    });

    it("renders menu items according to user role", () => {
        render(
        <MemoryRouter>
            <Menu />
        </MemoryRouter>
        );

        // Como existem múltiplos botões com o mesmo nome, pegar o primeiro
        const inicioBtns = screen.getAllByRole("button", { name: /Início/i });
        expect(inicioBtns[0]).not.toBeNull();

        const inventarioBtns = screen.getAllByRole("button", { name: /Inventário/i });
        expect(inventarioBtns[0]).not.toBeNull();

        const animaisBtns = screen.getAllByRole("button", { name: /Animais/i });
        expect(animaisBtns[0]).not.toBeNull();

        const consultasBtns = screen.getAllByRole("button", { name: /Consultas/i });
        expect(consultasBtns[0]).not.toBeNull();

        const sairBtns = screen.getAllByRole("button", { name: /Sair/i });
        expect(sairBtns[0]).not.toBeNull();
    });

    it("toggles submenu when menu buttons are clicked", async () => {
        render(
        <MemoryRouter>
            <Menu />
        </MemoryRouter>
        );

        const inventarioBtns = screen.getAllByRole("button", { name: /Inventário/i });
        fireEvent.click(inventarioBtns[0]);

        // Deve aparecer submenu
        const submenu = screen.getByLabelText("Submenu Inventário");
        expect(submenu).not.toBeNull();

        // Os itens do submenu Inventário devem estar presentes
        const verItens = screen.getByText("Ver itens");
        expect(verItens).not.toBeNull();

        // Fecha o submenu clicando novamente
        fireEvent.click(inventarioBtns[0]);
        // Espera submenu desaparecer
        await waitFor(() => {
        expect(screen.queryByLabelText("Submenu Inventário")).toBeNull();
        });
    });

    it("shows logout confirmation card when Sair button is clicked and handles cancel", async () => {
        render(
        <MemoryRouter>
            <Menu />
        </MemoryRouter>
        );

        const sairBtns = screen.getAllByRole("button", { name: /Sair/i });
        fireEvent.click(sairBtns[0]);

        // Confirmação deve aparecer (testar texto)
        const confirmationText = screen.getByText(/Tem certeza que deseja sair da conta/i);
        expect(confirmationText).not.toBeNull();

        // Botão Cancelar na confirmação
        const cancelarBtn = screen.getByRole("button", { name: /Cancelar/i });
        fireEvent.click(cancelarBtn);

        // Confirmação some depois de cancelar
        await waitFor(() => {
        expect(screen.queryByText(/Tem certeza que deseja sair da conta/i)).toBeNull();
        });
    });

    it("calls confirmLogout and clears token, calls setUser and navigates", async () => {
        localStorage.setItem("token", "token123");

        render(
        <MemoryRouter>
            <Menu />
        </MemoryRouter>
        );

        // Abre confirmação logout
        const sairBtns = screen.getAllByRole("button", { name: /Sair/i });
        fireEvent.click(sairBtns[0]);

        // Clica em confirmar
        const confirmarBtn = screen.getByRole("button", { name: /Confirmar/i });
        fireEvent.click(confirmarBtn);

        // Espera efeito assíncrono
        await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("/auth/logout", expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
            Authorization: "Bearer token123",
            }),
        }));

        expect(localStorage.getItem("token")).toBeNull();
        expect(mockSetUser).toHaveBeenCalledWith(null);
        expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });

    it("closes open menu when clicking outside", async () => {
        render(
        <MemoryRouter>
            <Menu />
        </MemoryRouter>
        );

        // Abre submenu "Inventário"
        const inventarioBtns = screen.getAllByRole("button", { name: /Inventário/i });
        fireEvent.click(inventarioBtns[0]);

        // Verifica que submenu está aberto
        expect(screen.getByLabelText("Submenu Inventário")).not.toBeNull();

        // Clica fora do menu (document.body)
        fireEvent.mouseDown(document.body);

        // Espera submenu fechar (usar waitFor para esperar re-render)
        await waitFor(() => {
        expect(screen.queryByLabelText("Submenu Inventário")).toBeNull();
        });
    });

    it("logs error to console if fetch fails during logout", async () => {
        // Add token so fetch is called
        localStorage.setItem("token", "token123");

        // Mock fetch to rejeitar
        (globalThis.fetch as vi.Mock).mockRejectedValueOnce(new Error("fail"));

        // Spy on console.error
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        render(
        <MemoryRouter>
            <Menu />
        </MemoryRouter>
        );

        // Open logout confirmation
        const sairBtns = screen.getAllByRole("button", { name: /Sair/i });
        fireEvent.click(sairBtns[0]);

        // Clica em confirmar
        const confirmarBtn = screen.getByRole("button", { name: /Confirmar/i });
        fireEvent.click(confirmarBtn);

        // Espera erro
        await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });
});
