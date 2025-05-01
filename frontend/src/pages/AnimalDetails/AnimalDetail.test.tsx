import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

// Mocks compartilhados
vi.mock("../../components/Layout/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("../../components/Card/Card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
}));
vi.mock("../../components/Button/Button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

// 🔥 MOCK DE NAVIGATE E PARAMS
const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return {
      ...actual,
      useNavigate: () => navigateMock,
      useParams: () => ({ id: "321" }),
      MemoryRouter: actual.MemoryRouter,
      Route: actual.Route,
      Routes: actual.Routes,
    };
  });
  

// IMPORTAÇÃO POSTERIOR AOS MOCKS!
import { AnimalDetails } from "./AnimalDetail";

describe("AnimalDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.title = "";
  });

  it("sets document title to 'Editar Animal'", () => {
    render(
      <MemoryRouter initialEntries={["/animal/321"]}>
        <Routes>
          <Route path="/animal/:id" element={<AnimalDetails />} />
        </Routes>
      </MemoryRouter>
    );
    expect(document.title).toBe("Editar Animal");
  });

  it("renders animal ID from useParams", () => {
    render(
      <MemoryRouter initialEntries={["/animal/321"]}>
        <Routes>
          <Route path="/animal/:id" element={<AnimalDetails />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Animal 321")).toBeInTheDocument();
    expect(screen.getByText((_content, element) => {
        return element?.textContent === "ID: 321";
      })).toBeInTheDocument();
      
  });

  it("calls navigate on Editar button click", () => {
    render(
      <MemoryRouter initialEntries={["/animal/321"]}>
        <Routes>
          <Route path="/animal/:id" element={<AnimalDetails />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Editar"));
    expect(navigateMock).toHaveBeenCalledWith("/animal/321/edit");
  });

  it("renders parent and cria buttons", () => {
    render(
      <MemoryRouter initialEntries={["/animal/321"]}>
        <Routes>
          <Route path="/animal/:id" element={<AnimalDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Deve haver 2 pais e 8 crias
    const idButtons = screen.getAllByText("<id>");
    expect(idButtons.length).toBe(10);
  });

  it("renders history and upcoming consultations", () => {
    render(
      <MemoryRouter initialEntries={["/animal/321"]}>
        <Routes>
          <Route path="/animal/:id" element={<AnimalDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Seções devem estar visíveis
    expect(screen.getByText("Histórico de consultas")).toBeInTheDocument();
    expect(screen.getByText("Próximas consultas")).toBeInTheDocument();

    // Deve haver 4 históricos e 3 futuras consultas
    const historyItems = screen.getAllByText("Data:");
    expect(historyItems.length).toBe(7);
  });
});
