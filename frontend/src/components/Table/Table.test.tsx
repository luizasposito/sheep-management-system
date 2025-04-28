
import { render, screen } from "@testing-library/react";
import { Table } from "./Table";

describe("Table component", () => {
  const headers = ["Nome", "Raça", "Idade"];
  const data = [
    ["Ovelha 1", "Merino", 2],
    ["Ovelha 2", "Suffolk", 3],
    ["Ovelha 3", "Dorper", 1],
  ];

  it("renderiza os headers corretamente", () => {
    render(<Table headers={headers} data={data} />);
    
    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it("renderiza os dados corretamente", () => {
    render(<Table headers={headers} data={data} />);
    
    data.forEach((row) => {
      row.forEach((cell) => {
        expect(screen.getByText(cell.toString())).toBeInTheDocument();
      });
    });
  });

  it("aplica a classe evenRow corretamente nas linhas pares", () => {
    const { container } = render(<Table headers={headers} data={data} />);
    const rows = container.querySelectorAll("tbody tr");

    expect(rows[0].className).toContain("evenRow"); // Primeira linha (índice 0) deve ter a classe
    expect(rows[1].className).not.toContain("evenRow"); // Segunda linha (índice 1) não deve ter
    expect(rows[2].className).toContain("evenRow"); // Terceira linha (índice 2) deve ter
  });
});
