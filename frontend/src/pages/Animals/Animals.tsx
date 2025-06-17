import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import { RoleOnly } from "../../components/RoleOnly/RoleOnly";
import Select from "react-select";
import styles from "./Animals.module.css";
import {
  fetchTodayMilkProduction,
  fetchAnimals,
  fetchGroups,
  submitMilkProduction,
} from "./AnimalFcts";


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

type MilkProductionResponse = {
  date: string;
  volume: number;
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

  const [mode, setMode] = useState<
    | "normal"
    | "creating"
    | "editing"
    | "selecting-del"
    | "selecting-edit"
    | "deletingConfirm"
  >("normal");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formAnimals, setFormAnimals] = useState<string[]>([]);
  const [originalName, setOriginalName] = useState("");
  const [originalAnimals, setOriginalAnimals] = useState<string[]>([]);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [formVolume, setFormVolume] = useState<string>("");
  const [existingVolume, setExistingVolume] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<"update" | "edit" | null>(null);
  const [todayMilkProductionMap, setTodayMilkProductionMap] = useState<
    Record<string, number | null>
  >({});

  const uniqueGenders = useMemo(() => {
    const gendersSet = new Set<string>();
    animalData.forEach((animal) => {
      if (animal.gender) {
        gendersSet.add(animal.gender);
      }
    });
    return Array.from(gendersSet);
  }, [animalData]);

  useEffect(() => {
    fetchAnimals(setAnimalData, setTodayMilkProductionMap, setLoading);
    fetchGroups(setGroups, setLoadingGroups);
  }, []);

  const handleConfirmDelete = async () => {
    if (!selectedGroupId) return;

    try {
      const res = await fetch(
        `http://localhost:8000/sheep-group/${selectedGroupId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao apagar grupo.");
      }

      // Atualiza grupos e animais
      await fetchGroups(setGroups, setLoadingGroups);
      await fetchAnimals(setAnimalData, setTodayMilkProductionMap, setLoading);


      setSelectedGroupId(null);
      setDeleteConfirmVisible(false);
      setMode("normal");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao apagar grupo."
      );
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
    if (!(user.role === "farmer" || user.role === "veterinarian"))
      navigate("/unauthorized");
  }, [user]);

  // Criar um mapa de group_id -> nome do grupo
  const groupIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    groups.forEach((group) => {
      map[group.id] = group.name;
    });
    return map;
  }, [groups]);

  const animalOptions = animalData.map((animal) => ({
    value: animal.id,
    label: `${animal.id} - ${animal.gender}`,
  }));

  const toggleFilter = (
    value: string,
    current: string[],
    setFilter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setFilter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const applyFilters = (animal: Animal) => {
    const matchesSearch = animal.id.includes(searchTerm);

    const matchesSexo =
      filterSexo.length === 0 || filterSexo.includes(animal.gender);
    const matchesGroup =
      filterGroups.length === 0 ||
      (animal.group_id && filterGroups.includes(animal.group_id));

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
        const updateGroupResponse = await fetch(
          `http://localhost:8000/sheep-group/${selectedGroupId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              name: formName,
              animal_ids: formAnimals,
            }),
          }
        );

        if (!updateGroupResponse.ok) {
          throw new Error("Erro ao editar o grupo.");
        }

        const originalGroup = groups.find((g) => g.id === selectedGroupId);
        const originalAnimalIds = originalGroup?.animalIds || [];

        const removedAnimals = originalAnimalIds.filter(
          (id) => !formAnimals.includes(id)
        );
        const addedAnimals = formAnimals.filter(
          (id) => !originalAnimalIds.includes(id)
        );

        if (removedAnimals.length > 0 || addedAnimals.length > 0) {
          const patchResults = await Promise.all([
            ...removedAnimals.map((animalId) =>
              fetch(
                `http://localhost:8000/sheep-group/${animalId}/change-group`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                  body: JSON.stringify({ new_group_id: null }),
                }
              )
            ),
            ...addedAnimals.map((animalId) =>
              fetch(
                `http://localhost:8000/sheep-group/${animalId}/change-group`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                  body: JSON.stringify({
                    new_group_id: Number(selectedGroupId),
                  }),
                }
              )
            ),
          ]);

          const allSuccess = patchResults.every((res) => res.ok);
          if (!allSuccess) {
            throw new Error("Falha ao mover alguns animais.");
          }
        }
      } else {
        // Cria o grupo e pega o id do grupo criado
        const newGroupResponse = await fetch(
          "http://localhost:8000/sheep-group",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              name: formName,
              // Pode enviar animal_ids, mas o backend provavelmente não associa direto
              // animal_ids: formAnimals,
            }),
          }
        );

        if (!newGroupResponse.ok) {
          throw new Error("Erro ao criar novo grupo.");
        }

        const newGroupData = await newGroupResponse.json();
        const newGroupId = newGroupData.id.toString();

        // Associa os animais ao grupo criado
        const patchResults = await Promise.all(
          formAnimals.map((animalId) =>
            fetch(
              `http://localhost:8000/sheep-group/${animalId}/change-group`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ new_group_id: Number(newGroupId) }),
              }
            )
          )
        );

        const allSuccess = patchResults.every((res) => res.ok);
        if (!allSuccess) {
          throw new Error("Falha ao associar alguns animais ao novo grupo.");
        }
      }

      // Após salvar, refazer o fetch dos grupos e animais para sincronizar os dados
      await fetchGroups(setGroups, setLoadingGroups);
      await fetchAnimals(setAnimalData, setTodayMilkProductionMap, setLoading);


      resetForm();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro inesperado.");
    }
  };

  const handleEditSelect = () => {
    const group = groups.find((g) => g.id === selectedGroupId);
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
          <Button variant="light" onClick={() => navigate("/animal/add")}>
            Adicionar animal
          </Button>
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
            {uniqueGenders.map((gender) => (
              <label key={gender}>
                <input
                  type="checkbox"
                  checked={filterSexo.includes(gender)}
                  onChange={() =>
                    toggleFilter(gender, filterSexo, setFilterSexo)
                  }
                />
                <span>{gender}</span>
              </label>
            ))}
          </div>

          <RoleOnly role="farmer">
            <div className={styles.filterGroup}>
              <strong>Grupos</strong>
              {groups.map((group) => (
                <label key={group.id}>
                  <input
                    type="checkbox"
                    checked={filterGroups.includes(group.id)}
                    onChange={() =>
                      toggleFilter(group.id, filterGroups, setFilterGroups)
                    }
                  />
                  <span>{group.name}</span>
                </label>
              ))}
            </div>
          </RoleOnly>
        </aside>

        <div className={styles.animalCardsWrapper}>
          <section className={styles.cards}>
            {loading || loadingGroups ? (
              <p>Carregando animais e grupos...</p>
            ) : (
              filteredAnimals.map((animal) => (
                <div key={animal.id} className={styles.animalCardWrapper}>
                  <Card
                    key={`${animal.id}-${animal.producaoLeiteira}`}
                    className={styles.clickableCard}
                    onClick={() => navigate(`/animal/${animal.id}`)}
                  >
                    <div className={styles.cardContent}>
                      <p>
                        <strong>ID:</strong> {animal.id}
                      </p>

                      {animal.gender !== "Macho" && (
                        <p>
                          <strong>produção leiteira:</strong>{" "}
                          {animal.producaoLeiteira} L
                        </p>
                      )}

                      <p>
                        <strong>sexo:</strong> {animal.gender}
                      </p>
                      <p>
                        <strong>grupo:</strong>{" "}
                        {animal.group_id && groupIdToName[animal.group_id]
                          ? groupIdToName[animal.group_id]
                          : "Sem grupo"}
                      </p>
                    </div>
                  </Card>

                  {animal.gender !== "Macho" &&
                    (activeFormId === animal.id ? (
                      <div className={styles.buttonContainer}>
                        <input
                          type="number"
                          value={formVolume}
                          onChange={(e) => setFormVolume(e.target.value)}
                          placeholder="Volume (L)"
                        />
                        <div className={styles.buttonRow}>
                          <Button variant="light" onClick={resetFormStates}>
                            Cancelar
                          </Button>
                          <Button
                            onClick={() =>
                              submitMilkProduction(
                                animal.id,
                                Number(formVolume),
                                setAnimalData,
                                resetFormStates,
                                setLoading
                              )
                            }
                            disabled={
                              formMode === "update"
                                ? formVolume.trim() === ""
                                : formVolume.trim() ===
                                  existingVolume?.toString()
                            }
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.buttonContainer}>
                        <RoleOnly role="farmer">
                          <Button
                            onClick={() => {
                              setActiveFormId(animal.id);
                              setFormVolume("");
                              setExistingVolume(null);
                              setFormMode("update");
                            }}
                            disabled={todayMilkProductionMap[animal.id] != null}
                          >
                            Adicionar produção de hoje
                          </Button>
                        </RoleOnly>

                        <RoleOnly role="farmer">
                          <Button
                            onClick={async () => {
                              const vol = await fetchTodayMilkProduction(
                                animal.id
                              );
                              if (vol !== null) {
                                setActiveFormId(animal.id);
                                setFormVolume(vol.toString());
                                setExistingVolume(vol);
                                setFormMode("edit");
                              } else {
                                alert("Nenhum registro encontrado para hoje.");
                              }
                            }}
                            disabled={todayMilkProductionMap[animal.id] == null}
                          >
                            Editar produção de hoje
                          </Button>
                        </RoleOnly>
                      </div>
                    ))}
                </div>
              ))
            )}
          </section>
        </div>

        <RoleOnly role="farmer">
          <Card className={styles.groupCard}>
            <h2>Lista de grupos</h2>

            {mode === "normal" && (
              <>
                {groups.length === 0 ? (
                  <p>Nenhum grupo cadastrado.</p>
                ) : (
                  groups.map((group) => (
                    <p key={group.id}>
                      <strong>{group.name}</strong> ({group.animalIds.length}{" "}
                      animais)
                    </p>
                  ))
                )}

                <div className={styles.buttonRow}>
                  <Button onClick={() => setMode("creating")}>Criar</Button>
                  <Button onClick={() => setMode("selecting-edit")}>
                    Editar
                  </Button>
                  {mode === "normal" && (
                    <Button onClick={() => setMode("selecting-del")}>
                      Apagar
                    </Button>
                  )}
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
                    value={animalOptions.filter((opt) =>
                      formAnimals.includes(opt.value)
                    )}
                    onChange={(selectedOptions) =>
                      setFormAnimals(selectedOptions.map((opt) => opt.value))
                    }
                  />
                </div>

                <div className={styles.buttonRow}>
                  <Button variant="light" onClick={resetForm}>
                    Cancelar
                  </Button>
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
                      <span>
                        {group.name} ({group.animalIds.length} animais)
                      </span>
                    </label>
                  ))}
                </div>

                <div className={styles.buttonRow}>
                  <Button variant="light" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleEditSelect}
                    disabled={!selectedGroupId}
                  >
                    Editar
                  </Button>
                </div>
              </>
            )}
            {mode === "selecting-del" && (
              <>
                <div>
                  {groups.map((group) => (
                    <label key={group.id} className={styles.groupSelectLabel}>
                      <input
                        type="radio"
                        name="groupSelect"
                        value={group.id}
                        checked={selectedGroupId === group.id}
                        onChange={() => setSelectedGroupId(group.id)}
                      />
                      {group.name} - {group.animalIds.length} animais
                    </label>
                  ))}
                </div>

                <div className={styles.groupDeleteButtons}>
                  <Button
                    variant="light"
                    onClick={() => {
                      setSelectedGroupId(null);
                      setMode("normal");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="light"
                    disabled={!selectedGroupId}
                    onClick={() => setDeleteConfirmVisible(true)}
                  >
                    Apagar
                  </Button>
                </div>
              </>
            )}
            {deleteConfirmVisible && selectedGroupId && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalCard}>
                  <p>
                    Tem certeza que deseja apagar o grupo{" "}
                    <strong>
                      {groups.find((g) => g.id === selectedGroupId)?.name}
                    </strong>{" "}
                    -{" "}
                    <strong>
                      {
                        groups.find((g) => g.id === selectedGroupId)?.animalIds
                          .length
                      }
                    </strong>{" "}
                    animais?
                  </p>
                  <div>
                    <Button
                      variant="light"
                      onClick={() => setDeleteConfirmVisible(false)}
                    >
                      Cancelar
                    </Button>
                    <Button variant="dark" onClick={handleConfirmDelete}>
                      Confirmar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </RoleOnly>
      </div>
    </PageLayout>
  );
};