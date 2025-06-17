
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { AppointmentEdit } from "./AppointmentEdit";
import { useUser } from "../../UserContext";

vi.mock("../../UserContext", () => ({
    useUser: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: vi.fn(),
        useParams: vi.fn(),
    };
});

describe("AppointmentEdit", () => {
    const navigateMock = vi.fn();
    const mockToken = "fake-token";
    const mockAppointment = {
        motivo: "Vacina",
        comentarios: "Tudo certo",
        medications: [
        { name: "Med1", dosage: "10ml", indication: "Febre" },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem("token", mockToken);
        (useNavigate as unknown as vi.Mock).mockReturnValue(navigateMock);
        (useParams as unknown as vi.Mock).mockReturnValue({ id: "123" });
        (useUser as unknown as vi.Mock).mockReturnValue({ user: { role: "veterinarian" } });
        vi.stubGlobal("fetch", vi.fn()
        .mockResolvedValueOnce({
            ok: true,
            json: async () => mockAppointment,
        })
        .mockResolvedValueOnce({ ok: true }) // PATCH success
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it("renders appointment form with fetched data", async () => {
        render(<AppointmentEdit />, { wrapper: MemoryRouter });

        await waitFor(() => {
        expect(screen.getByDisplayValue("Vacina")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Tudo certo")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Med1")).toBeInTheDocument();
        expect(screen.getByDisplayValue("10ml")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Febre")).toBeInTheDocument();
        });
    });

    it("adds and removes a medication field", async () => {
        render(<AppointmentEdit />, { wrapper: MemoryRouter });
        await waitFor(() => screen.getByDisplayValue("Med1"));

        fireEvent.click(screen.getByRole("button", { name: "Adicionar medicamento" }));
        expect(screen.getAllByPlaceholderText("Nome").length).toBe(2);

        fireEvent.click(screen.getAllByRole("button", { name: "Remover" })[1]);
        expect(screen.getAllByPlaceholderText("Nome").length).toBe(1);
    });

    it("submits updated form and navigates to details page", async () => {
        render(<AppointmentEdit />, { wrapper: MemoryRouter });
        await waitFor(() => screen.getByDisplayValue("Vacina"));

        fireEvent.change(screen.getByDisplayValue("Vacina"), {
        target: { value: "Nova Vacina" },
        });

        const saveButton = screen.getByRole("button", { name: "Salvar" });
        expect(saveButton).toBeEnabled();

        fireEvent.click(saveButton);
    
        await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith("/appointment/123");
        });
    });

    it("disables save button when there are no changes", async () => {
        render(<AppointmentEdit />, { wrapper: MemoryRouter });
        await waitFor(() => screen.getByDisplayValue("Vacina"));
        const saveButton = screen.getByRole("button", { name: "Salvar" });
        expect(saveButton).toBeDisabled();
    });

    it("redirects if user is not veterinarian", async () => {
        (useUser as unknown as vi.Mock).mockReturnValue({ user: { role: "farmer" } });
        render(<AppointmentEdit />, { wrapper: MemoryRouter });

        await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith("/unauthorized");
        });
    });

    it("updates medication field correctly when handleMedicationChange is called", async () => {
        render(<AppointmentEdit />, { wrapper: MemoryRouter });

        // Espera o input de medicamento existir e estar preenchido com 'Med1'
        await waitFor(() => {
            const nomeInput = screen.getByPlaceholderText("Nome") as HTMLInputElement;
            expect(nomeInput.value).toBe("Med1");
        });

        const nomeInput = screen.getByPlaceholderText("Nome") as HTMLInputElement;

        // Simula alteração no campo nome do medicamento
        fireEvent.change(nomeInput, { target: { value: "Paracetamol" } });

        // Verifica se o valor foi atualizado no input
        expect(nomeInput.value).toBe("Paracetamol");
    });
});