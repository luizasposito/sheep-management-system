
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RequireRole } from "./RequireRole";

// Mock do react-router-dom
vi.mock("react-router-dom", () => {
  const original = vi.importActual("react-router-dom");
  return {
    ...original,
    useLocation: () => ({ pathname: "/some-path" }),
    Navigate: (props: any) => {
      // Renderiza o componente com a prop "to" para detectar redirecionamento
      return <div>Redirect to: {props.to}</div>;
    },
  };
});

describe("RequireRole component", () => {
  // Limpar localStorage antes de cada teste
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirects to /login if user is not logged in", () => {
    // Não adiciona token nem role no localStorage (não logado)
    render(
      <RequireRole allowedRoles={["farmer"]}>
        <div>Protected Content</div>
      </RequireRole>
    );

    const redirect = screen.queryByText(/Redirect to: \/login/i);
    expect(redirect).not.toBeNull();
  });

  it("redirects to /unauthorized if user role is not allowed", () => {
    // Simula usuário logado com role 'guest' não permitido
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("userRole", "guest");

    render(
      <RequireRole allowedRoles={["farmer", "veterinarian"]}>
        <div>Protected Content</div>
      </RequireRole>
    );

    const redirect = screen.queryByText(/Redirect to: \/unauthorized/i);
    expect(redirect).not.toBeNull();
  });

  it("renders children if user is logged in and role is allowed", () => {
    // Simula usuário logado com role permitido
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("userRole", "farmer");

    render(
      <RequireRole allowedRoles={["farmer", "veterinarian"]}>
        <div>Protected Content</div>
      </RequireRole>
    );

    const content = screen.queryByText("Protected Content");
    expect(content).not.toBeNull();
  });

  it("redirects to /unauthorized if userRole is null", () => {
    // Simula usuário logado mas sem role
    localStorage.setItem("token", "fake-token");
    localStorage.removeItem("userRole");

    render(
      <RequireRole allowedRoles={["farmer"]}>
        <div>Protected Content</div>
      </RequireRole>
    );

    const redirect = screen.queryByText(/Redirect to: \/unauthorized/i);
    expect(redirect).not.toBeNull();
  });
});
