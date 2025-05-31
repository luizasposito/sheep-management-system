
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { UserProvider, useUser } from "./UserContext";

// Componente auxiliar para testar o hook useUser
function UserDisplay() {
  const { user } = useUser();
  return <div>{user ? `User: ${user.name}` : "No user"}</div>;
}

describe("UserContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches user data and sets user if token exists", async () => {
    const fakeUser = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      farm_id: 123,
      role: "farmer",
    };
    localStorage.setItem("token", "fake-token");

    // Mock do fetch para simular retorno da API
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fakeUser),
      })
    ));

    render(
      <UserProvider>
        <UserDisplay />
      </UserProvider>
    );

    // O componente inicialmente renderiza "No user"
    expect(screen.queryByText("No user")).not.toBeNull();

    // Espera até o nome do usuário aparecer (atualização do state)
    await waitFor(() => {
      expect(screen.queryByText(`User: ${fakeUser.name}`)).not.toBeNull();
    });

    expect(fetch).toHaveBeenCalledWith("http://localhost:8000/auth/me", {
      headers: {
        Authorization: "Bearer fake-token",
      },
    });
  });

  it("does not fetch user data if no token", () => {
    // Sem token no localStorage
    vi.stubGlobal("fetch", vi.fn());

    render(
      <UserProvider>
        <UserDisplay />
      </UserProvider>
    );

    expect(screen.queryByText("No user")).not.toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("removes token from localStorage if fetch fails", async () => {
    localStorage.setItem("token", "fake-token");

    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ));

    render(
      <UserProvider>
        <UserDisplay />
      </UserProvider>
    );

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  it("useUser throws error if used outside UserProvider", () => {
    // Função que tenta usar o hook fora do provider
    function TestComponent() {
      useUser();
      return null;
    }

    // Espera que o render lance erro
    expect(() => render(<TestComponent />)).toThrowError(
      /useUser deve ser usado dentro de UserProvider/
    );
  });
});
