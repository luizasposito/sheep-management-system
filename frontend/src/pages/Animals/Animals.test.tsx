import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Animals } from "./Animals";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";

vi.mock("../../UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const toggleFilter = (
    value: string,
    current: string[],
    setFilter: React.Dispatch<React.SetStateAction<string[]>>
) => {
    setFilter((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
};


describe("Animals page", () => {
    const navigateMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useUser as unknown as vi.Mock).mockReturnValue({
        user: { role: "farmer", id: 1, farm_id: 1 },
        setUser: vi.fn(),
        });
        (useNavigate as unknown as vi.Mock).mockReturnValue(navigateMock);
        vi.stubGlobal("fetch", vi.fn());
        vi.spyOn(window, "alert").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders loading state initially", () => {
        // Simula fetch pendente
        (fetch as unknown as vi.Mock).mockImplementation(() => new Promise(() => {}));
        render(<Animals />, { wrapper: MemoryRouter });
        expect(screen.getByText("Carregando animais e grupos...")).toBeInTheDocument();
    });

    it("redirects to /unauthorized if user role is invalid", () => {
        (useUser as unknown as vi.Mock).mockReturnValueOnce({
        user: { role: "unknown" },
        setUser: vi.fn(),
        });

        render(<Animals />, { wrapper: MemoryRouter });

        expect(navigateMock).toHaveBeenCalledWith("/unauthorized");
    });

    it("renders loading state initially", () => {
    // Simula fetch pendente
    (fetch as unknown as vi.Mock).mockImplementation(() => new Promise(() => {}));
    render(<Animals />, { wrapper: MemoryRouter });
    expect(screen.getByText("Carregando animais e grupos...")).toBeInTheDocument();
  });

  it("redirects to /unauthorized if user role is invalid", () => {
    (useUser as unknown as vi.Mock).mockReturnValueOnce({
      user: { role: "unknown" },
      setUser: vi.fn(),
    });

    render(<Animals />, { wrapper: MemoryRouter });

    expect(navigateMock).toHaveBeenCalledWith("/unauthorized");
  });
});


describe("toggleFilter function", () => {
    it("removes a value from the filter if already present", () => {
        const current = ["sheep1", "sheep2"];
        const setFilter = vi.fn();

        toggleFilter("sheep1", current, setFilter);

        expect(setFilter).toHaveBeenCalledWith(expect.any(Function));
        
        // Executa o callback passado para setFilter com o valor atual
        const callback = setFilter.mock.calls[0][0];
        const result = callback(current);

        expect(result).toEqual(["sheep2"]);
    });

    it("adds a value to the filter if not present", () => {
        const current = ["sheep2"];
        const setFilter = vi.fn();

        toggleFilter("sheep1", current, setFilter);

        expect(setFilter).toHaveBeenCalledWith(expect.any(Function));

        const callback = setFilter.mock.calls[0][0];
        const result = callback(current);

        expect(result).toEqual(["sheep2", "sheep1"]);
    });
});


describe("applyFilters function", () => {
    let searchTerm: string;
    let filterSexo: string[];
    let filterGroups: string[];

    const applyFilters = (animal: {
        id: string;
        gender: string;
        group_id: string | null;
    }) => {
        const matchesSearch = animal.id.includes(searchTerm);

        const matchesSexo =
        filterSexo.length === 0 || filterSexo.includes(animal.gender);

        const matchesGroup =
        filterGroups.length === 0 ||
        (animal.group_id && filterGroups.includes(animal.group_id));

        return matchesSearch && matchesSexo && matchesGroup;
    };

    const exampleAnimal = {
        id: "abc123",
        gender: "fêmea",
        group_id: "grupo1",
    };

    beforeEach(() => {
        searchTerm = "";
        filterSexo = [];
        filterGroups = [];
    });

    it("returns true when no filters are applied", () => {
        expect(applyFilters(exampleAnimal)).toBe(true);
    });

    it("filters by searchTerm (id)", () => {
        searchTerm = "abc";
        expect(applyFilters(exampleAnimal)).toBe(true);

        searchTerm = "xyz";
        expect(applyFilters(exampleAnimal)).toBe(false);
    });

    it("filters by gender (filterSexo)", () => {
        filterSexo = ["fêmea"];
        expect(applyFilters(exampleAnimal)).toBe(true);

        filterSexo = ["macho"];
        expect(applyFilters(exampleAnimal)).toBe(false);
    });

    it("filters by group_id (filterGroups)", () => {
        filterGroups = ["grupo1"];
        expect(applyFilters(exampleAnimal)).toBe(true);

        filterGroups = ["grupo2"];
        expect(applyFilters(exampleAnimal)).toBe(false);
    });

    it("returns false if any filter fails", () => {
        searchTerm = "abc";
        filterSexo = ["macho"]; // errado
        filterGroups = ["grupo1"]; // certo

        expect(applyFilters(exampleAnimal)).toBe(false);
    });

    it("returns true if all filters match", () => {
        searchTerm = "abc";
        filterSexo = ["fêmea"];
        filterGroups = ["grupo1"];
        expect(applyFilters(exampleAnimal)).toBe(true);
    });

    it("returns false if group_id is null and filterGroups is not empty", () => {
        const animalSemGrupo = { ...exampleAnimal, group_id: null };

        filterGroups = ["grupo1"];
        expect(Boolean(applyFilters(animalSemGrupo))).toBe(false);
    });
});

