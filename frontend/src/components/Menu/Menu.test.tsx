import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Menu } from "./Menu";

describe("Menu component", () => {
  beforeEach(() => {
    render(<Menu />);
  });

  it("renders the main menu item 'Início'", () => {
    const homeLink = screen.getByRole("link", { name: /início/i });
    expect(homeLink).toBeInTheDocument();
  });

  it("opens and displays submenu when clicking a menu item", () => {
    const configButton = screen.getByRole("link", { name: /configurações/i });
    fireEvent.click(configButton);

    expect(
      screen.getByRole("list", { name: /submenu configurações/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("Preferências")).toBeInTheDocument();
  });

  it("closes submenu when clicking the same menu again", () => {
    const configButton = screen.getByRole("link", { name: /configurações/i });
    fireEvent.click(configButton); // abre
    fireEvent.click(configButton); // fecha

    expect(
      screen.queryByRole("list", { name: /submenu configurações/i })
    ).not.toBeInTheDocument();
  });

  it("closes submenu when clicking outside", () => {
    const configButton = screen.getByRole("link", { name: /configurações/i });
    fireEvent.click(configButton);

    // Dispara evento de clique fora do menu
    fireEvent.mouseDown(document.body);

    expect(
      screen.queryByRole("list", { name: /submenu configurações/i })
    ).not.toBeInTheDocument();
  });
});
