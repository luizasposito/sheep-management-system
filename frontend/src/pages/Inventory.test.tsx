
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Inventory } from "../pages/Inventory";

// Mock do PageLayout para isolamento
vi.mock("../components/Layout/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pagelayout-mock">{children}</div>
  ),
}));

// Mock da Tabela
vi.mock("../components/Table/Table", () => ({
  Table: ({ headers, data }: { headers: string[]; data: string[][] }) => (
    <table data-testid="table-mock">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {row.map((cell, cellIndex) => (
              <td key={`cell-${rowIndex}-${cellIndex}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

describe("Inventory page", () => {
  it("renderiza dentro do layout", () => {
    render(<Inventory />);
    expect(screen.getByTestId("pagelayout-mock")).toBeInTheDocument();
  });

  it("exibe o título 'Inventário'", () => {
    render(<Inventory />);
    expect(screen.getByText("Inventário")).toBeInTheDocument();
  });

  it("renderiza os botões de ação", () => {
    render(<Inventory />);
    expect(screen.getByText("Criar")).toBeInTheDocument();
    expect(screen.getByText("Editar")).toBeInTheDocument();
    expect(screen.getByText("Deletar")).toBeInTheDocument();
  });

  it("renderiza a tabela com os dados", () => {
    render(<Inventory />);
    const headers = [
      "Tipo",
      "Nome",
      "Data última compra",
      "Taxa de consumo",
      "Quantidade em estoque",
      "Data próxima compra",
    ];

    for (const header of headers) {
      expect(screen.getByText(header)).toBeInTheDocument();
    }

    expect(screen.getAllByText("Ração xyz")).toHaveLength(5);
    expect(screen.getAllByTestId("table-mock")).toHaveLength(1);
  });
});
