import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dashboard } from "../pages/Dashboard";
import React from "react";

// Mock do PageLayout para evitar dependência de estilo/layout real
vi.mock("../components/Layout/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pagelayout-mock">{children}</div>
  ),
}));

// Mock do Card para facilitar a leitura dos testes
vi.mock("../components/Card/Card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
}));

describe("Dashboard component", () => {
  it("renderiza o título da fazenda", () => {
    render(<Dashboard />);
    expect(screen.getByText("Nome da Fazenda")).toBeInTheDocument();
  });

  it("renderiza os cards de produção", () => {
    render(<Dashboard />);
    expect(screen.getAllByTestId("card")).toHaveLength(6); // 3 produção + 2 gráficos + 1 atividades
  });

  it("renderiza a seção de produção com os dados corretos", () => {
    render(<Dashboard />);
    expect(screen.getByText("Produção últimas 24h")).toBeInTheDocument();
    expect(screen.getByText("86 L")).toBeInTheDocument();
    expect(screen.getByText("+5%")).toBeInTheDocument();
  });

  it("renderiza atividades da semana", () => {
    render(<Dashboard />);
    expect(screen.getByText("Ecografia - 10/05/2025")).toBeInTheDocument();
    expect(screen.getByText("Parto - 13/05/2025")).toBeInTheDocument();
    expect(screen.getByText("Consulta - 30/07/2025")).toBeInTheDocument();
  });

  it("usa o PageLayout corretamente", () => {
    render(<Dashboard />);
    expect(screen.getByTestId("pagelayout-mock")).toBeInTheDocument();
  });
});
