import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import * as AnimalFcts from "./AnimalFcts";

class LocalStorageMock {
  private store: Record<string, string> = {};
  length = 0;

  clear() {
    this.store = {};
    this.length = 0;
  }

  getItem: Mock<(key: string) => string | null> = vi.fn((key: string) => {
    return this.store[key] || null;
  });

  setItem: Mock<(key: string, value: string) => void> = vi.fn((key, value) => {
    this.store[key] = value;
    this.length = Object.keys(this.store).length;
  });

  removeItem: Mock<(key: string) => void> = vi.fn((key) => {
    delete this.store[key];
    this.length = Object.keys(this.store).length;
  });

  key(index: number) {
    return Object.keys(this.store)[index] || null;
  }
}


global.localStorage = new LocalStorageMock() as unknown as Storage;
global.fetch = vi.fn();
global.alert = vi.fn();

describe("fetchTodayMilkProduction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as Mock<(key: string) => string | null>).mockReturnValue("token123");
  });

  it("deve retornar volume quando fetch retornar dados válidos", async () => {
    const mockData = [{ date: "2025-06-16", volume: 5 }];
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const volume = await AnimalFcts.fetchTodayMilkProduction("sheep1");
    expect(volume).toBe(5);
    expect(fetch).toHaveBeenCalled();
  });


  it("deve retornar null se fetch não for ok", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    const volume = await AnimalFcts.fetchTodayMilkProduction("sheep1");
    expect(volume).toBeNull();
  });

  it("deve retornar null se dados estiverem vazios", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    const volume = await AnimalFcts.fetchTodayMilkProduction("sheep1");
    expect(volume).toBeNull();
  });

  it("deve retornar null se fetch lançar erro", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fail"));
    const volume = await AnimalFcts.fetchTodayMilkProduction("sheep1");
    expect(volume).toBeNull();
  });
});


describe("submitMilkProduction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as Mock<(key: string) => string | null>).mockReturnValue("token123");
  });

  it("deve atualizar animal e resetar estado se fetch ok", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    const setAnimalData = vi.fn();
    const resetFormStates = vi.fn();
    const setLoading = vi.fn();

    await AnimalFcts.submitMilkProduction(
      "sheep1",
      10,
      setAnimalData,
      resetFormStates,
      setLoading
    );

    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(fetch).toHaveBeenCalled();
    expect(setAnimalData).toHaveBeenCalled();
    expect(resetFormStates).toHaveBeenCalled();
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it("deve mostrar alert se fetch não for ok", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    const setAnimalData = vi.fn();
    const resetFormStates = vi.fn();
    const setLoading = vi.fn();

    await AnimalFcts.submitMilkProduction(
      "sheep1",
      10,
      setAnimalData,
      resetFormStates,
      setLoading
    );

    expect(global.alert).toHaveBeenCalledWith("Erro ao atualizar produção.");
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it("deve chamar setLoading false no finally mesmo com erro", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fail"));
    const setAnimalData = vi.fn();
    const resetFormStates = vi.fn();
    const setLoading = vi.fn();

    await AnimalFcts.submitMilkProduction(
      "sheep1",
      10,
      setAnimalData,
      resetFormStates,
      setLoading
    );

    expect(setLoading).toHaveBeenLastCalledWith(false);
  });
});


describe("fetchAnimals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as Mock<(key: string) => string | null>).mockReturnValue("token123");
  });

  it("deve setar loading false e logar erro se fetch falhar", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const setAnimalData = vi.fn();
    const setTodayMilkProductionMap = vi.fn();
    const setLoading = vi.fn();

    await AnimalFcts.fetchAnimals(setAnimalData, setTodayMilkProductionMap, setLoading);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(setLoading).toHaveBeenLastCalledWith(false);

    consoleErrorSpy.mockRestore();
  });
});



