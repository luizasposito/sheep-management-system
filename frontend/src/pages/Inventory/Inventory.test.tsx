import { render, screen, fireEvent } from "@testing-library/react";
import { Inventory } from "./Inventory";
import { BrowserRouter } from 'react-router-dom';
import { vi } from "vitest";

// Mock dos componentes
vi.mock("../../components/Table/Table", () => ({
  Table: ({ headers, data }: { headers: string[]; data: string[][] }) => (
    <table>
      <thead>
        <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {row.map((cell, idx) => (
              <td key={idx}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

vi.mock("../../components/Button/Button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

vi.mock("../../components/SearchInput/SearchInput", () => ({
  SearchInput: ({ value, onChange, placeholder }: { value: string; onChange: any; placeholder: string }) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));

describe("Inventory", () => {
  it("should render inventory page with correct title", () => {
    render(
      <BrowserRouter>
        <Inventory />
      </BrowserRouter>
    );
    expect(document.title).toBe("Inventário");
  });

  it("should filter data based on search input", () => {
    render(
      <BrowserRouter>
        <Inventory />
      </BrowserRouter>
    );
    // Verifica se o input de pesquisa foi renderizado corretamente
    const searchInput = screen.getByPlaceholderText("Pesquisar por nome");
    expect(searchInput).toBeInTheDocument(); // Verifica se o elemento está na tela

    // Muda o valor de pesquisa
    fireEvent.change(searchInput, { target: { value: "Ração cria" } });

    // Espera que a linha "Ração cria" seja encontrada na tabela
    const tableRow = screen.getByText("Ração cria");
    expect(tableRow).toBeInTheDocument();
  });

  it("should display inventory table", () => {
    render(
      <BrowserRouter>
        <Inventory />
      </BrowserRouter>
    );
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
  });
});