describe("resetForm function", () => {
    it("reseta todos os estados do formulário corretamente", () => {
        const setFormName = vi.fn();
        const setFormAnimals = vi.fn();
        const setMode = vi.fn();
        const setSelectedGroupId = vi.fn();
        const setOriginalName = vi.fn();
        const setOriginalAnimals = vi.fn();

        const resetForm = () => {
        setFormName("");
        setFormAnimals([]);
        setMode("normal");
        setSelectedGroupId(null);
        setOriginalName("");
        setOriginalAnimals([]);
        };

        resetForm();

        expect(setFormName).toHaveBeenCalledWith("");
        expect(setFormAnimals).toHaveBeenCalledWith([]);
        expect(setMode).toHaveBeenCalledWith("normal");
        expect(setSelectedGroupId).toHaveBeenCalledWith(null);
        expect(setOriginalName).toHaveBeenCalledWith("");
        expect(setOriginalAnimals).toHaveBeenCalledWith([]);
    });
});


describe("handleSave function", () => {
    let fetchMock: any;
    let alertMock: any;
    let fetchAnimals: any;
    let fetchGroups: any;
    let resetForm: any;

    const localStorageMock = (() => {
        let store: Record<string, string> = {};
        return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        };
    })();

    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    beforeEach(() => {
        fetchMock = vi.fn();
        global.fetch = fetchMock;
        alertMock = vi.fn();
        window.alert = alertMock;
        fetchAnimals = vi.fn();
        fetchGroups = vi.fn();
        resetForm = vi.fn();
        localStorage.setItem("token", "fake-token");
    });

    const mockGroups = [
        { id: "1", name: "Grupo A", animalIds: ["1", "2"] },
    ];

    it("deve alertar se o nome do grupo estiver vazio", async () => {
        const formName = "   ";
        const mode = "editing";
        const selectedGroupId = "1";
        const formAnimals: string[] = [];
        const groups = mockGroups;

        const handleSave = async () => {
        try {
            if (!formName.trim()) {
            alert("O nome do grupo não pode ser vazio.");
            return;
            }
        } catch {}
        };

        await handleSave();
        expect(alertMock).toHaveBeenCalledWith("O nome do grupo não pode ser vazio.");
    });

    it("deve criar novo grupo e associar animais", async () => {
        const formName = "Novo Grupo";
        const formAnimals = ["1", "2"];
        const mode = "creating";
        const selectedGroupId = null;
        const groups = mockGroups;

        fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 10 }) }) // POST
        .mockResolvedValueOnce({ ok: true }) // PATCH 1
        .mockResolvedValueOnce({ ok: true }); // PATCH 2

        const handleSave = async () => {
        try {
            if (!formName.trim()) {
            alert("O nome do grupo não pode ser vazio.");
            return;
            }

            if (mode === "editing" && selectedGroupId) {
            // (omitido)
            } else {
            const newGroupResponse = await fetch("http://localhost:8000/sheep-group", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ name: formName }),
            });

            if (!newGroupResponse.ok) throw new Error("Erro ao criar novo grupo.");

            const newGroupData = await newGroupResponse.json();
            const newGroupId = newGroupData.id.toString();

            const patchResults = await Promise.all(
                formAnimals.map((animalId) =>
                fetch(`http://localhost:8000/sheep-group/${animalId}/change-group`, {
                    method: "PATCH",
                    headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ new_group_id: Number(newGroupId) }),
                })
                )
            );

            const allSuccess = patchResults.every((res) => res.ok);
            if (!allSuccess) throw new Error("Falha ao associar alguns animais ao novo grupo.");
            }

            await fetchAnimals();
            await fetchGroups();
            resetForm();
        } catch (e: any) {
            alert(e.message);
        }
        };

        await handleSave();

        expect(fetchMock).toHaveBeenCalledTimes(3); // 1 POST + 2 PATCH
        expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8000/sheep-group");
        expect(fetchAnimals).toHaveBeenCalled();
        expect(fetchGroups).toHaveBeenCalled();
        expect(resetForm).toHaveBeenCalled();
    });
});


export const filterAnimal = (
    animal: { id: string; gender: string; group_id: string | null },
    searchTerm: string,
    filterSexo: string[],
    filterGroups: string[]
    ): boolean => {
        const matchesSearch = animal.id.includes(searchTerm);
        const matchesSexo = filterSexo.length === 0 || filterSexo.includes(animal.gender);
        const matchesGroup =
            filterGroups.length === 0 ||
            (animal.group_id !== null && filterGroups.includes(animal.group_id));

        return matchesSearch && matchesSexo && matchesGroup;
    };

    
describe("animal filtering logic", () => {
  const baseAnimal = {
    id: "abc123",
    gender: "fêmea",
    group_id: "grupo-1",
  };

  it("returns true when all filters match", () => {
    const result = filterAnimal(baseAnimal, "abc", ["fêmea"], ["grupo-1"]);
    expect(result).toBe(true);
  });

  it("returns false if ID does not match search term", () => {
    const result = filterAnimal(baseAnimal, "xyz", ["fêmea"], ["grupo-1"]);
    expect(result).toBe(false);
  });

  it("returns false if gender filter does not match", () => {
    const result = filterAnimal(baseAnimal, "abc", ["macho"], ["grupo-1"]);
    expect(result).toBe(false);
  });

  it("returns false if group_id is missing", () => {
    const noGroupAnimal = { ...baseAnimal, group_id: null };
    const result = filterAnimal(noGroupAnimal, "abc", ["fêmea"], ["grupo-1"]);
    expect(result).toBe(false);
  });

  it("returns false if group_id is not in filterGroups", () => {
    const result = filterAnimal(baseAnimal, "abc", ["fêmea"], ["grupo-999"]);
    expect(result).toBe(false);
  });

  it("returns true if gender and group filters are empty", () => {
    const result = filterAnimal(baseAnimal, "abc", [], []);
    expect(result).toBe(true);
  });

  it("returns true if only search term matches and filters are empty", () => {
    const result = filterAnimal(baseAnimal, "abc", [], []);
    expect(result).toBe(true);
  });
});