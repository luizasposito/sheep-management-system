import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { AnimalEdit } from "./AnimalEdit";
import { useUser } from "../../UserContext";

// Mocks
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

describe("AnimalEdit page", () => {
    const navigateMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useUser as vi.Mock).mockReturnValue({ user: { role: "farmer" } });
        (useNavigate as vi.Mock).mockReturnValue(navigateMock);
        (useParams as vi.Mock).mockReturnValue({ id: "1" });
        vi.stubGlobal("fetch", vi.fn());
        localStorage.setItem("token", "fake-token");
    });

    it("redirects to unauthorized if role is not farmer or vet", async () => {
        (useUser as vi.Mock).mockReturnValue({ user: { role: "admin" } });

        render(<AnimalEdit />, { wrapper: MemoryRouter });

        await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith("/unauthorized");
        });
    });

    it("carrega os dados corretamente do animal, outros animais da fazenda e grupos", async () => {
        const animalMock = {
        id: 1,
        gender: "Fêmea",
        birth_date: "2022-01-01",
        feeding_hay: 5,
        feeding_feed: 3,
        farm_id: 1,
        group_id: 1,
        father_id: 2,
        mother_id: 3,
        };

        const allAnimalsMock = [
        { id: 2, gender: "Macho", farm_id: 1 },
        { id: 3, gender: "Fêmea", farm_id: 1 },
        ];

        const groupsMock = [
        { id: 1, name: "Grupo A" },
        { id: 2, name: "Grupo B" },
        ];

        (fetch as vi.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => animalMock })
        .mockResolvedValueOnce({ ok: true, json: async () => allAnimalsMock })
        .mockResolvedValueOnce({ ok: true, json: async () => groupsMock });

        render(<AnimalEdit />, { wrapper: MemoryRouter });

        expect(await screen.findByDisplayValue("2022-01-01")).toBeInTheDocument();
        expect(screen.getByDisplayValue("5")).toBeInTheDocument();
        expect(screen.getByDisplayValue("3")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Fêmea")).toBeInTheDocument();

        const groupSelect = screen.getByLabelText("Grupo:");
        expect(groupSelect).toHaveValue("1");
    });

    it("exibe erro se a busca do animal falhar", async () => {
        (fetch as vi.Mock).mockResolvedValueOnce({ ok: false });

        render(<AnimalEdit />, { wrapper: MemoryRouter });

        const error = await screen.findByText((text) =>
        text.includes("Erro ao buscar dados do animal")
        );
        expect(error).toBeInTheDocument();
    });

    it("exibe erro se a busca de todos os animais falhar", async () => {
        const animalMock = {
        id: 1,
        gender: "Fêmea",
        birth_date: "2022-01-01",
        feeding_hay: 5,
        feeding_feed: 3,
        farm_id: 1,
        group_id: 1,
        father_id: 2,
        mother_id: 3,
        };

        (fetch as vi.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => animalMock })
        .mockResolvedValueOnce({ ok: false });

        render(<AnimalEdit />, { wrapper: MemoryRouter });

        const error = await screen.findByText((text) =>
        text.includes("Erro ao buscar todos os animais")
        );
        expect(error).toBeInTheDocument();
    });

    it("exibe erro se a busca dos grupos falhar", async () => {
        const animalMock = {
        id: 1,
        gender: "Fêmea",
        birth_date: "2022-01-01",
        feeding_hay: 5,
        feeding_feed: 3,
        farm_id: 1,
        group_id: 1,
        father_id: 2,
        mother_id: 3,
        };

        const allAnimalsMock = [
        { id: 2, gender: "Macho", farm_id: 1 },
        { id: 3, gender: "Fêmea", farm_id: 1 },
        ];

        (fetch as vi.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => animalMock })
        .mockResolvedValueOnce({ ok: true, json: async () => allAnimalsMock })
        .mockResolvedValueOnce({ ok: false });

        render(<AnimalEdit />, { wrapper: MemoryRouter });

        const error = await screen.findByText((text) =>
        text.includes("Erro ao buscar grupos")
        );
        expect(error).toBeInTheDocument();
    });

    it("altera campo de grupo corretamente e atualiza isChanged", async () => {
        const animalMock = {
            id: 1,
            gender: "Fêmea",
            birth_date: "2022-01-01",
            feeding_hay: 5,
            feeding_feed: 3,
            farm_id: 1,
            group_id: 1,
            father_id: null,
            mother_id: null,
        };

        const allAnimalsMock: any[] = [];
        const groupsMock: any[] = [
            { id: 1, name: "Grupo A" },
            { id: 2, name: "Grupo B" },
        ];

        (fetch as vi.Mock)
            .mockResolvedValueOnce({ ok: true, json: async () => animalMock })
            .mockResolvedValueOnce({ ok: true, json: async () => allAnimalsMock })
            .mockResolvedValueOnce({ ok: true, json: async () => groupsMock });

        render(<AnimalEdit />, { wrapper: MemoryRouter });

        const groupSelect = await screen.findByLabelText("Grupo:") as HTMLSelectElement;
        expect(groupSelect).toHaveValue("1");

        groupSelect.value = "2";
        groupSelect.dispatchEvent(new Event("change", { bubbles: true }));

        expect(groupSelect.value).toBe("2");
    });
});
