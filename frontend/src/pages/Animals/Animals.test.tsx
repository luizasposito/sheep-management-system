// Animals.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { Animals } from "./Animals";

// Mock do useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("Animals Page", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    mockNavigate.mockClear();
  });

  it("renderiza título e botão de criar", () => {
    render(<Animals />, { wrapper: MemoryRouter });
  
    expect(screen.getByRole("heading", { name: "Animais" })).toBeInTheDocument();
    expect(screen.getByText("Criar")).toBeInTheDocument();
  });
  

  it("renderiza todos os cards de animais por padrão", () => {
    render(<Animals />, { wrapper: MemoryRouter });

    expect(screen.getByText((_, node) => node?.textContent === "ID: 001")).toBeInTheDocument();
    expect(screen.getByText((_, node) => node?.textContent === "ID: 002")).toBeInTheDocument();
    expect(screen.getByText((_, node) => node?.textContent === "ID: 003")).toBeInTheDocument();
  });

  it("filtra animais por sexo", () => {
    render(<Animals />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByLabelText("Fêmea"));

    expect(screen.getByText((_, node) => node?.textContent === "ID: 001")).toBeInTheDocument();
    expect(screen.getByText((_, node) => node?.textContent === "ID: 003")).toBeInTheDocument();
    expect(screen.queryByText((_, node) => node?.textContent === "ID: 002")).not.toBeInTheDocument();
  });

  it("filtra animais por status", () => {
    render(<Animals />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByLabelText("Cria"));

    expect(screen.getByText((_, node) => node?.textContent === "ID: 001")).toBeInTheDocument();
    expect(screen.queryByText((_, node) => node?.textContent === "ID: 002")).not.toBeInTheDocument();
    expect(screen.queryByText((_, node) => node?.textContent === "ID: 003")).not.toBeInTheDocument();
  });

  it("filtra animais pelo campo de busca (por ID)", () => {
    render(<Animals />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByPlaceholderText("Pesquisar por id ou status"), {
      target: { value: "002" },
    });

    expect(screen.getByText((_, node) => node?.textContent === "ID: 002")).toBeInTheDocument();
    expect(screen.queryByText((_, node) => node?.textContent === "ID: 001")).not.toBeInTheDocument();
    expect(screen.queryByText((_, node) => node?.textContent === "ID: 003")).not.toBeInTheDocument();
  });

  it("navega para página de criação ao clicar em 'Criar'", () => {
    render(<Animals />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByText("Criar"));
    expect(mockNavigate).toHaveBeenCalledWith("/animal/add");
  });

  it("navega para a página do animal ao clicar no card", () => {
    render(<Animals />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByText((_, node) => node?.textContent === "ID: 001"));
    expect(mockNavigate).toHaveBeenCalledWith("/animal/001");
  });

  it("aplica filtro de sexo 'Macho' ao clicar no checkbox", () => {
    render(<Animals />, { wrapper: MemoryRouter });
  
    const machoCheckbox = screen.getByLabelText("Macho");
    fireEvent.click(machoCheckbox);
  
    // Usa função de matcher para verificar presença do ID 002
    const hasId002 = screen
    .queryAllByText((_, element) => !!element?.textContent?.includes("ID: 002"))
    .length > 0;

    expect(hasId002).toBe(true);

    
    expect(
      screen.queryByText((_, element) =>
        !!element?.textContent?.includes("ID: 001")
      )
    ).not.toBeInTheDocument();
    
    expect(
      screen.queryByText((_, element) =>
        !!element?.textContent?.includes("ID: 003")
      )
    ).not.toBeInTheDocument();
    
  });

  it("remove filtro de sexo 'Macho' ao clicar novamente no checkbox", () => {
    render(<Animals />, { wrapper: MemoryRouter });
  
    const checkboxMacho = screen.getByLabelText("Macho");
  
    // Primeiro clique: adiciona filtro
    fireEvent.click(checkboxMacho);
  
    // Segundo clique: remove filtro
    fireEvent.click(checkboxMacho);
  
    // Todos os animais devem estar visíveis novamente
    const id001Elements = screen.queryAllByText((_, el) =>
      el?.textContent?.includes("ID: 001") || false
    );
    expect(id001Elements.length).toBeGreaterThan(0);
    
    const id002Elements = screen.queryAllByText((_, el) =>
      el?.textContent?.includes("ID: 002") || false
    );
    expect(id002Elements.length).toBeGreaterThan(0);
    
    const id003Elements = screen.queryAllByText((_, el) =>
      el?.textContent?.includes("ID: 003") || false
    );
    expect(id003Elements.length).toBeGreaterThan(0);
  });
  
  
  
});
