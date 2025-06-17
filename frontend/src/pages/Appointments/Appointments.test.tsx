import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { Appointments } from "./Appointments";
import { MemoryRouter } from "react-router-dom";
import { useUser } from "../../UserContext";
import * as UserContext from "../../UserContext";

// Mocks
const navigateMock = vi.fn();

vi.mock("../../UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ search: "" }),
  };
});

describe("Appointments Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUser as unknown as vi.Mock).mockReturnValue({
      user: { id: 1, role: "farmer" },
    });

    vi.stubGlobal("fetch", vi.fn().mockImplementation((url) => {
      if (url.includes("appointment")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 1,
                date: new Date().toISOString(),
                sheep_ids: [101],
                motivo: "Verificação",
              },
            ]),
        });
      }

      if (url.includes("sheep-group")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, name: "Grupo A" },
              { id: 2, name: "Grupo B" },
            ]),
        });
      }

      if (url.includes("sheep")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 101, gender: "Macho", group_id: 1 },
              { id: 102, gender: "Fêmea", group_id: 2 },
            ]),
        });
      }

      return Promise.reject("URL desconhecida");
    }));
  });

  it("renders appointments page with data", async () => {
    render(<Appointments />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText(/Próximas consultas/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Verificação/i)).toBeInTheDocument();
    });
  });

  it("renders empty state if no appointments match filter", async () => {
    render(<Appointments />, { wrapper: MemoryRouter });

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText(/Pesquisar/i), {
        target: { value: "9999" },
      });
    });

    expect(await screen.findByText(/Nenhuma consulta encontrada/i)).toBeInTheDocument();
  });

  it("switches to calendar mode", async () => {
  const { container } = render(<Appointments />, { wrapper: MemoryRouter });

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Alternar para calendário/i }));
  });

  // Find calendar by CSS class 'react-calendar'
  const calendar = container.querySelector(".react-calendar");
  expect(calendar).toBeInTheDocument();

  // Find day buttons inside the calendar
  const dayButton = screen.getAllByRole("button").find((btn) =>
    btn.className.includes("react-calendar__tile")
  );

  expect(dayButton).toBeDefined();

  if (dayButton) {
    await act(async () => {
      fireEvent.click(dayButton);
    });
  }

  expect(await screen.findByText(/Consultas em/i)).toBeInTheDocument();
});


  it("navigates to new appointment when 'Agendar consulta' is clicked", async () => {
    (UserContext.useUser as vi.Mock).mockReturnValue({
      user: { id: 1, role: "farmer" },
    });

    render(<Appointments />, { wrapper: MemoryRouter });

    const button = await screen.findByText(/Agendar consulta/i);
    fireEvent.click(button);

    expect(navigateMock).toHaveBeenCalledWith("/appointment/add");
  });

  it("navigates to detail page when clicking an appointment", async () => {
    (UserContext.useUser as vi.Mock).mockReturnValue({
      user: { id: 1, role: "farmer" },
    });

    render(<Appointments />, { wrapper: MemoryRouter });

    const card = await screen.findByText(/Verificação/i);
    fireEvent.click(card);

    expect(navigateMock).toHaveBeenCalledWith("/appointment/1");
  });

  it("handles fetch error gracefully", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));

    render(<Appointments />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText(/Carregando consultas/i)).toBeInTheDocument();
    });
  });
});


describe("Appointments Page - toggleFilter behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (UserContext.useUser as unknown as vi.Mock).mockReturnValue({
      user: { id: 1, role: "farmer" },
    });

    vi.stubGlobal("fetch", vi.fn().mockImplementation((url) => {
      if (url.includes("appointment")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 1,
                date: new Date().toISOString(),
                sheep_ids: [101],
                motivo: "Verificação",
              },
            ]),
        });
      }

      if (url.includes("sheep-group")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, name: "Grupo A" },
              { id: 2, name: "Grupo B" },
            ]),
        });
      }

      if (url.includes("sheep")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 101, gender: "Macho", group_id: 1 },
              { id: 102, gender: "Fêmea", group_id: 2 },
            ]),
        });
      }

      return Promise.reject("URL desconhecida");
    }));
  });

  it("adds and removes sexo filter when clicking on sexo checkboxes", async () => {
    render(<Appointments />, { wrapper: MemoryRouter });

    // Espera filtros sexo aparecerem (Fêmea, Macho)
    await waitFor(() => {
      expect(screen.getByLabelText("Fêmea")).toBeInTheDocument();
      expect(screen.getByLabelText("Macho")).toBeInTheDocument();
    });

    const femeaCheckbox = screen.getByLabelText("Fêmea") as HTMLInputElement;
    const machoCheckbox = screen.getByLabelText("Macho") as HTMLInputElement;

    // Inicialmente desmarcados
    expect(femeaCheckbox.checked).toBe(false);
    expect(machoCheckbox.checked).toBe(false);

    // Clicar no checkbox "Fêmea" adiciona filtro
    fireEvent.click(femeaCheckbox);
    expect(femeaCheckbox.checked).toBe(true);

    // Clicar novamente remove filtro
    fireEvent.click(femeaCheckbox);
    expect(femeaCheckbox.checked).toBe(false);

    // Testar o outro filtro
    fireEvent.click(machoCheckbox);
    expect(machoCheckbox.checked).toBe(true);

    fireEvent.click(machoCheckbox);
    expect(machoCheckbox.checked).toBe(false);
  });

  it("adds and removes group filter when clicking on group checkboxes (user farmer)", async () => {
    render(<Appointments />, { wrapper: MemoryRouter });

    // Espera grupos aparecerem
    await waitFor(() => {
      expect(screen.getByLabelText("Grupo A")).toBeInTheDocument();
      expect(screen.getByLabelText("Grupo B")).toBeInTheDocument();
    });

    const grupoACheckbox = screen.getByLabelText("Grupo A") as HTMLInputElement;
    const grupoBCheckbox = screen.getByLabelText("Grupo B") as HTMLInputElement;

    expect(grupoACheckbox.checked).toBe(false);
    expect(grupoBCheckbox.checked).toBe(false);

    // Clicar para adicionar filtro
    fireEvent.click(grupoACheckbox);
    expect(grupoACheckbox.checked).toBe(true);

    // Clicar novamente para remover filtro
    fireEvent.click(grupoACheckbox);
    expect(grupoACheckbox.checked).toBe(false);

    // Outro grupo
    fireEvent.click(grupoBCheckbox);
    expect(grupoBCheckbox.checked).toBe(true);

    fireEvent.click(grupoBCheckbox);
    expect(grupoBCheckbox.checked).toBe(false);
  });
});