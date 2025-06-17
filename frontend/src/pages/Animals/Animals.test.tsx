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


describe("submitMilkProduction", () => {
  let setLoading: jest.Mock;
  let setAnimalData: jest.Mock;
  let resetFormStates: jest.Mock;

  beforeEach(() => {
    setLoading = vi.fn();
    setAnimalData = vi.fn();
    resetFormStates = vi.fn();

    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("alert", vi.fn());
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "fake-token"),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Uma função auxiliar simulando seu submitMilkProduction dentro do teste,
  // só para chamar ela com as funções mockadas
  const submitMilkProduction = async (sheepId: string, volume: number) => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const payload = { date: today, volume };

    try {
      const res = await fetch(
        `http://localhost:8000/sheep/${sheepId}/milk-yield`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setAnimalData((prevAnimals: any[]) =>
          prevAnimals.map((animal) =>
            animal.id === sheepId
              ? { ...animal, producaoLeiteira: volume.toString() }
              : animal
          )
        );

        resetFormStates();
      } else {
        alert("Erro ao atualizar produção.");
      }
    } catch (err) {
      console.error("Erro ao enviar produção:", err);
    } finally {
      setLoading(false);
    }
  };

  it("calls fetch with correct URL and payload, updates state and resets form on success", async () => {
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({ ok: true });

    const prevAnimals = [{ id: "sheep1", producaoLeiteira: "10" }, { id: "sheep2", producaoLeiteira: "5" }];
    setAnimalData.mockImplementation((cb) => {
      // cb is function(prevAnimals)
      const result = cb(prevAnimals);
      expect(result).toEqual([
        { id: "sheep1", producaoLeiteira: "15" },
        { id: "sheep2", producaoLeiteira: "5" },
      ]);
    });

    await submitMilkProduction("sheep1", 15);

    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/sheep/sheep1/milk-yield",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
          "Content-Type": "application/json",
        }),
        body: expect.any(String),
      })
    );

    // Verifica body enviado
    const calledBody = JSON.parse((fetch as vi.Mock).mock.calls[0][1].body);
    expect(calledBody).toEqual({
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      volume: 15,
    });

    expect(resetFormStates).toHaveBeenCalled();
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it("alerts error if response is not ok", async () => {
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({ ok: false });

    await submitMilkProduction("sheep1", 10);

    expect(window.alert).toHaveBeenCalledWith("Erro ao atualizar produção.");
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenLastCalledWith(false);
    expect(resetFormStates).not.toHaveBeenCalled();
    expect(setAnimalData).not.toHaveBeenCalled();
  });

  it("logs error if fetch throws", async () => {
    const error = new Error("Network failure");
    (fetch as unknown as vi.Mock).mockRejectedValueOnce(error);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await submitMilkProduction("sheep1", 10);

    expect(consoleSpy).toHaveBeenCalledWith("Erro ao enviar produção:", error);
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenLastCalledWith(false);
    expect(resetFormStates).not.toHaveBeenCalled();
    expect(setAnimalData).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});


describe("handleConfirmDelete", () => {
  let fetchMock: any;
  let alertMock: any;
  let setGroups: vi.Mock;
  let setLoadingGroups: vi.Mock;
  let setAnimalData: vi.Mock;
  let setTodayMilkProductionMap: vi.Mock;
  let setLoading: vi.Mock;
  let setSelectedGroupId: vi.Mock;
  let setDeleteConfirmVisible: vi.Mock;
  let setMode: vi.Mock;

  const fetchGroups = vi.fn();
  const fetchAnimals = vi.fn();

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    alertMock = vi.fn();
    window.alert = alertMock;

    setGroups = vi.fn();
    setLoadingGroups = vi.fn();
    setAnimalData = vi.fn();
    setTodayMilkProductionMap = vi.fn();
    setLoading = vi.fn();
    setSelectedGroupId = vi.fn();
    setDeleteConfirmVisible = vi.fn();
    setMode = vi.fn();

    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "fake-token"),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const handleConfirmDelete = async (selectedGroupId: string | null) => {
    if (!selectedGroupId) return;

    try {
      const res = await fetch(`http://localhost:8000/sheep-group/${selectedGroupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao apagar grupo.");

      await fetchGroups(setGroups, setLoadingGroups);
      await fetchAnimals(setAnimalData, setTodayMilkProductionMap, setLoading);

      setSelectedGroupId(null);
      setDeleteConfirmVisible(false);
      setMode("normal");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro inesperado ao apagar grupo.");
    }
  };

  it("não faz nada se selectedGroupId for null", async () => {
    await handleConfirmDelete(null);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("deleta o grupo e atualiza os estados corretamente", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true });
    fetchGroups.mockResolvedValueOnce(undefined);
    fetchAnimals.mockResolvedValueOnce(undefined);

    await handleConfirmDelete("1");

    expect(fetch).toHaveBeenCalledWith("http://localhost:8000/sheep-group/1", expect.anything());
    expect(fetchGroups).toHaveBeenCalledWith(setGroups, setLoadingGroups);
    expect(fetchAnimals).toHaveBeenCalledWith(setAnimalData, setTodayMilkProductionMap, setLoading);
    expect(setSelectedGroupId).toHaveBeenCalledWith(null);
    expect(setDeleteConfirmVisible).toHaveBeenCalledWith(false);
    expect(setMode).toHaveBeenCalledWith("normal");
  });

  it("mostra alerta em caso de erro no fetch", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });

    await handleConfirmDelete("2");

    expect(alertMock).toHaveBeenCalledWith("Erro ao apagar grupo.");
  });

  it("mostra alerta com mensagem genérica se erro inesperado ocorrer", async () => {
    fetchMock.mockRejectedValueOnce("Erro desconhecido");

    await handleConfirmDelete("3");

    expect(alertMock).toHaveBeenCalledWith("Erro inesperado ao apagar grupo.");
  });
});
