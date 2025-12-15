export type Animal = {
  id: string;
  producaoLeiteira: string;
  gender: string;
  group_id?: string;
};

export type Group = {
  id: string;
  name: string;
  animalIds: string[];
};

export type MilkProductionResponse = {
  date: string;
  volume: number;
};

export const fetchTodayMilkProduction = async (
  sheepId: string
): Promise<number | null> => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const res = await fetch(
      `http://localhost:8000/sheep/${sheepId}/milk-yield?date=${todayStr}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) return null;

    const data: MilkProductionResponse[] = await res.json();
    return data.length > 0 ? data[0].volume : null;
  } catch (err) {
    console.error("Erro ao buscar produção de leite:", err);
    return null;
  }
};

export const submitMilkProduction = async (
  sheepId: string,
  volume: number,
  setAnimalData: React.Dispatch<React.SetStateAction<Animal[]>>,
  resetFormStates: () => void,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setTodayMilkProductionMap: React.Dispatch<React.SetStateAction<Record<string, number | null>>>
) => {
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
      setAnimalData((prevAnimals) =>
        prevAnimals.map((animal) =>
          animal.id === sheepId
            ? { ...animal, producaoLeiteira: volume.toString() }
            : animal
        )
      );

      setTodayMilkProductionMap((prevMap) => ({
        ...prevMap,
        [sheepId]: volume,
      }));

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


export const fetchAnimals = async (
  setAnimalData: React.Dispatch<React.SetStateAction<Animal[]>>,
  setTodayMilkProductionMap: React.Dispatch<
    React.SetStateAction<Record<string, number | null>>
  >,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    const response = await fetch(
      `http://localhost:8000/sheep/?_=${Date.now()}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) throw new Error("Erro ao buscar animais");

    const data = await response.json();
    const formattedData: Animal[] = data
      .map((item: any) => ({
        id: item.id.toString(),
        producaoLeiteira: item.milk_production?.toString() || "-",
        gender: item.gender,
        group_id: item.group_id?.toString() || undefined,
      }))
       .sort((a: Animal, b: Animal) => Number(a.id) - Number(b.id));  // Ordena por ID numérico


    setAnimalData(formattedData);

    const productions = await Promise.all(
      formattedData.map((animal) => fetchTodayMilkProduction(animal.id))
    );

    const map: Record<string, number | null> = {};
    formattedData.forEach((animal, idx) => {
      map[animal.id] = productions[idx];
    });

    setTodayMilkProductionMap(map);
  } catch (error) {
    console.error("Erro ao buscar animais:", error);
  } finally {
    setLoading(false);
  }
};

export const fetchGroups = async (
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
  setLoadingGroups: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    const [groupsRes, animalsRes] = await Promise.all([
      fetch("http://localhost:8000/sheep-group", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
      fetch("http://localhost:8000/sheep/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
    ]);

    if (!groupsRes.ok || !animalsRes.ok) {
      throw new Error("Erro ao buscar grupos ou animais");
    }

    const groupsData = await groupsRes.json();
    const animalsData = await animalsRes.json();

    const groupToAnimalsMap: Record<string, string[]> = {};
    animalsData.forEach((sheep: any) => {
      const groupId = sheep.group_id?.toString();
      if (groupId) {
        if (!groupToAnimalsMap[groupId]) groupToAnimalsMap[groupId] = [];
        groupToAnimalsMap[groupId].push(sheep.id.toString());
      }
    });

    const formattedGroups = groupsData.map((group: any) => ({
      id: group.id.toString(),
      name: group.name,
      animalIds: groupToAnimalsMap[group.id.toString()] || [],
    }));

    setGroups(formattedGroups);
  } catch (error) {
    console.error("Erro ao buscar grupos:", error);
  } finally {
    setLoadingGroups(false);
  }
};