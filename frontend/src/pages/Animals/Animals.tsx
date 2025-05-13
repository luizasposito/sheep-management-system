import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import { PageLayout } from "../../components/Layout/PageLayout";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import { RoleOnly } from "../../components/RoleOnly";
import Select from "react-select";
import styles from "./Animals.module.css";

type Animal = {
  id: string;
  producaoLeiteira: string;
  sexo: "Fêmea" | "Macho";
  status: "Cria" | "Prenha" | "Pós-parto";
};

type Group = {
  id: string;
  name: string;
  animalIds: string[];
};

const animalData: Animal[] = [
  { id: "001", producaoLeiteira: "2L", sexo: "Fêmea", status: "Pós-parto" },
  { id: "002", producaoLeiteira: "10L", sexo: "Macho", status: "Cria" },
  { id: "003", producaoLeiteira: "5L", sexo: "Fêmea", status: "Prenha" },
];

const initialGroups: Group[] = [
  { id: "g1", name: "Grupo A", animalIds: ["001"] },
  { id: "g2", name: "Grupo B", animalIds: ["002", "003"] },
];

export const Animals: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const animalOptions = animalData.map(animal => ({
    value: animal.id,
    label: `${animal.id} - ${animal.status}`,
  }));

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSexo, setFilterSexo] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);

  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [mode, setMode] = useState<"normal" | "creating" | "editing" | "selecting">("normal");

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formAnimals, setFormAnimals] = useState<string[]>([]);
  const [originalName, setOriginalName] = useState("");
  const [originalAnimals, setOriginalAnimals] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Animais";
  }, []);

  useEffect(() => {
    if (!user || !user.role) return;
    if (!(user.role === "farmer" || user.role === "vet")) navigate("/unauthorized");
  }, [user]);

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
      animal.id.includes(searchTerm) ||
      animal.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSexo = filterSexo.length === 0 || filterSexo.includes(animal.sexo);
    const matchesStatus = filterStatus.length === 0 || filterStatus.includes(animal.status);
    return matchesSearch && matchesSexo && matchesStatus;
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

  const handleSave = () => {
    if (!formName.trim()) return;

    if (mode === "creating") {
      const newGroup: Group = {
        id: Date.now().toString(),
        name: formName,
        animalIds: formAnimals,
      };
      setGroups(prev => [...prev, newGroup]);
    }

    if (mode === "editing" && selectedGroupId) {
      setGroups(prev =>
        prev.map(g =>
          g.id === selectedGroupId ? { ...g, name: formName, animalIds: formAnimals } : g
        )
      );
    }

    resetForm();
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
          placeholder="Pesquisar por id ou status"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.content}>
        <aside className={styles.filters}>
          <h3>Filtrar por</h3>

          <div className={styles.filterGroup}>
            <strong>Sexo</strong>
            {["Fêmea", "Macho"].map(sexo => (
              <label key={sexo}>
                <input
                  type="checkbox"
                  checked={filterSexo.includes(sexo)}
                  onChange={() => toggleFilter(sexo, filterSexo, setFilterSexo)}
                />
                <span>{sexo}</span>
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <strong>Status</strong>
            {["Cria", "Prenha", "Pós-parto"].map(status => (
              <label key={status}>
                <input
                  type="checkbox"
                  checked={filterStatus.includes(status)}
                  onChange={() => toggleFilter(status, filterStatus, setFilterStatus)}
                />
                <span>{status}</span>
              </label>
            ))}
          </div>
        </aside>

        <section className={styles.cards}>
          {filteredAnimals.map(animal => (
            <Card key={animal.id} className={styles.clickableCard} onClick={() => navigate(`/animal/${animal.id}`)}>
              <div className={styles.cardContent}>
                <p><strong>ID:</strong> {animal.id}</p>
                <p><strong>produção leiteira:</strong> {animal.producaoLeiteira}</p>
                <p><strong>sexo:</strong> {animal.sexo}</p>
                <p><strong>status:</strong> {animal.status}</p>
              </div>
            </Card>
          ))}
        </section>

        <Card className={styles.groupCard}>
          <h2>Lista de grupos</h2>

          {mode === "normal" && (
            <>
              {groups.length === 0 ? (
                <p>Nenhum grupo cadastrado.</p>
              ) : (
                groups.map(group => (
                  <p key={group.id}>
                    <strong>{group.name}</strong> ({group.animalIds.length} animais)
                  </p>
                ))
              )}
              <div>
                <Button onClick={() => setMode("creating")}>Criar</Button>
                <Button onClick={() => setMode("selecting")} disabled={groups.length === 0}>Editar</Button>
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
                  value={animalOptions.filter(opt => formAnimals.includes(opt.value))}
                  onChange={(selectedOptions) =>
                    setFormAnimals(selectedOptions.map(opt => opt.value))
                  }
                />
              </div>

              <div className={styles.buttonRow}>
                <Button
                  onClick={handleSave}
                  disabled={
                    mode === "editing" &&
                    formName === originalName &&
                    JSON.stringify([...formAnimals].sort()) === JSON.stringify([...originalAnimals].sort())
                  }
                >
                  Salvar
                </Button>
                <Button variant="light" onClick={resetForm}>Cancelar</Button>
              </div>
            </div>
          )}

          {mode === "selecting" && (
            <>
              <div className={styles.radioList}>
                {groups.map(group => (
                  <label key={group.id} className={styles.radioItem}>
                    <input
                      type="radio"
                      name="group"
                      value={group.id}
                      onChange={() => setSelectedGroupId(group.id)}
                    />
                    <span>{group.name}</span>
                  </label>
                ))}
              </div>

              <div className={styles.buttonRow}>
                <Button onClick={handleEditSelect} disabled={!selectedGroupId}>Editar</Button>
                <Button variant="light" onClick={resetForm}>Cancelar</Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </PageLayout>
  );
};
