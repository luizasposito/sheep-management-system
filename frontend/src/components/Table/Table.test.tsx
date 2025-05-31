import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Table } from "./Table";

describe("Table", () => {
  const headers = ["Name", "Age", "City"];
  const data = [
    ["Alice", 30, "New York"],
    ["Bob", 25, "Los Angeles"],
    ["Charlie", 35, "Chicago"],
  ];

  it("renders all headers", () => {
    render(<Table headers={headers} data={[]} />);
    headers.forEach(header => {
      const th = screen.getByText(header);
      expect(th).toBeDefined();
    });
  });

  it("renders correct number of rows", () => {
    render(<Table headers={headers} data={data} />);
    const rows = screen.getAllByRole("row");
    // 1 header row + data.length rows
    expect(rows.length).toBe(data.length + 1);
  });

  it("renders correct number of cells in each row", () => {
    render(<Table headers={headers} data={data} />);
    data.forEach(row => {
      row.forEach(cell => {
        const cellElement = screen.getByText(String(cell));
        expect(cellElement).toBeDefined();
      });
    });
  });

  it("applies evenRow class to even rows", () => {
    const { container } = render(<Table headers={headers} data={data} />);
    const rows = container.querySelectorAll("tbody tr");
    rows.forEach((row, idx) => {
      if (idx % 2 === 0) {
        expect(row.className).toContain("evenRow");
      } else {
        expect(row.className).not.toContain("evenRow");
      }
    });
  });
});
