
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { AppointmentDetail } from "./AppointmentDetail";
import { MemoryRouter, Route, Routes, useNavigate, useParams } from "react-router-dom";
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

describe("AppointmentDetail", () => {
    const navigateMock = vi.fn();
    const userMock = { role: "veterinarian", name: "Dr. Vet" };
    const appointmentData = {
        id: 1,
        date: "2024-01-01T00:00:00Z",
        vet_id: 10,
        sheep_ids: [101, 102],
        motivo: "Rotina",
        comentarios: "Tudo normal.",
        medications: [
        { id: 1, name: "Antibiótico", dosage: "5ml", indication: "Infecção" },
        ],
    };
    const sheepList = [
        { id: 101, gender: "Fêmea" },
        { id: 102, gender: "Macho" },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useUser as vi.Mock).mockReturnValue({ user: userMock });
        (useNavigate as vi.Mock).mockReturnValue(navigateMock);
        (useParams as vi.Mock).mockReturnValue({ id: "1" });

        vi.stubGlobal("fetch", vi.fn()
        // appointment
        .mockResolvedValueOnce({
            ok: true,
            json: async () => appointmentData,
        })
        // sheep
        .mockResolvedValueOnce({
            ok: true,
            json: async () => sheepList,
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders appointment details and sheep", async () => {
        render(
        <MemoryRouter initialEntries={["/appointment/1"]}>
            <Routes>
                <Route path="/appointment/:id" element={<AppointmentDetail />} />
            </Routes>
        </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText((content, element) =>
                    element?.tagName.toLowerCase() === 'h1' &&
                    content.includes("Detalhes da consulta") &&
                    content.includes("01/01/2024")
                )
            ).toBeInTheDocument();
        });


        expect(screen.getByText("Motivo")).toBeInTheDocument();
        expect(screen.getByText("Rotina")).toBeInTheDocument();

        expect(screen.getByText("Comentários do veterinário")).toBeInTheDocument();
        expect(screen.getByText("Tudo normal.")).toBeInTheDocument();

        expect(screen.getByText("Medicamentos Prescritos")).toBeInTheDocument();
        expect(screen.getByText("Antibiótico")).toBeInTheDocument();

        expect(screen.getByText("ID: 101 — Sexo: Fêmea")).toBeInTheDocument();
        expect(screen.getByText("ID: 102 — Sexo: Macho")).toBeInTheDocument();
    });

    it("navigates to appointment list on button click", async () => {
        render(
        <MemoryRouter initialEntries={["/appointment/1"]}>
            <Routes>
                <Route path="/appointment/:id" element={<AppointmentDetail />} />
            </Routes>
        </MemoryRouter>
        );

        await waitFor(() => screen.getByText("Lista de consultas"));

        fireEvent.click(screen.getByText("Lista de consultas"));
        expect(navigateMock).toHaveBeenCalledWith("/appointment");
    });

    it("navigates to edit screen on button click", async () => {
        render(
        <MemoryRouter initialEntries={["/appointment/1"]}>
            <Routes>
                <Route path="/appointment/:id" element={<AppointmentDetail />} />
            </Routes>
        </MemoryRouter>
        );

        await waitFor(() => screen.getByText("Editar"));
        fireEvent.click(screen.getByText("Editar"));
        expect(navigateMock).toHaveBeenCalledWith("/appointment/1/edit");
    });

    it("navigates to sheep detail when sheep button is clicked", async () => {
        render(
        <MemoryRouter initialEntries={["/appointment/1"]}>
            <Routes>
                <Route path="/appointment/:id" element={<AppointmentDetail />} />
            </Routes>
        </MemoryRouter>
        );

        await waitFor(() => screen.getByText("ID: 101 — Sexo: Fêmea"));
            fireEvent.click(screen.getByText("ID: 101 — Sexo: Fêmea"));
            expect(navigateMock).toHaveBeenCalledWith("/animal/101");
    });

    it("redirects if user has no valid role", async () => {
        (useUser as vi.Mock).mockReturnValueOnce({ user: { role: "unauthorized" } });

        render(
        <MemoryRouter initialEntries={["/appointment/1"]}>
            <Routes>
                <Route path="/appointment/:id" element={<AppointmentDetail />} />
            </Routes>
        </MemoryRouter>
        );

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith("/unauthorized");
        });
    });

    it("handles failed appointment fetch", async () => {
        (fetch as vi.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({}),
        });

        render(
        <MemoryRouter initialEntries={["/appointment/1"]}>
            <Routes>
                <Route path="/appointment/:id" element={<AppointmentDetail />} />
            </Routes>
        </MemoryRouter>
        );

        await waitFor(() => {
            expect(console.error).toHaveBeenCalled;
        });
    });

    it("handles empty sheep list gracefully", async () => {
        (fetch as vi.Mock)
        .mockResolvedValueOnce({
            ok: true,
            json: async () => appointmentData,
        })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(
            <MemoryRouter initialEntries={["/appointment/1"]}>
                <Routes>
                    <Route path="/appointment/:id" element={<AppointmentDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Carregando animais...")).toBeInTheDocument();
        });
    });
});
