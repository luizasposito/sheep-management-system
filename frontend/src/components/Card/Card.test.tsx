import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card component", () => {
  it("renderiza corretamente o conteúdo dentro do card", () => {
    render(<Card>Conteúdo do Card</Card>);
    expect(screen.getByText("Conteúdo do Card")).toBeInTheDocument();
  });

  it("aplica a classe 'card' do CSS corretamente", () => {
    render(<Card>Teste de Estilo</Card>);
    const card = screen.getByText("Teste de Estilo");
    // Verifique se a classe gerada dinamicamente contém 'card'
    expect(card).toHaveClass(/card/);  // Expressão regular para corresponder à classe 'card'
  });

  it("aplica classes adicionais através da prop className", () => {
    render(<Card className="extra-class">Card com classe extra</Card>);
    const card = screen.getByText("Card com classe extra");
    // Verifique se a classe gerada dinamicamente contém 'card' e a classe extra
    expect(card).toHaveClass(/card/);  // Expressão regular para corresponder à classe 'card'
    expect(card).toHaveClass("extra-class");
  });

  it("não aplica classes extras se a prop className não for fornecida", () => {
    render(<Card>Card sem classe extra</Card>);
    const card = screen.getByText("Card sem classe extra");
    // Verifique se a classe gerada dinamicamente contém 'card'
    expect(card).toHaveClass(/card/);  // Expressão regular para corresponder à classe 'card'
    expect(card).not.toHaveClass("extra-class");
  });
});
