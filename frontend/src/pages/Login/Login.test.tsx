import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { Login } from "./Login";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";

vi.mock("../../UserContext", () => ({
    useUser: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: () => ({ state: undefined }),
    };
});

describe("Login page", () => {
    const setUserMock = vi.fn();
    const navigateMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useUser as unknown as vi.Mock).mockReturnValue({ setUser: setUserMock });
        (useNavigate as unknown as vi.Mock).mockReturnValue(navigateMock);
        vi.spyOn(window, "alert").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders email and password inputs", () => {
        render(<Login />, { wrapper: MemoryRouter });
        expect(screen.getByLabelText("Email")).not.toBeNull();
        expect(screen.getByLabelText("Senha")).not.toBeNull();
    });

    it("toggles password visibility", async () => {
        render(<Login />, { wrapper: MemoryRouter });
        const toggleButton = screen.getByRole("button", { name: "Mostrar senha" });

        expect(toggleButton).not.toBeNull();

        fireEvent.click(toggleButton);
        expect(screen.getByRole("button", { name: "Esconder senha" })).not.toBeNull();
    });

    it("logs in and redirects based on farmer role", async () => {
        const mockToken = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })) + "." +
        btoa(JSON.stringify({ role: "farmer" })) + ".signature";

        vi.stubGlobal("fetch", vi.fn()
        // login
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: mockToken }),
        })
        // /me
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 1, name: "User", role: "farmer", email: "", farm_id: 1 }),
        })
        );

        render(<Login />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
        fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "123456" } });

        fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

        await waitFor(() => {
        expect(setUserMock).toHaveBeenCalled();
        expect(navigateMock).toHaveBeenCalledWith("/dashboard");
        });
    });

    it("shows alert if login fails", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: "Credenciais inválidas" }),
        }));

        render(<Login />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
        fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "123" } });

        fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

        await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Credenciais inválidas");
        });
    });

    it("redirects to veterinarian route if role is veterinarian", async () => {
        const mockToken = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })) + "." +
        btoa(JSON.stringify({ role: "veterinarian" })) + ".signature";

        vi.stubGlobal("fetch", vi.fn()
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: mockToken }),
        })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 2, name: "Vet", role: "veterinarian", email: "", farm_id: 2 }),
        })
        );

        render(<Login />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "vet@a.com" } });
        fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "abc" } });

        fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

        await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith("/appointment");
        });
    });

    it("alerts if unknown role", async () => {
        const mockToken = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })) + "." +
        btoa(JSON.stringify({ role: "unknown" })) + ".signature";

        vi.stubGlobal("fetch", vi.fn()
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: mockToken }),
        })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 3, name: "User", role: "unknown", email: "", farm_id: 3 }),
        })
        );

        render(<Login />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "unk@a.com" } });
        fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "xyz" } });

        fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

        await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Tipo de usuário desconhecido");
        });
    });

    it("shows alert if token is invalid during user data fetch", async () => {
        const mockToken = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })) + "." +
            btoa(JSON.stringify({ role: "farmer" })) + ".sig";

        vi.stubGlobal("fetch", vi.fn()
            // login OK
            .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: mockToken }),
            })
            // /me FAIL
            .mockResolvedValueOnce({
            ok: false,
            json: async () => ({}),
            })
        );

        render(<Login />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
        fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "123" } });
        fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Token inválido para acessar dados do usuário");
        });
    });

    it("shows alert on backend communication error", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

        render(<Login />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "fail@a.com" } });
        fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "fail" } });
        fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
            "Erro na comunicação com o servidor. Verifique se o backend está rodando."
            );
        });
    });

});
