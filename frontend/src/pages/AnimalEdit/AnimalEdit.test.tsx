import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { AnimalEdit } from "./AnimalEdit";

const navigateMock = vi.fn();

// Mock do react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "987" }),
    useNavigate: () => navigateMock,
  };
});

describe("AnimalEdit", () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  it("sets document title to 'Editar Animal'", () => {
    render(
      <MemoryRouter initialEntries={["/animal/987/edit"]}>
        <Routes>
          <Route path="/animal/:id/edit" element={<AnimalEdit />} />
        </Routes>
      </MemoryRouter>
    );
    expect(document.title).toBe("Editar Animal");
  });

  it("renders form fields and title with correct ID", () => {
    render(
      <MemoryRouter initialEntries={["/animal/987/edit"]}>
        <Routes>
          <Route path="/animal/:id/edit" element={<AnimalEdit />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Editar Animal 987")).toBeInTheDocument();

    expect(screen.getByLabelText("Sexo:")).toBeInTheDocument();
    expect(screen.getByLabelText("Status:")).toBeInTheDocument();
    expect(screen.getByLabelText("Produção leiteira (em litros):")).toBeInTheDocument();
    expect(screen.getByLabelText("Pai:")).toBeInTheDocument();
    expect(screen.getByLabelText("Mãe:")).toBeInTheDocument();
  });

  it("navigates back when Cancelar is clicked", () => {
    render(
      <MemoryRouter initialEntries={["/animal/987/edit"]}>
        <Routes>
          <Route path="/animal/:id/edit" element={<AnimalEdit />} />
        </Routes>
      </MemoryRouter>
    );

    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(navigateMock).toHaveBeenCalledWith("/animal/987");
  });
});
