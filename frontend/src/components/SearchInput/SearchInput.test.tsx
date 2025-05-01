import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("should render input with placeholder", () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText("pesquisar")).toBeInTheDocument();
  });

  it("should handle input change", () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("pesquisar"), { target: { value: "Test" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
