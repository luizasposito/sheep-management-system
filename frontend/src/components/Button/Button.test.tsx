import "@testing-library/jest-dom";
import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { Button } from "./Button";
import React from "react";

describe("Button component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders with children and default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });

    expect(button).not.toBeNull();
    expect(button.tagName).toBe("BUTTON");
    expect(button.textContent).toBe("Click me");

    expect(button.getAttribute("type")).toBe("button");
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("respects the 'type' prop", () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole("button", { name: /submit/i });

    expect(button.getAttribute("type")).toBe("submit");
  });

  it("applies 'disabled' prop", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: /disabled/i });

    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("does not toggle clicked state or call onClick if disabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Can't click</Button>);
    const button = screen.getByRole("button", { name: /can't click/i });

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();

    // Linha 23 coberta: clicando em botão desabilitado sai do handleClick
    // Garantir que a classe ativa NÃO mudou para 'dark'
    expect(button.className.includes("dark")).toBe(false);
    expect(button.className.includes("light")).toBe(true);
  });

  it("calls onClick and toggles 'clicked' state briefly", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    const button = screen.getByRole("button", { name: /click/i });

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);

    // Logo após o clique, deve conter classe "dark" (linha 31 ativa a variação)
    expect(button.className.includes("dark")).toBe(true);

    // Avança timer e executa callback do setTimeout para resetar clicked
    await act(async () => {
      vi.advanceTimersByTime(150);
      vi.runOnlyPendingTimers();
    });

    // Após timeout, classe deve voltar para "light" (linha 31 ativa variação)
    expect(button.className.includes("light")).toBe(true);
  });

  it("does not call onClick if disabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Can't click</Button>);
    const button = screen.getByRole("button", { name: /can't click/i });

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>With Ref</Button>);

    expect(ref.current).not.toBeNull();
    expect(ref.current instanceof HTMLButtonElement).toBe(true);
    expect(ref.current?.textContent).toBe("With Ref");
  });
});
