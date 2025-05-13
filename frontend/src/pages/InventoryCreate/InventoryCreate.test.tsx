
import { render, screen, fireEvent } from "@testing-library/react";
import { InventoryCreate } from "./InventoryCreate";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock de navegação
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mock dos componentes
vi.mock("../../components/Layout/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("../../components/Card/Card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("../../components/Button/Button", () => ({
  Button: ({ children, onClick, type }: { children: React.ReactNode; onClick?: () => void; type?: string }) => (
    <button onClick={onClick} type={type}>{children}</button>
  ),
}));

describe("InventoryCreate", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  it("should render the form fields correctly", () => {
    render(
      <BrowserRouter>
        <InventoryCreate />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Nome do item/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantidade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Unidade de medida/i)).toBeInTheDocument();
  });

  it("should allow user to fill and submit the form", () => {
    const logSpy = vi.spyOn(console, "log");

    render(
      <BrowserRouter>
        <InventoryCreate />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Nome do item/i), { target: { value: "Ração premium" } });
    fireEvent.change(screen.getByLabelText(/Tipo/i), { target: { value: "alimentação" } });
    fireEvent.change(screen.getByLabelText(/Quantidade/i), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(/Unidade de medida/i), { target: { value: "kg" } });

    fireEvent.click(screen.getByText(/Salvar/i));

    expect(logSpy).toHaveBeenCalledWith("Novo item de inventário:", {
      nome: "Ração premium",
      tipo: "alimentação",
      quantidade: "50",
      unidade: "kg",
    });
    expect(mockedNavigate).toHaveBeenCalledWith("/inventory");

    logSpy.mockRestore();
  });

  it("should cancel and navigate back when 'Cancelar' is clicked", () => {
    render(
      <BrowserRouter>
        <InventoryCreate />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Cancelar/i));
    expect(mockedNavigate).toHaveBeenCalledWith("/inventory");
  });
});
