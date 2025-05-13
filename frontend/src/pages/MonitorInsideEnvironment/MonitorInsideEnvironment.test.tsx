
import { render, screen } from "@testing-library/react";
import { MonitorInsideEnvironment } from "./MonitorInsideEnvironment";
import { vi } from "vitest";

// Mocks dos componentes reutilizáveis
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

describe("MonitorInsideEnvironment", () => {
  it("sets the document title", () => {
    render(<MonitorInsideEnvironment />);
    expect(document.title).toBe("Monitoramento Ambiente Interno");
  });

  it("renders main headings and buttons", () => {
    render(<MonitorInsideEnvironment />);
    expect(screen.getByText("Monitoramento do ambiente interno")).toBeInTheDocument();
    expect(screen.getByText("Limpeza de leitos")).toBeInTheDocument();
    expect(screen.getByText("Monitoramento de ar")).toBeInTheDocument();
    expect(screen.getByText("Marcar limpeza")).toBeInTheDocument();
    expect(screen.getByText("Adicionar sensor")).toBeInTheDocument();
  });

  it("renders all sensor cards with correct labels and values", () => {
    render(<MonitorInsideEnvironment />);

    // Checa existência dos sensores
    expect(screen.getByText("Oxigênio")).toBeInTheDocument();
    expect(screen.getByText("Amoníaco")).toBeInTheDocument();
    expect(screen.getByText("Temperatura")).toBeInTheDocument();

    // Checa valores exibidos
    expect(screen.getByText("50")).toBeInTheDocument(); // Oxigênio atual
    expect(screen.getByText("45")).toBeInTheDocument(); // Amoníaco atual
    expect(screen.getByText("33")).toBeInTheDocument(); // Temperatura atual
  });

  it("marks alert sensor with alert styles", () => {
    render(<MonitorInsideEnvironment />);
    const cards = screen.getAllByTestId("card");

    // Espera que só o último tenha classe de alerta
    expect(cards.at(2)?.className).toMatch(/alerta/);
    expect(cards.at(0)?.className).not.toMatch(/alerta/);
    expect(cards.at(1)?.className).not.toMatch(/alerta/);
  });
});
