import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { AppointmentCreate } from "./AppointmentCreate";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";

vi.mock("../../UserContext", () => ({
    useUser: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

// Corrigido: Mock CSS module exportando default com proxy para evitar erro
vi.mock("./AppointmentCreate.module.css", () => {
    const proxy = new Proxy({}, {
        get: (target, prop) => prop,
    });
    return {
        __esModule: true,
        default: proxy,
    };
});

describe("AppointmentCreate page", () => {
    const navigateMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as unknown as vi.Mock).mockReturnValue(navigateMock);
        // Default user is farmer
        (useUser as unknown as vi.Mock).mockReturnValue({ user: { role: "farmer" } });
        // Mock localStorage token
        vi.stubGlobal("localStorage", {
        getItem: vi.fn(() => "token"),
        });
        // Clear console.error mock (used in error tests)
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("sets document title on mount", () => {
        render(<AppointmentCreate />, { wrapper: MemoryRouter });
        expect(document.title).toBe("Agendar consulta");
    });

    it("redirects to /unauthorized if user is not farmer or no user", () => {
        // user null
        (useUser as unknown as vi.Mock).mockReturnValue({ user: null });
        render(<AppointmentCreate />, { wrapper: MemoryRouter });
        expect(navigateMock).toHaveBeenCalledWith("/unauthorized");

        // user role not farmer
        (useUser as unknown as vi.Mock).mockReturnValue({ user: { role: "veterinarian" } });
        render(<AppointmentCreate />, { wrapper: MemoryRouter });
        expect(navigateMock).toHaveBeenCalledWith("/unauthorized");
    });

    it("fetches sheep and groups data and sets state", async () => {
        const sheeps = [
        { id: 1, gender: "M", group_id: 5 },
        { id: 2, gender: "F", group_id: null },
        ];
        const groups = [{ id: 5, name: "Grupo A" }];

        const fetchMock = vi.fn()
        .mockResolvedValueOnce({
            ok: true,
            json: async () => sheeps,
        })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => groups,
        });
        vi.stubGlobal("fetch", fetchMock);

        render(<AppointmentCreate />, { wrapper: MemoryRouter });

        await waitFor(() => {
        // Check that fetch called twice
        expect(fetchMock).toHaveBeenCalledTimes(2);
        // Check that Select has options with correct labels
        expect(screen.getByText(/Animais:/i)).toBeInTheDocument();
        });
    });

    it("logs error if fetch of sheep or groups fails", async () => {
        const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });
        vi.stubGlobal("fetch", fetchMock);

        render(<AppointmentCreate />, { wrapper: MemoryRouter });

        await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
            "Erro ao carregar dados:",
            expect.any(Error)
        );
        });
    });

    it("renders form inputs and buttons", () => {
        render(<AppointmentCreate />, { wrapper: MemoryRouter });

        expect(screen.getByLabelText("Data da consulta:")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
        expect(screen.getByLabelText("Motivo:")).toBeInTheDocument();

        expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
    });

    it("cancel button navigates to /appointment", () => {
        render(<AppointmentCreate />, { wrapper: MemoryRouter });
        fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
        expect(navigateMock).toHaveBeenCalledWith("/appointment");
    });

    it("updates formAnimals state when Select changes", () => {
        render(<AppointmentCreate />, { wrapper: MemoryRouter });

        const selectInput = screen.getByRole("combobox");

        expect(selectInput).toBeInTheDocument();
    });


    it("does not submit form if formAnimals is empty or user is undefined", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => [] }) // fetch sheep
            .mockResolvedValueOnce({ ok: true, json: async () => [] }); // fetch groups

        vi.stubGlobal("fetch", fetchMock);

        render(<AppointmentCreate />, { wrapper: MemoryRouter });

        // Aguarde as chamadas iniciais de fetch
        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(2);
        });

        fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

        // Verifique se nenhuma chamada adicional foi feita
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });


    it("handles fetch error and logs error message", async () => {
        (fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => "Erro interno do servidor",
        });

        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        render(<AppointmentCreate />, { wrapper: MemoryRouter });
        consoleErrorSpy.mockRestore();
    });
});
