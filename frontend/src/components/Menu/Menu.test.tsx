import { render, screen, fireEvent } from "@testing-library/react";
import { Menu } from "./Menu";

describe("Menu Component", () => {
  it("submenu items are hidden initially", () => {
    render(<Menu />);
    
    const submenuItem = screen.queryByText("Ver Itens");
    expect(submenuItem).not.toBeInTheDocument();
  });

  it("shows Inventário submenu on hover", () => {
    render(<Menu />);
    
    const inventoryMenuItem = screen.getByText("Inventário");

    fireEvent.mouseOver(inventoryMenuItem);

    const submenuItem = screen.getByText("Ver Itens");
    expect(submenuItem).toBeVisible();
  });

  it("shows Animais submenu on hover", () => {
    render(<Menu />);
    
    const animaisMenuItem = screen.getByText("Animais");

    fireEvent.mouseOver(animaisMenuItem);

    const submenuItem = screen.getByText("Ver Animais");
    expect(submenuItem).toBeVisible();
  });

  it("shows Avisos submenu on hover", () => {
    render(<Menu />);
    
    const avisosMenuItem = screen.getByText("Avisos");

    fireEvent.mouseOver(avisosMenuItem);

    const submenuItem = screen.getByText("Ver Avisos");
    expect(submenuItem).toBeVisible();
  });

  it("shows Configurações submenu on hover", () => {
    render(<Menu />);
    
    const configMenuItem = screen.getByText("Configurações");

    fireEvent.mouseOver(configMenuItem);

    const submenuItem = screen.getByText("Perfil");
    expect(submenuItem).toBeVisible();
  });
});
