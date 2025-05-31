import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("renders with default placeholder", () => {
    render(<SearchInput value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText("pesquisar");
    expect(input).toBeDefined();
  });

  it("renders with custom placeholder", () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="buscar..." />);
    const input = screen.getByPlaceholderText("buscar...");
    expect(input).toBeDefined();
  });

  it("displays the correct value", () => {
    render(<SearchInput value="abc" onChange={() => {}} />);
    const input = screen.getByDisplayValue("abc");
    expect(input).toBeDefined();
  });

  it("calls onChange when input changes", () => {
    const handleChange = vi.fn();
    render(<SearchInput value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText("pesquisar");
    fireEvent.change(input, { target: { value: "x" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
