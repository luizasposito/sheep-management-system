// src/components/__tests__/Card.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Card } from "./Card";

describe("Card component", () => {
  it("renders children correctly", () => {
    render(
      <Card>
        <p>Test Content</p>
      </Card>
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies additional className", () => {
    render(
      <Card className="extra-class">
        <p>With class</p>
      </Card>
    );

    const cardElement = screen.getByText("With class").parentElement;
    expect(cardElement?.className).toContain("extra-class");
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();

    render(
      <Card onClick={handleClick}>
        <p>Clickable</p>
      </Card>
    );

    const cardElement = screen.getByText("Clickable").parentElement!;
    fireEvent.click(cardElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
