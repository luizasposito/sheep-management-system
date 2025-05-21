import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import { RoleOnly } from "../../components/RoleOnly";
import Select from "react-select";
import styles from "./Animals.module.css";

type Animal = {
  id: string;
  producaoLeiteira: string;
  gender: string;
  group_id?: string;
};

type Group = {
  id: string;
  name: string;
  animalIds: string[];
};

export const Animals: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [animalData, setAnimalData] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSexo, setFilterSexo] = useState<string[]>([]);
  const [filterGroups, setFilterGroups] = useState<string[]>([]);

  const [mode, setMode] = useState<"normal" | "creating" | "editing" | "selecting-del" | "selecting-edit" | "deletingConfirm">("normal");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formAnimals, setFormAnimals] = useState<string[]>([]);
  const [originalName, setOriginalName] = useState("");
  const [originalAnimals, setOriginalAnimals] = useState<string[]>([]);

  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [formVolume, setFormVolume] = useState<string>("");
  const [existingVolume, setExistingVolume] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<"update" | "edit" | null>(null);


  const uniqueGenders = useMemo(() => {
    const gendersSet = new Set<string>();
    animalData.forEach(animal => {
      if (animal.gender) {
        gendersSet.add(animal.gender);
      }
    });
    return Array.from(gendersSet);
  }, [animalData]);

  const fetchTodayMilkProduction = async (sheepId: string) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    try {
      const res = await fetch(`http://localhost:8000/milk-production/by-sheep-date?sheep_id=${sheepId}&date=${formattedDate}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        return data.volume;
      } else {
        return null;
      }
    } catch (err) {
      console.error("Erro ao buscar produção de hoje:", err);
      return null;
    }
  };

  const submitMilkProduction = async (sheepId: string, volume: number) => {
    const today = new Date().toISOString().split("T")[0];
    const payload = {
      date: today,
      volume
    };

    try {
      const res = await fetch(`http://localhost:8000/sheep/${sheepId}/milk-yield`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchAnimals(); // Recarrega os dados
        resetFormStates();
      } else {
        alert("Erro ao atualizar produção.");
      }
    } catch (err) {
      console.error("Erro ao enviar produção:", err);
    }
  };

  const resetFormStates = () => {
    setActiveFormId(null);
    setFormVolume("");
    setExistingVolume(null);
    setFormMode(null);
  };



  useEffect(() => {
    document.title = "Animais";
  }, []);

  useEffect(() => {
    if (!user || !user.role) return;
    if (!(user.role === "farmer" || user.role === "veterinarian")) navigate("/unauthorized");
  }, [user]);


  const fetchAnimals = async () => {
    try {
      const response = await fetch("http://localhost:8000/sheep/", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar animais");

      const data = await response.json();

      const formattedData = data.map((item: any) => ({
        id: item.id.toString(),
        producaoLeiteira: item.producaoLeiteira || "N/A",
        gender: item.gender,
        status: item.status,
        group_id: item.group_id?.toString() || null,
      }));

      setAnimalData(formattedData);
    } catch (error) {
      console.error("Erro ao buscar animais:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const [groupsRes, animalsRes] = await Promise.all([
        fetch("http://localhost:8000/sheep-group", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch("http://localhost:8000/sheep/", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      if (!groupsRes.ok || !animalsRes.ok) {
        throw new Error("Erro ao buscar grupos ou animais");
      }

      const groupsData = await groupsRes.json();
      const animalsData = await animalsRes.json();

      animalsData.forEach((animal: any) => {
        console.log(`Animal ID: ${animal.id}, Group ID: ${animal.group_id}`);
      });


      console.log("Grupos recebidos:", groupsData);
      console.log("Animais recebidos:", animalsData);

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

  useEffect(() => {
    fetchAnimals();
    fetchGroups();
  }, []);



  // Criar um mapa de group_id -> nome do grupo
  const groupIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    groups.forEach(group => {
      map[group.id] = group.name;
    });
    return map;
  }, [groups]);


  const animalOptions = animalData.map(animal => ({
    value: animal.id,
    label: `${animal.id} - ${animal.gender}`,
  }));

  const toggleFilter = (
    value: string,
    current: string[],
    setFilter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setFilter(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const applyFilters = (animal: Animal) => {
    const matchesSearch =
      animal.id.includes(searchTerm);
      
    const matchesSexo = filterSexo.length === 0 || filterSexo.includes(animal.gender);
    const matchesGroup = filterGroups.length === 0 || (animal.group_id && filterGroups.includes(animal.group_id));

    return matchesSearch && matchesSexo && matchesGroup;
  };


  const filteredAnimals = animalData.filter(applyFilters);

  const resetForm = () => {
    setFormName("");
    setFormAnimals([]);
    setMode("normal");
    setSelectedGroupId(null);
    setOriginalName("");
    setOriginalAnimals([]);
  };

  const handleSave = async () => {
    try {
      if (!formName.trim()) {
        alert("O nome do grupo não pode ser vazio.");
        return;
      }

      if (mode === "editing" && selectedGroupId) {
        const updateGroupResponse = await fetch(`http://localhost:8000/sheep-group/${selectedGroupId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: formName,
            animal_ids: formAnimals,
          }),
        });

        if (!updateGroupResponse.ok) {
          throw new Error("Erro ao editar o grupo.");
        }

        const originalGroup = groups.find((g) => g.id === selectedGroupId);
        const originalAnimalIds = originalGroup?.animalIds || [];

        const removedAnimals = originalAnimalIds.filter(id => !formAnimals.includes(id));
        const addedAnimals = formAnimals.filter(id => !originalAnimalIds.includes(id));

        if (removedAnimals.length > 0 || addedAnimals.length > 0) {
          const patchResults = await Promise.all([
            ...removedAnimals.map(animalId =>
              fetch(`http://localhost:8000/sheep-group/${animalId}/change-group`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ new_group_id: null }),
              })
            ),
            ...addedAnimals.map(animalId =>
              fetch(`http://localhost:8000/sheep-group/${animalId}/change-group`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ new_group_id: Number(selectedGroupId) }),
              })
            )
          ]);

          const allSuccess = patchResults.every(res => res.ok);
          if (!allSuccess) {
            throw new Error("Falha ao mover alguns animais.");
          }
        }
      } else {
        // Criar novo grupo
        const newGroupResponse = await fetch("http://localhost:8000/sheep-group", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: formName,
            animal_ids: formAnimals,
          }),
        });

        if (!newGroupResponse.ok) {
          throw new Error("Erro ao criar novo grupo.");
        }
      }

      // Após salvar, refazer o fetch dos grupos e animais para sincronizar os dados
      await fetchAnimals();
      await fetchGroups();

      resetForm();

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro inesperado.");
    }
  };


  const handleEditSelect = () => {
    const group = groups.find(g => g.id === selectedGroupId);
    if (group) {
      setFormName(group.name);
      setFormAnimals(group.animalIds);
      setOriginalName(group.name);
      setOriginalAnimals(group.animalIds);
      setMode("editing");
    }
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Animais</h1>

      <div className={styles.buttonGroup}>
        <RoleOnly role="farmer">
          <Button variant="light" onClick={() => navigate("/animal/add")}>Criar</Button>
        </RoleOnly>
      </div>

      <div className={styles.searchBar}>
        <SearchInput
          placeholder="Pesquisar pelo ID do animal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.content}>
        <aside className={styles.filters}>
          <h3>Filtrar por</h3>

          <div className={styles.filterGroup}>
            <strong>Sexo</strong>
            {uniqueGenders.map(gender => (
              <label key={gender}>
                <input
                  type="checkbox"
                  checked={filterSexo.includes(gender)}
                  onChange={() => toggleFilter(gender, filterSexo, setFilterSexo)}
                />
                <span>{gender}</span>
              </label>
            ))}

          </div>

          <div className={styles.filterGroup}>
            <strong>Grupos</strong>
            {groups.map(group => (
              <label key={group.id}>
                <input
                  type="checkbox"
                  checked={filterGroups.includes(group.id)}
                  onChange={() => toggleFilter(group.id, filterGroups, setFilterGroups)}
                />
                <span>{group.name}</span>
              </label>
            ))}
          </div>
        </aside>

        <section className={styles.cards}>
          {(loading || loadingGroups) ? (
            <p>Carregando animais e grupos...</p>
          ) : (
            filteredAnimals.map(animal => (
              <div key={animal.id} className={styles.animalCardWrapper}>
                <Card
                  className={styles.clickableCard}
                  onClick={() => navigate(`/animal/${animal.id}`)}
                >
                  <div className={styles.cardContent}>
                    <p><strong>ID:</strong> {animal.id}</p>

                    {/* Exibir "produção leiteira" somente se animal não for macho */}
                    {animal.gender !== "Macho" && (
                      <p><strong>produção leiteira:</strong> {animal.producaoLeiteira}</p>
                    )}

                    <p><strong>sexo:</strong> {animal.gender}</p>
                    <p><strong>grupo:</strong> {animal.group_id && groupIdToName[animal.group_id] ? groupIdToName[animal.group_id] : "Sem grupo"}</p>
                  </div>
                </Card>

                {/* Se for macho, não mostrar botões */}
                {animal.gender !== "Macho" && (
                  activeFormId === animal.id ? (
                    <div className={styles.buttonContainer}>
                      <input
                        type="number"
                        value={formVolume}
                        onChange={(e) => setFormVolume(e.target.value)}
                        placeholder="Volume (L)"
                      />
                      <div className={styles.buttonRow}>
                        <Button variant="light" onClick={resetFormStates}>Cancelar</Button>
                        <Button
                          onClick={() => submitMilkProduction(animal.id, parseFloat(formVolume))}
                          disabled={
                            formMode === "update"
                              ? formVolume.trim() === ""
                              : formVolume.trim() === existingVolume?.toString()
                          }
                        >
                          {formMode === "edit" ? "Editar" : "Atualizar"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.buttonContainer}>
                      <Button
                        onClick={() => {
                          setActiveFormId(animal.id);
                          setFormVolume("");
                          setExistingVolume(null);
                          setFormMode("update");
                        }}
                      >
                        Atualizar produção
                      </Button>
                      <Button
                        onClick={async () => {
                          const vol = await fetchTodayMilkProduction(animal.id);
                          if (vol !== null) {
                            setActiveFormId(animal.id);
                            setFormVolume(vol.toString());
                            setExistingVolume(vol);
                            setFormMode("edit");
                          } else {
                            alert("Nenhum registro encontrado para hoje.");
                          }
                        }}
                      >
                        Editar produção
                      </Button>
                    </div>
                  )
                )}
              </div>
            ))

          )}
        </section>

        <Card className={styles.groupCard}>
          <h2>Lista de Grupos</h2>

          {mode === "normal" && (
            <>
              {groups.length === 0 ? (
                <p>Nenhum grupo cadastrado.</p>
              ) : (
                groups.map((group) => (
                  <p key={group.id}>
                    <strong>{group.name}</strong> ({group.animalIds.length} animais)
                  </p>
                ))
              )}

              <div className={styles.buttonRow}>
                <Button onClick={() => setMode("creating")}>Criar</Button>
                <Button onClick={() => setMode("selecting-edit")}>
                  Editar
                </Button>
                <Button onClick={() => setMode("selecting-del")}>Apagar</Button>
              </div>
            </>
          )}

          {(mode === "creating" || mode === "editing") && (
            <div className={styles.formGroup}>
              <div className={styles.formField}>
                <label htmlFor="group-name">Nome do grupo</label>
                <input
                  id="group-name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className={styles.formField}>
                <label>Selecionar animais</label>
                <Select
                  options={animalOptions}
                  isMulti
                  value={animalOptions.filter((opt) => formAnimals.includes(opt.value))}
                  onChange={(selectedOptions) =>
                    setFormAnimals(selectedOptions.map((opt) => opt.value))
                  }
                />
              </div>

              <div className={styles.buttonRow}>
                <Button
                  onClick={handleSave}
                  disabled={
                    mode === "editing" &&
                    formName === originalName &&
                    JSON.stringify([...formAnimals].sort()) ===
                      JSON.stringify([...originalAnimals].sort())
                  }
                >
                  Salvar
                </Button>
                <Button variant="light" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {mode === "selecting-edit" && (
            <>
              <div className={styles.radioList}>
                {groups.map((group) => (
                  <label key={group.id} className={styles.radioItem}>
                    <input
                      type="radio"
                      name="group"
                      value={group.id}
                      onChange={() => setSelectedGroupId(group.id)}
                    />
                    <span>{group.name} ({group.animalIds.length} animais)</span>
                  </label>
                ))}
              </div>

              <div className={styles.buttonRow}>
                <Button variant="light" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleEditSelect} disabled={!selectedGroupId}>
                  Editar
                </Button>
              </div>
            </>
          )}
          {mode === "selecting-del" && (
            <>
              <ul>
                {groups.map(group => (
                  <li key={group.id}>
                    <input
                      type="radio"
                      name="selectedGroup"
                      value={group.id}
                      onChange={() => setSelectedGroupId(group.id)}
                    />
                    {group.name} ({group.animalIds.length} animais)
                  </li>
                ))}
              </ul>
              <Button onClick={resetForm}>Cancelar</Button>
              <Button
                onClick={() => setMode("deletingConfirm")}
                disabled={!selectedGroupId}
              >
                Apagar
              </Button>
            </>
          )}
        </Card>
        
      </div>
    </PageLayout>
  );
};
