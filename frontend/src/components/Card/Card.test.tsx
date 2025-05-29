
import { describe, it, vi, expect } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card component", () => {
    it("renders children and applies default class", () => {
        render(<Card>Content inside card</Card>);
        const card = screen.getByText(/content inside card/i);

        expect(card).not.toBeNull();
        expect(card.tagName).toBe("DIV");

        // Verifica se o elemento tem a classe base do card
        // Como styles.card é importado como módulo CSS, ele gera uma string (ex: "Card_module_card__abc123")
        // Verifique se o className contém essa string (ajuste se o nome da classe for diferente)
        expect(card.className.includes("card")).toBe(true);
    });

    it("applies additional className if provided", () => {
        render(<Card className="extra-class">Extra Class</Card>);
        const card = screen.getByText(/extra class/i);

        // Deve conter a classe base e a extra
        expect(card.className.includes("card")).toBe(true);
        expect(card.className.includes("extra-class")).toBe(true);
    });

    it("calls onClick handler when clicked", () => {
        const onClick = vi.fn();
        render(<Card onClick={onClick}>Clickable Card</Card>);
        const card = screen.getByText(/clickable card/i);

        fireEvent.click(card);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("applies style prop correctly", () => {
        const style = { backgroundColor: "red", padding: "10px" };
        render(<Card style={style}>Styled Card</Card>);
        const card = screen.getByText(/styled card/i);

        expect(card.style.backgroundColor).toBe("red");
        expect(card.style.padding).toBe("10px");
    });
});
