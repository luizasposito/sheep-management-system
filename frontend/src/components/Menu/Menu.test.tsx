import { render, screen, fireEvent } from "@testing-library/react";
import { Menu } from "./Menu";

describe("Menu Component", () => {
  it("submenu items are hidden initially", () => {
    render(<Menu />);
    
    const submenuItem = screen.queryByText("Ver Itens");
    expect(submenuItem).not.toBeInTheDocument();
  });

  it("shows Inventário submenu on click", () => {
    render(<Menu />);
    
    const inventoryMenuItem = screen.getByRole('button', { name: /Inventário/i });
    fireEvent.click(inventoryMenuItem);

    const submenuItem = screen.getByText("Ver Itens");
    expect(submenuItem).toBeVisible();
  });

  it("shows Animais submenu on click", () => {
    render(<Menu />);
    
    const animaisMenuItem = screen.getByRole('button', { name: /Animais/i });
    fireEvent.click(animaisMenuItem);

    const submenuItem = screen.getByText("Ver Animais");
    expect(submenuItem).toBeVisible();
  });

  it("shows Avisos submenu on click", () => {
    render(<Menu />);
    
    const avisosMenuItem = screen.getByRole('button', { name: /Avisos/i });
    fireEvent.click(avisosMenuItem);

    const submenuItem = screen.getByText("Ver Avisos");
    expect(submenuItem).toBeVisible();
  });

  it("shows Configurações submenu on click", () => {
    render(<Menu />);
    
    const configMenuItem = screen.getByRole('button', { name: /Configurações/i });
    fireEvent.click(configMenuItem);

    const submenuItem = screen.getByText("Perfil");
    expect(submenuItem).toBeVisible();
  });
});
