import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Dashboard } from "./Dashboard";

describe("Dashboard", () => {
  it("renderiza o título principal", () => {
    render(<Dashboard />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Nome da Fazenda");
  });

  it("renderiza os cards de produção", () => {
    const labels = [
      "Produção últimas 24h",
      "Produção últimos 7 dias",
      "Produção últimos 30 dias"
    ];

    render(<Dashboard />);
    labels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("renderiza os gráficos com seus títulos", () => {
    render(<Dashboard />);
    expect(screen.getByText("Produção de leite dos últimos 7 dias")).toBeInTheDocument();
    expect(screen.getByText("Por grupo")).toBeInTheDocument();
    expect(screen.getByText("Geral")).toBeInTheDocument();
  });

  it("renderiza a lista de atividades com títulos", () => {
    render(<Dashboard />);
    expect(screen.getByText("Esta semana")).toBeInTheDocument();
    expect(screen.getByText("Ecografia - 10/05/2025")).toBeInTheDocument();
    expect(screen.getByText("Consulta - 30/07/2025")).toBeInTheDocument();
  });
});
