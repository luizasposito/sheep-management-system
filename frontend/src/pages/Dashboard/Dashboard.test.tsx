import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dashboard } from "./Dashboard";
import { BrowserRouter } from "react-router-dom";

// Mock do componente PageLayout e Card
vi.mock("../../../components/Layout/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock("../../../components/Card/Card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>
}));

describe("Dashboard Page", () => {
  beforeEach(() => {
    document.title = "";
  });

  it("sets the document title to 'Dashboard'", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    expect(document.title).toBe("Dashboard");
  });

  it("renders farm name header", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    expect(screen.getByRole("heading", { name: /nome da fazenda/i })).toBeInTheDocument();
  });

  it("renders 3 production cards with correct labels and values", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Produção últimas 24h/i)).toBeInTheDocument();
    expect(screen.getByText(/86 L/i)).toBeInTheDocument();
    expect(screen.getByText("+5%")).toBeInTheDocument();

    expect(screen.getByText(/Produção últimos 7 dias/i)).toBeInTheDocument();
    expect(screen.getByText(/432 L/i)).toBeInTheDocument();
    expect(screen.getByText("-3%")).toBeInTheDocument();

    expect(screen.getByText(/Produção últimos 30 dias/i)).toBeInTheDocument();
    expect(screen.getByText(/967 L/i)).toBeInTheDocument();
    expect(screen.getByText("+7%")).toBeInTheDocument();
  });

  it("renders chart placeholders", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Use getAllByText to find multiple placeholders
    const placeholders = screen.getAllByText("[Gráfico Placeholder]");
    
    // Make sure there are exactly 2 placeholders
    expect(placeholders).toHaveLength(2); // Adjust this number based on how many placeholders are expected
  });

  it("renders activity list for this week", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/ecografia - 10\/05\/2025/i)).toBeInTheDocument();
    expect(screen.getByText(/parto - 13\/05\/2025/i)).toBeInTheDocument();
    expect(screen.getByText(/vacinação - 22\/06\/2025/i)).toBeInTheDocument();
    expect(screen.getByText(/consulta - 30\/07\/2025/i)).toBeInTheDocument();
  });
});
