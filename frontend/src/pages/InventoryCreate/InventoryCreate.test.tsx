import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { InventoryCreate } from "./InventoryCreate";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { UserProvider } from "../../UserContext";

const customRender = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <UserProvider>
        {ui}
      </UserProvider>
    </MemoryRouter>
  );
};


vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe("InventoryCreate", () => {
    const navigateMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as unknown as vi.Mock).mockReturnValue(navigateMock);
        localStorage.setItem("token", "fake-token");

        // Mock genérico do fetch para evitar erro no UserContext
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ name: "Usuário Falso" }),
        }));
    });


    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renderiza todos os campos corretamente", () => {
        customRender(<InventoryCreate />);

        expect(screen.getByLabelText("Nome do item:")).toBeInTheDocument();
        expect(screen.getByLabelText("Tipo:")).toBeInTheDocument();
        expect(screen.getByLabelText("Quantidade:")).toBeInTheDocument();
        expect(screen.getByLabelText("Unidade de medida:")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
    });

    it("exibe erro ao tentar submeter sem preencher todos os campos", async () => {
        customRender(<InventoryCreate />);

        fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

        const error = await screen.findByText(/preencha todos os campos/i);
        expect(error).toBeInTheDocument();
    });

    it("submete corretamente e redireciona para /inventory", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

        customRender(<InventoryCreate />);

        fireEvent.change(screen.getByLabelText("Nome do item:"), { target: { value: "Farinha" } });
        fireEvent.change(screen.getByLabelText("Tipo:"), { target: { value: "Ingrediente" } });
        fireEvent.change(screen.getByLabelText("Quantidade:"), { target: { value: "10" } });
        fireEvent.change(screen.getByLabelText("Unidade de medida:"), { target: { value: "kg" } });

        fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

        await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
        expect(navigateMock).toHaveBeenCalledWith("/inventory");
        });
    });

    it("exibe mensagem de erro se a API falhar", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: "Erro ao criar item" }),
        }));

        customRender(<InventoryCreate />);

        fireEvent.change(screen.getByLabelText("Nome do item:"), { target: { value: "Farinha" } });
        fireEvent.change(screen.getByLabelText("Tipo:"), { target: { value: "Ingrediente" } });
        fireEvent.change(screen.getByLabelText("Quantidade:"), { target: { value: "10" } });
        fireEvent.change(screen.getByLabelText("Unidade de medida:"), { target: { value: "kg" } });

        fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

        const error = await screen.findByText("Erro ao criar item");
        expect(error).toBeInTheDocument();
    });

    it("desabilita inputs e botão durante o carregamento", async () => {
        let resolveFetch: (value: any) => void;
        vi.stubGlobal("fetch", vi.fn().mockImplementation(() =>
        new Promise((resolve) => {
            resolveFetch = resolve;
        })
        ));

        customRender(<InventoryCreate />);

        fireEvent.change(screen.getByLabelText("Nome do item:"), { target: { value: "Farinha" } });
        fireEvent.change(screen.getByLabelText("Tipo:"), { target: { value: "Ingrediente" } });
        fireEvent.change(screen.getByLabelText("Quantidade:"), { target: { value: "10" } });
        fireEvent.change(screen.getByLabelText("Unidade de medida:"), { target: { value: "kg" } });

        fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

        expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
        expect(screen.getByLabelText("Nome do item:")).toBeDisabled();

        resolveFetch!({ ok: true });
    });

    it("redireciona ao clicar em cancelar", () => {
        customRender(<InventoryCreate />);

        fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
        expect(navigateMock).toHaveBeenCalledWith("/inventory");
    });
});
