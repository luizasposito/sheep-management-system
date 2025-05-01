import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../../components/Layout/PageLayout";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import styles from "./Animals.module.css";

type Animal = {
  id: string;
  producaoLeiteira: string;
  sexo: "Fêmea" | "Macho";
  status:
    | "Cordeiro"
    | "Borrego"
    | "Ovelha"
    | "Capão"
    | "Carneiro"
    | "Prenha"
    | "A amamentar";
};

const animalData: Animal[] = [
  {
    id: "001",
    producaoLeiteira: "2L",
    sexo: "Fêmea",
    status: "Ovelha",
  },
  {
    id: "002",
    producaoLeiteira: "10L",
    sexo: "Macho",
    status: "Carneiro",
  },
  {
    id: "003",
    producaoLeiteira: "5L",
    sexo: "Fêmea",
    status: "Prenha",
  },
];

export const Animals: React.FC = () => {
  useEffect(() => {
    document.title = "Animais";
  }, []);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSexo, setFilterSexo] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);

  const toggleFilter = (
    value: string,
    filterState: string[],
    setFilterState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setFilterState((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const applyFilters = (animal: Animal) => {
    const matchesSearch =
      animal.id.includes(searchTerm) ||
      animal.status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSexo =
      filterSexo.length === 0 || filterSexo.includes(animal.sexo);

    const matchesStatus =
      filterStatus.length === 0 || filterStatus.includes(animal.status);

    return matchesSearch && matchesSexo && matchesStatus;
  };

  const filteredAnimals = animalData.filter(applyFilters);

  return (
    <PageLayout>
      <h1 className={styles.title}>Ovelhas</h1>

      <div className={styles.buttonGroup}>
        <Button variant="light">Criar</Button>
        <Button variant="light">Editar</Button>
        <Button variant="light">Deletar</Button>
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
            <label>
              <input
                type="checkbox"
                checked={filterSexo.includes("Fêmea")}
                onChange={() =>
                  toggleFilter("Fêmea", filterSexo, setFilterSexo)
                }
              />
              Fêmea
            </label>
            <label>
              <input
                type="checkbox"
                checked={filterSexo.includes("Macho")}
                onChange={() =>
                  toggleFilter("Macho", filterSexo, setFilterSexo)
                }
              />
              Macho
            </label>
          </div>

          <div className={styles.filterGroup}>
            <strong>Status</strong>
            {[
              "Cordeiro",
              "Borrego",
              "Ovelha",
              "Capão",
              "Carneiro",
              "Prenha",
              "A amamentar",
            ].map((status) => (
              <label key={status}>
                <input
                  type="checkbox"
                  checked={filterStatus.includes(status)}
                  onChange={() =>
                    toggleFilter(status, filterStatus, setFilterStatus)
                  }
                />
                {status}
              </label>
            ))}
          </div>
        </aside>

        <section className={styles.cards}>
          {filteredAnimals.map((animal) => (
            <Card
              key={animal.id}
              className={styles.clickableCard}
              onClick={() => navigate(`/animal/${animal.id}`)}
            >
              <div className={styles.cardContent}>
                <p>
                  <strong>ID:</strong> {animal.id}
                </p>
                <p>
                  <strong>produção leiteira:</strong> {animal.producaoLeiteira}
                </p>
                <p>
                  <strong>sexo:</strong> {animal.sexo}
                </p>
                <p>
                  <strong>status:</strong> {animal.status}
                </p>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </PageLayout>
  );
};
