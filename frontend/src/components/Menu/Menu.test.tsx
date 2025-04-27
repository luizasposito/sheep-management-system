import { render, screen, fireEvent } from "@testing-library/react";
import { Menu } from "./Menu";
import { BrowserRouter as Router } from "react-router-dom";

describe("Menu component", () => {
  it("renderiza corretamente o botão de menu", () => {
    render(
      <Router>
        <Menu />
      </Router>
    );
    // Verifique se o ícone de menu está sendo renderizado
    expect(screen.getByText("≡")).toBeInTheDocument();
  });

  it("abre o menu ao clicar no botão de menu", () => {
    render(
      <Router>
        <Menu />
      </Router>
    );
    const toggleButton = screen.getByText("≡");

    // Clique no botão
    fireEvent.click(toggleButton);

    // Verifique se o menu (menuBox) aparece após o clique
    expect(screen.getByText("Inventário")).toBeInTheDocument();
    expect(screen.getByText("Ovelhas")).toBeInTheDocument();
    expect(screen.getByText("Calendário")).toBeInTheDocument();
    expect(screen.getByText("Mapa")).toBeInTheDocument();
    expect(screen.getByText("Consultas")).toBeInTheDocument();
    expect(screen.getByText("Controlo do Ambiente")).toBeInTheDocument();
  });

  it("fecha o menu ao clicar novamente no botão de menu", () => {
    render(
      <Router>
        <Menu />
      </Router>
    );
    const toggleButton = screen.getByText("≡");

    // Clique para abrir o menu
    fireEvent.click(toggleButton);
    // Verifique se o menu foi aberto
    expect(screen.getByText("Inventário")).toBeInTheDocument();

    // Clique novamente para fechar o menu
    fireEvent.click(toggleButton);

    // Verifique se o menu foi fechado
    expect(screen.queryByText("Inventário")).not.toBeInTheDocument();
  });

  it("verifica se o link para 'Inventário' está correto", () => {
    render(
      <Router>
        <Menu />
      </Router>
    );
    const toggleButton = screen.getByText("≡");

    // Clique para abrir o menu
    fireEvent.click(toggleButton);

    // Verifique se o link para 'Inventário' está presente e correto
    const inventoryLink = screen.getByText("Inventário");
    expect(inventoryLink).toHaveAttribute("href", "/inventory");
  });

  it("verifica se o menu não é exibido inicialmente", () => {
    render(
      <Router>
        <Menu />
      </Router>
    );
    // Verifique se o menu não é exibido inicialmente
    expect(screen.queryByText("Inventário")).not.toBeInTheDocument();
  });
});
