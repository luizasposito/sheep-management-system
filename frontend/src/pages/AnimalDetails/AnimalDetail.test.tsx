import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AnimalDetails } from "./AnimalDetail";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../../UserContext";
import type { User } from "../../UserContext";

// Mock do react-router
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn(),
  };
});

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const mockUser: User = {
    id: 1,
    name: "Usuário Teste",
    email: "teste@exemplo.com",
    farmId: 1,
    role: "farmer", // agora reconhecido como tipo literal
  };

  return (
    <UserContext.Provider value={{ user: mockUser, setUser: vi.fn() }}>
      <MemoryRouter>{children}</MemoryRouter>
    </UserContext.Provider>
  );
};

describe("AnimalDetails", () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as unknown as vi.Mock).mockReturnValue({ id: "1" });
    (useNavigate as unknown as vi.Mock).mockReturnValue(navigateMock);
    localStorage.setItem("token", "mock-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("shows error message when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Erro de rede")));

    render(<AnimalDetails />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Erro de rede")).toBeInTheDocument();
    });
  });

  it("toggles view between list and calendar", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }));

    render(<AnimalDetails />, { wrapper: Wrapper });

    const toggleButton = await screen.findByRole("button", {
      name: /Alternar para calendário/i,
    });

    fireEvent.click(toggleButton);

    expect(
      await screen.findByRole("button", { name: /Alternar para lista/i })
    ).toBeInTheDocument();
  });

  it("navigates to edit page when Editar is clicked", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }));

    render(<AnimalDetails />, { wrapper: Wrapper });

    const editButton = await screen.findByRole("button", {
      name: "Editar",
    });

    fireEvent.click(editButton);

    expect(navigateMock).toHaveBeenCalledWith("/animal/1/edit");
  });

  it("fetches group data if animal has group_id and sets group state", async () => {
    // Mock da resposta do fetch para o animal com group_id
    const mockAnimalData = {
      id: 1,
      name: "Animal 1",
      group_id: 10,
    };

    // Mock da resposta do fetch para o grupo
    const mockGroupData = {
      id: 10,
      name: "Grupo Teste",
    };

    // Mock fetch que responde diferente dependendo da URL
    const fetchMock = vi.fn((url) => {
      if (url === "http://localhost:8000/sheep/1") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAnimalData),
        });
      }
      if (url === "http://localhost:8000/sheep-group/10") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGroupData),
        });
      }
      // Outros fetch podem retornar ok falso ou vazio, dependendo da sua implementação
      return Promise.resolve({ ok: false });
    });

    vi.stubGlobal("fetch", fetchMock);

    // Renderiza o componente
    render(<AnimalDetails />, { wrapper: Wrapper });

    // Espera que a chamada fetch tenha ocorrido para o grupo
    await waitFor(() => {
      // Espera que o fetch tenha sido chamado com URL do grupo
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/sheep-group/10",
        expect.objectContaining({
          headers: { Authorization: "Bearer mock-token" },
        })
      );
    });

    // Aqui você pode verificar se o nome do grupo está sendo exibido,
    // ou se o estado foi atualizado com os dados do grupo (depende do que seu componente renderiza)
    expect(await screen.findByText(/Grupo Teste/i)).toBeInTheDocument();
  });

  it("fetches consultas and sets consultas state with formatted data", async () => {
    // Mock dos dados que a API de consultas retornaria
    const mockConsultasData = [
      {
        id: 1,
        date: "2025-06-10T14:30:00Z",
        motivo: "Vacinação",
      },
      {
        id: 2,
        date: "2025-06-11T09:00:00Z",
        motivo: "", // vazio para testar fallback
      },
      {
        id: 3,
        date: "2025-06-12T10:00:00Z",
        // motivo ausente para testar fallback
      },
    ];

    // Mock fetch para endpoint /appointment?sheep_id=1
    const fetchMock = vi.fn((url) => {
      if (url.startsWith("http://localhost:8000/appointment")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockConsultasData),
        });
      }
      // Demais fetch fallback
      return Promise.resolve({ ok: false });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AnimalDetails />, { wrapper: Wrapper });

    // Espera que as consultas estejam renderizadas com dados formatados
    await waitFor(() => {
      // Verifica as datas formatadas (apenas a data, sem horário)
      expect(screen.getByText("2025-06-10")).toBeInTheDocument();
      expect(screen.getByText("2025-06-11")).toBeInTheDocument();
      expect(screen.getByText("2025-06-12")).toBeInTheDocument();

      // Verifica os motivos (incluindo fallback)
      expect(screen.getByText("Vacinação")).toBeInTheDocument();
      expect(screen.getAllByText("Sem motivo informado").length).toBe(2);
    });
  });
});
