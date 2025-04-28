import React from "react";
import { render, screen } from "@testing-library/react";
import { Dashboard } from "./Dashboard";

describe("Dashboard", () => {
  test("deve renderizar o nome da fazenda", () => {
    render(<Dashboard />);
    expect(screen.getByText(/Nome da Fazenda/i)).toBeInTheDocument();
  });

  test("deve renderizar os indicadores de produção", () => {
    render(<Dashboard />);
    expect(screen.getByText(/Produção últimas 24h/i)).toBeInTheDocument();
    expect(screen.getByText(/Produção últimos 7 dias/i)).toBeInTheDocument();
    expect(screen.getByText(/Produção últimos 30 dias/i)).toBeInTheDocument();
  });

  test("deve renderizar placeholders de gráfico", () => {
    render(<Dashboard />);
    expect(screen.getAllByText(/\[Gráfico Placeholder\]/i)).toHaveLength(2);
  });

  test("deve renderizar a tabela de atividades", () => {
    render(<Dashboard />);
    expect(screen.getByText(/Esta semana/i)).toBeInTheDocument();
    expect(screen.getByText(/Ecografia/i)).toBeInTheDocument();
  });
});
