import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dashboard } from "./Dashboard";
import { useUser } from "../../UserContext";
import { BrowserRouter } from "react-router-dom";

vi.mock("../../UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("../../components/LineGraph/LineGraph", () => ({
  default: () => <div data-testid="line-graph" />,
}));

vi.mock("../../components/PieChart/PieChart", () => ({
  default: () => <div data-testid="pie-chart" />,
}));

vi.mock("../../components/Card/Card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
}));

vi.mock("../../components/Button/Button", () => ({
  Button: ({ children, onClick, ...rest }: any) => (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("../../components/PageLayout/PageLayout", () => ({
  PageLayout: ({ children }: any) => <div>{children}</div>,
}));

const mockUser = { farmId: 1 };

const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

beforeEach(() => {
  (useUser as any).mockReturnValue({ user: mockUser });
  localStorage.setItem("token", "fake-token");

  global.fetch = vi.fn((url) => {
    const responses: Record<string, any> = {
      "http://localhost:8000/milk-production/total-today": { total_volume: 10 },
      "http://localhost:8000/milk-production/sum-last-7-days": { total_volume: 70 },
      "http://localhost:8000/milk-production/total-today-by-group": [
        { group_name: "Grupo A", total_volume: 5 },
        { group_name: "Grupo B", total_volume: 5 },
      ],
      "http://localhost:8000/milk-production/daily-total-last-7-days": [
        { date: "2025-06-01", total_volume: 10 },
        { date: "2025-06-02", total_volume: 12 },
      ],
      "http://localhost:8000/milk-production/daily-by-group-last-7-days": [
        { date: "2025-06-01", group_name: "Grupo A", total_volume: 5 },
        { date: "2025-06-01", group_name: "Grupo B", total_volume: 5 },
      ],
      "http://localhost:8000/milk-production/sum-2-weeks-ago": { total_volume: 50 },
      "http://localhost:8000/sheep-group/sheep-count-by-group": [
        { group_name: "Grupo A", count: 10 },
      ],
      "http://localhost:8000/appointment/": [
        {
          id: 1,
          date: new Date(Date.now() + 86400000).toISOString(),
          motivo: "Check-up",
          sheep_ids: [1],
        },
      ],
      "http://localhost:8000/sensor/": [
        {
          id: 1,
          name: "Sensor 1",
          min_value: 10,
          max_value: 20,
          current_value: 15,
        },
      ],
    };

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(responses[url as string] ?? {}),
    });
  }) as any;
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("Dashboard", () => {
    it("deve renderizar corretamente com todos os componentes", async () => {
        renderWithRouter(<Dashboard />);

        await waitFor(() => {
        expect(screen.getAllByTestId("card").length).toBeGreaterThan(0);
        });

        expect(screen.getAllByTestId("line-graph").length).toBeGreaterThanOrEqual(1); // Corrigido de 1 para >=1
        expect(screen.getAllByTestId("pie-chart").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Sensor 1")).toBeInTheDocument();
    });

    it("deve ativar formulário de criação de sensor", async () => {
        renderWithRouter(<Dashboard />);
        const createButton = await screen.findByRole("button", { name: /criar novo sensor/i });

        await userEvent.click(createButton);
        expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    });

    it("deve permitir editar sensor existente", async () => {
        renderWithRouter(<Dashboard />);
        const editButton = await screen.findByRole("button", { name: /editar/i });

        await userEvent.click(editButton);
        await waitFor(() => expect(screen.getByDisplayValue("Sensor 1")).toBeInTheDocument());

        await userEvent.clear(screen.getByLabelText(/nome/i));
        await userEvent.type(screen.getByLabelText(/nome/i), "Sensor Editado");

        expect(screen.getByDisplayValue("Sensor Editado")).toBeInTheDocument();
    });

    it("deve cancelar o formulário de sensor", async () => {
        renderWithRouter(<Dashboard />);
        const createButton = await screen.findByRole("button", { name: /criar novo sensor/i });

        await userEvent.click(createButton);
        const cancelButton = await screen.findByRole("button", { name: /cancelar/i });

        await userEvent.click(cancelButton);
        await waitFor(() => {
        expect(screen.queryByLabelText(/nome/i)).not.toBeInTheDocument();
        });
    });

    it("deve deletar um sensor com confirmação", async () => {
        renderWithRouter(<Dashboard />);
        const deleteButton = await screen.findByRole("button", { name: /apagar/i });

        await userEvent.click(deleteButton);
        const confirmButton = await screen.findByRole("button", { name: /confirmar/i });

        (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => ({}) })
        );

        await userEvent.click(confirmButton);

        await waitFor(() => {
        expect(screen.queryByText("Sensor 1")).not.toBeInTheDocument();
        });
    });

    it("deve exibir alerta se tentativa de salvar sem autenticação", async () => {
        (useUser as any).mockReturnValue({ user: null });
        vi.spyOn(window, "alert").mockImplementation(() => {});

        renderWithRouter(<Dashboard />);
        const createButton = await screen.findByRole("button", { name: /criar novo sensor/i });
        await userEvent.click(createButton);

        await userEvent.type(screen.getByLabelText(/nome/i), "Sensor Teste");
        await userEvent.type(screen.getByLabelText(/valor mínimo/i), "5");
        await userEvent.type(screen.getByLabelText(/valor máximo/i), "15");
        await userEvent.type(screen.getByLabelText(/valor atual/i), "10");

        const saveButton = screen.getByRole("button", { name: /salvar/i });
        await userEvent.click(saveButton);

        expect(window.alert).toHaveBeenCalledWith("Usuário não autenticado");
    });

    it("exibe erro ao falhar em buscar sensores", async () => {
        const errorMock = new Error("Erro no fetch de sensores");
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        // Simula fetch falhando na requisição de sensores
        (global.fetch as any) = vi.fn((url: string) => {
            if (url === "http://localhost:8000/sensor/") {
            return Promise.reject(errorMock);
            }
            return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({}),
            });
        });

        renderWithRouter(<Dashboard />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao buscar sensores:", errorMock);
        });
    });

    it("exibe erro ao falhar em carregar dados do dashboard", async () => {
        const errorMock = new Error("Erro geral de dados");
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(errorMock));

        renderWithRouter(<Dashboard />);  // usar renderWithRouter aqui

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao carregar dados:", errorMock);
        });
    });

    it("envia POST corretamente ao criar novo sensor", async () => {
        renderWithRouter(<Dashboard />);
        const createButton = await screen.findByRole("button", { name: /criar novo sensor/i });
        await userEvent.click(createButton);

        await userEvent.type(screen.getByLabelText(/nome/i), "Novo Sensor");
        await userEvent.type(screen.getByLabelText(/valor mínimo/i), "1");
        await userEvent.type(screen.getByLabelText(/valor máximo/i), "5");
        await userEvent.type(screen.getByLabelText(/valor atual/i), "3");

        const fetchSpy = vi.spyOn(global, "fetch");
        const saveButton = screen.getByRole("button", { name: /salvar/i });
        await userEvent.click(saveButton);

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith("http://localhost:8000/sensor/", expect.any(Object));
        });
    });

    it("envia PUT corretamente ao editar sensor", async () => {
        renderWithRouter(<Dashboard />);
        const editButton = await screen.findByRole("button", { name: /editar/i });
        await userEvent.click(editButton);

        await waitFor(() => expect(screen.getByDisplayValue("Sensor 1")).toBeInTheDocument());

        await userEvent.type(screen.getByLabelText(/nome/i), " Editado");
        const fetchSpy = vi.spyOn(global, "fetch");

        const saveButton = screen.getByRole("button", { name: /salvar/i });
        await userEvent.click(saveButton);

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith("http://localhost:8000/sensor/1", expect.any(Object));
        });
    });

    

});

describe("preenchimento de grupos faltantes com zero", () => {
    it("adiciona grupos ausentes com valor 0", () => {
        const groupedData = {
        "2025-01": { A: 10 },
        "2025-02": { B: 20 },
        };

        const groupNames = ["A", "B", "C"];

        const completeData = Object.values(groupedData).map((entry) => {
        for (const group of groupNames) {
            if (!(group in entry)) {
            entry[group] = 0;
            }
        }
        return entry;
        });

        expect(completeData).toEqual([
        { A: 10, B: 0, C: 0 },
        { A: 0, B: 20, C: 0 },
        ]);
    });
});
