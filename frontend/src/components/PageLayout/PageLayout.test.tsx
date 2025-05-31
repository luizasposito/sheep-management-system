
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageLayout } from "./PageLayout";

// Mock do Menu para evitar dependências externas no teste
vi.mock("../Menu/Menu", () => ({
  Menu: () => <div data-testid="mock-menu">Mock Menu</div>,
}));

describe("PageLayout", () => {
  it("renders the Menu and children content", () => {
    const sampleText = "Hello from the page!";
    
    render(
      <PageLayout>
        <div>{sampleText}</div>
      </PageLayout>
    );

    const menu = screen.queryByTestId("mock-menu");
    expect(menu).not.toBeNull();

    const childText = screen.queryByText(sampleText);
    expect(childText).not.toBeNull();
  });
});
