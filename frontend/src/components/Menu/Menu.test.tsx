import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import { Menu } from "./Menu";

describe("Menu component", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Menu />
      </MemoryRouter>
    );
  });

  it("renders main menu items", () => {
    expect(screen.getByText("Início")).toBeInTheDocument();
    expect(screen.getByText("Inventário")).toBeInTheDocument();
    expect(screen.getByText("Animais")).toBeInTheDocument();
    expect(screen.getByText("Avisos")).toBeInTheDocument();
    expect(screen.getByText("Consultas")).toBeInTheDocument();
    expect(screen.getByText("Ambiente")).toBeInTheDocument();
    expect(screen.getByText("Mapa")).toBeInTheDocument();
  });

  it("shows submenu items when a menu item is clicked", () => {
    const inventarioButton = screen.getByText("Inventário");
    fireEvent.click(inventarioButton);

    expect(screen.getByText("Ver Itens")).toBeInTheDocument();
    expect(screen.getByText("Adicionar Item")).toBeInTheDocument();
  });

  it("hides submenu when clicking outside", () => {
    const inventarioButton = screen.getByText("Inventário");
    fireEvent.click(inventarioButton);
    expect(screen.getByText("Ver Itens")).toBeInTheDocument();

    fireEvent.mouseDown(document.body); // Simula clique fora
    expect(screen.queryByText("Ver Itens")).not.toBeInTheDocument();
  });
});
