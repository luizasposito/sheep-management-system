import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { AnimalCreate } from "./AnimalCreate";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
  };
});

describe("AnimalCreate page", () => {
  const navigateMock = vi.fn();

  const mockUser = { farm_id: 1 };
  const mockAnimals = [
    { id: 101, gender: "Macho", farm_id: 1 },
    { id: 102, gender: "Fêmea", farm_id: 1 },
    { id: 103, gender: "Fêmea", farm_id: 2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as vi.Mock).mockReturnValue(navigateMock);
    (useUser as unknown as vi.Mock).mockReturnValue({ user: mockUser });

    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "mock-token"),
    });

    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setupSuccessMocks = () => {
    (fetch as vi.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockUser }) // fetch user
      .mockResolvedValueOnce({ ok: true, json: async () => mockAnimals }) // fetch animals
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // submit animal
  };

  it("sets document title on mount", () => {
    render(<AnimalCreate />, { wrapper: MemoryRouter });
    expect(document.title).toBe("Adicionar Animal");
  });

  it("navigates back on cancel", async () => {
    setupSuccessMocks();
    render(<AnimalCreate />, { wrapper: MemoryRouter });

    await screen.findByText("Adicionar Animal");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("shows error if token is missing", async () => {
    (useUser as unknown as vi.Mock).mockReturnValue({ user: { farm_id: 1 } });
    (localStorage.getItem as vi.Mock).mockReturnValue(null);

    render(<AnimalCreate />, { wrapper: MemoryRouter });

    await screen.findByText("Adicionar Animal");

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => {
      expect(screen.getByText("Usuário não autenticado.")).toBeInTheDocument();
    });
  });
});
