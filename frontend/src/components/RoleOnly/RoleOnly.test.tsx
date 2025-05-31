import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleOnly } from "./RoleOnly";

// Mock do módulo com o caminho correto
vi.mock("../../UserContext", () => ({
  useUser: vi.fn(),
}));

import { useUser } from "../../UserContext";

const mockUseUser = useUser as unknown as ReturnType<typeof vi.fn> & {
  mockReturnValue: (value: any) => void;
};

describe("RoleOnly", () => {
  it("renders children if user role matches", () => {
    mockUseUser.mockReturnValue({ user: { role: "farmer" } });
    render(
      <RoleOnly role="farmer">
        <span>Allowed Content</span>
      </RoleOnly>
    );
    const content = screen.getByText("Allowed Content");
    expect(content).toBeDefined();
  });

  it("does not render children if user role does not match", () => {
    mockUseUser.mockReturnValue({ user: { role: "veterinarian" } });
    render(
      <RoleOnly role="farmer">
        <span>Blocked Content</span>
      </RoleOnly>
    );
    const content = screen.queryByText("Blocked Content");
    expect(content).toBeNull();
  });

  it("does not render children if user is undefined", () => {
    mockUseUser.mockReturnValue({ user: undefined });
    render(
      <RoleOnly role="farmer">
        <span>Blocked Content</span>
      </RoleOnly>
    );
    const content = screen.queryByText("Blocked Content");
    expect(content).toBeNull();
  });
});
