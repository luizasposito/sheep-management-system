
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageLayout } from "./PageLayout";
import { vi } from "vitest";

// Mock do Menu
vi.mock("../Menu/Menu", () => ({
  Menu: () => <nav data-testid="menu">Menu</nav>,
}));

describe("PageLayout", () => {
  it("deve renderizar o Menu e o conteúdo passado como children", () => {
    render(
      <PageLayout>
        <h1>Conteúdo da Página</h1>
      </PageLayout>
    );

    // Verifica se o Menu foi renderizado
    expect(screen.getByTestId("menu")).toBeInTheDocument();

    // Verifica se o conteúdo da página foi renderizado
    expect(screen.getByText("Conteúdo da Página")).toBeInTheDocument();
  });
});