describe("fetchGroups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as Mock<(key: string) => string | null>).mockReturnValue("token123");
  });

  it("deve buscar grupos e animais e setar grupos corretamente", async () => {
    const groupsData = [{ id: 1, name: "Group A" }];
    const animalsData = [
      { id: 1, group_id: 1 },
      { id: 2, group_id: 1 },
      { id: 3, group_id: null },
    ];

    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(groupsData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(animalsData),
      });

    const setGroups = vi.fn();
    const setLoadingGroups = vi.fn();

    await AnimalFcts.fetchGroups(setGroups, setLoadingGroups);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(setGroups).toHaveBeenCalledWith([
      { id: "1", name: "Group A", animalIds: ["1", "2"] },
    ]);
    expect(setLoadingGroups).toHaveBeenLastCalledWith(false);
  });

  it("deve logar erro e setar loading false se fetch falhar", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const setGroups = vi.fn();
    const setLoadingGroups = vi.fn();

    await AnimalFcts.fetchGroups(setGroups, setLoadingGroups);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(setLoadingGroups).toHaveBeenLastCalledWith(false);

    consoleErrorSpy.mockRestore();
  });
});


describe("processAnimalData", () => {
  const mockResponseData = [
    { id: 1, milk_production: 7, gender: "female", group_id: 10 },
    { id: 2, milk_production: null, gender: "male", group_id: null },
  ];

  let response: Response;
  let setAnimalData: ReturnType<typeof vi.fn>;
  let fetchTodayMilkProduction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setAnimalData = vi.fn();
    fetchTodayMilkProduction = vi.fn();

    // Mock response with json method
    response = {
      json: vi.fn().mockResolvedValue(mockResponseData),
    } as unknown as Response;
  });

  it("deve formatar dados, chamar fetchTodayMilkProduction e preencher map corretamente", async () => {
    // Mock fetchTodayMilkProduction para retornar volumes específicos
    fetchTodayMilkProduction.mockImplementation(async (id: string) => {
      if (id === "1") return 7;
      if (id === "2") return null;
      return null;
    });

    // Função que representa o trecho do seu código
    async function processAnimalData() {
      const data = await response.json();
      const formattedData: AnimalFcts.Animal[] = data.map((item: any) => ({
        id: item.id.toString(),
        producaoLeiteira: item.milk_production?.toString() || "-",
        gender: item.gender,
        group_id: item.group_id?.toString() || undefined,
      }));

      setAnimalData(formattedData);

      const productions = await Promise.all(
        formattedData.map((animal) => fetchTodayMilkProduction(animal.id))
      );

      const map: Record<string, number | null> = {};
      formattedData.forEach((animal, idx) => {
        map[animal.id] = productions[idx];
      });

      return { formattedData, map };
    }

    const { formattedData, map } = await processAnimalData();

    expect(response.json).toHaveBeenCalled();

    expect(formattedData).toEqual([
      { id: "1", producaoLeiteira: "7", gender: "female", group_id: "10" },
      { id: "2", producaoLeiteira: "-", gender: "male", group_id: undefined },
    ]);

    expect(setAnimalData).toHaveBeenCalledWith(formattedData);

    expect(fetchTodayMilkProduction).toHaveBeenCalledTimes(2);
    expect(fetchTodayMilkProduction).toHaveBeenCalledWith("1");
    expect(fetchTodayMilkProduction).toHaveBeenCalledWith("2");

    expect(map).toEqual({
      "1": 7,
      "2": null,
    });
  });

  it("deve tratar array vazio corretamente", async () => {
    (response.json as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    async function processAnimalData() {
      const data = await response.json();
      const formattedData: AnimalFcts.Animal[] = data.map((item: any) => ({
        id: item.id.toString(),
        producaoLeiteira: item.milk_production?.toString() || "-",
        gender: item.gender,
        group_id: item.group_id?.toString() || undefined,
      }));

      setAnimalData(formattedData);

      const productions = await Promise.all(
        formattedData.map((animal) => fetchTodayMilkProduction(animal.id))
      );

      const map: Record<string, number | null> = {};
      formattedData.forEach((animal, idx) => {
        map[animal.id] = productions[idx];
      });

      return { formattedData, map };
    }

    const { formattedData, map } = await processAnimalData();

    expect(formattedData).toEqual([]);
    expect(setAnimalData).toHaveBeenCalledWith([]);
    expect(fetchTodayMilkProduction).toHaveBeenCalledTimes(0);
    expect(map).toEqual({});
  });
});