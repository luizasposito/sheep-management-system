
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnimalCreate } from "./AnimalCreate";
import { MemoryRouter, useNavigate } from "react-router-dom";

// Mock do useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("AnimalCreate", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    mockNavigate.mockClear();
  });

  it("renderiza todos os campos do formulário", () => {
    render(<AnimalCreate />, { wrapper: MemoryRouter });

    expect(screen.getByText("Adicionar novo animal")).toBeInTheDocument();
    expect(screen.getByLabelText("ID:")).toBeInTheDocument();
    expect(screen.getByLabelText("Data de nascimento:")).toBeInTheDocument();
    expect(screen.getByLabelText("Sexo:")).toBeInTheDocument();
    expect(screen.getByLabelText("Status:")).toBeInTheDocument();
    expect(screen.getByLabelText("Produção leiteira (em litros):")).toBeInTheDocument();
    expect(screen.getByLabelText("Pai:")).toBeInTheDocument();
    expect(screen.getByLabelText("Mãe:")).toBeInTheDocument();
  });

  it("permite preencher o formulário", () => {
    render(<AnimalCreate />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText("Sexo:"), { target: { value: "Fêmea" } });
    fireEvent.change(screen.getByLabelText("Status:"), { target: { value: "Prenha" } });
    fireEvent.change(screen.getByPlaceholderText("Litros"), { target: { value: "5" } });
    fireEvent.change(screen.getByPlaceholderText("ID do pai"), { target: { value: "123" } });
    fireEvent.change(screen.getByPlaceholderText("ID da mãe"), { target: { value: "456" } });

    expect(screen.getByDisplayValue("Fêmea")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Prenha")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123")).toBeInTheDocument();
    expect(screen.getByDisplayValue("456")).toBeInTheDocument();
  });

  it("navega para /animal ao clicar em 'Cancelar'", () => {
    render(<AnimalCreate />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockNavigate).toHaveBeenCalledWith("/animal");
  });

  it("envia o formulário e navega para /animal ao clicar em 'Salvar'", () => {
    render(<AnimalCreate />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText("Sexo:"), { target: { value: "Macho" } });
    fireEvent.click(screen.getByText("Salvar"));

    expect(mockNavigate).toHaveBeenCalledWith("/animal");
  });
});
