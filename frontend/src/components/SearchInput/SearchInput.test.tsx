import { render, screen } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import { SearchInput } from "./SearchInput";

describe("SearchInput component", () => {
  it("renderiza corretamente o ícone de busca", () => {
    render(<SearchInput value="" onChange={() => {}} />);
    // Verifica se o ícone de busca (🔍) está sendo exibido
    expect(screen.getByText("🔍")).toBeInTheDocument();
  });

  it("atualiza o valor quando o usuário digita", async () => {
    const handleChange = vi.fn();
    render(<SearchInput value="" onChange={handleChange} />);
  
    const inputElement = screen.getByPlaceholderText("pesquisar");
    await userEvent.type(inputElement, "Novo valor");
  
    expect(handleChange).toHaveBeenCalled();
  });
  

  it("exibe o texto de placeholder correto", () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Buscar..." />);
    const inputElement = screen.getByPlaceholderText("Buscar...");
    expect(inputElement).toBeInTheDocument();
  });

  it("exibe o valor passado para o input", () => {
    render(<SearchInput value="teste" onChange={() => {}} />);
    const inputElement = screen.getByDisplayValue("teste");
    expect(inputElement).toBeInTheDocument();
  });
});