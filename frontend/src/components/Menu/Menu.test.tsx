
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Menu } from "./Menu";
import { MemoryRouter } from "react-router-dom";

// Helper para renderizar com router
const renderMenu = () =>
  render(
    <MemoryRouter>
      <Menu />
    </MemoryRouter>
  );

describe("Menu component", () => {
  beforeEach(() => {
    document.body.innerHTML = ""; // limpa o DOM entre os testes
  });

  it("renders the 'Início' button", () => {
    renderMenu();
    expect(screen.getByRole("button", { name: /início/i })).toBeInTheDocument();
  });

  it("opens and closes submenu when clicking the same menu button", () => {
    renderMenu();

    const animalsButton = screen.getByRole("button", { name: /animais/i });
    fireEvent.click(animalsButton);
    expect(screen.getByRole("list", { name: /submenu animais/i })).toBeInTheDocument();

    fireEvent.click(animalsButton);
    expect(screen.queryByRole("list", { name: /submenu animais/i })).not.toBeInTheDocument();
  });

  it("closes open submenu when clicking outside", () => {
    renderMenu();

    const consultButton = screen.getByRole("button", { name: /consultas/i });
    fireEvent.click(consultButton);
    expect(screen.getByRole("list", { name: /submenu consultas/i })).toBeInTheDocument();

    fireEvent.mouseDown(document); // Simula clique fora
    expect(screen.queryByRole("list", { name: /submenu consultas/i })).not.toBeInTheDocument();
  });

  it("closes submenu when a submenu item is clicked", () => {
    renderMenu();

    const ambienteButton = screen.getByRole("button", { name: /ambiente/i });
    fireEvent.click(ambienteButton);

    const submenuLink = screen.getByRole("link", { name: /ver ambiente interno/i });
    fireEvent.click(submenuLink);

    expect(screen.queryByRole("list", { name: /submenu ambiente/i })).not.toBeInTheDocument();
  });
});
