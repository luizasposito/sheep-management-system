// src/pages/__tests__/Animals.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Animals } from "./Animals";
import { MemoryRouter } from "react-router-dom";

// Mock de useNavigate
const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Funções utilitárias para selecionar ovelhas por ID
const getByAnimalId = (id: string) =>
  screen.getByText((_, el) => el?.textContent === `ID: ${id}`);

const queryByAnimalId = (id: string) =>
  screen.queryByText((_, el) => el?.textContent === `ID: ${id}`);

// Renderiza a página dentro de MemoryRouter
const renderAnimals = () =>
  render(
    <MemoryRouter>
      <Animals />
    </MemoryRouter>
  );

describe("Animals page", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  it("renders the title and all animals initially", () => {
    renderAnimals();

    expect(screen.getByText("Ovelhas")).toBeInTheDocument();
    expect(getByAnimalId("001")).toBeInTheDocument();
    expect(getByAnimalId("002")).toBeInTheDocument();
    expect(getByAnimalId("003")).toBeInTheDocument();
  });

  it("filters animals by search term", () => {
    renderAnimals();

    const input = screen.getByPlaceholderText("Pesquisar por id ou status");
    fireEvent.change(input, { target: { value: "Prenha" } });

    expect(getByAnimalId("003")).toBeInTheDocument();
    expect(queryByAnimalId("001")).not.toBeInTheDocument();
    expect(queryByAnimalId("002")).not.toBeInTheDocument();
  });

  it("filters animals by sexo", () => {
    renderAnimals();

    const femeaCheckbox = screen.getByLabelText("Fêmea");
    fireEvent.click(femeaCheckbox);

    expect(getByAnimalId("001")).toBeInTheDocument();
    expect(getByAnimalId("003")).toBeInTheDocument();
    expect(queryByAnimalId("002")).not.toBeInTheDocument();
  });

  it("filters animals by status", () => {
    renderAnimals();

    const statusCheckbox = screen.getByLabelText("Carneiro");
    fireEvent.click(statusCheckbox);

    expect(getByAnimalId("002")).toBeInTheDocument();
    expect(queryByAnimalId("001")).not.toBeInTheDocument();
    expect(queryByAnimalId("003")).not.toBeInTheDocument();
  });

  it("navigates when clicking on a card", () => {
    renderAnimals();

    const card = getByAnimalId("001").closest("div")!;
    fireEvent.click(card);

    expect(mockedNavigate).toHaveBeenCalledWith("/animal/001");
  });

  it("filters animals by sexo - Macho", () => {
    renderAnimals();
  
    const machoCheckbox = screen.getByLabelText("Macho");
    fireEvent.click(machoCheckbox);
  
    expect(getByAnimalId("002")).toBeInTheDocument(); // Macho
    expect(queryByAnimalId("001")).not.toBeInTheDocument(); // Fêmea
    expect(queryByAnimalId("003")).not.toBeInTheDocument(); // Fêmea
  });

  it("removes sexo filter when checkbox is toggled off", () => {
    renderAnimals();
  
    const machoCheckbox = screen.getByLabelText("Macho");
  
    // Primeiro clique: adiciona "Macho" ao filtro
    fireEvent.click(machoCheckbox);
    expect(getByAnimalId("002")).toBeInTheDocument(); // Macho
  
    // Segundo clique: remove "Macho" do filtro
    fireEvent.click(machoCheckbox);
    // Todos os animais devem estar visíveis novamente
    expect(getByAnimalId("001")).toBeInTheDocument();
    expect(getByAnimalId("002")).toBeInTheDocument();
    expect(getByAnimalId("003")).toBeInTheDocument();
  });
});
