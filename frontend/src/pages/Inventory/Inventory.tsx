
import React, { useEffect, useState } from "react";
import { Table } from "../../components/Table/Table";
import { PageLayout } from "../../components/Layout/PageLayout";
import { Button } from "../../components/Button/Button";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import styles from "./Inventory.module.css";

export const Inventory: React.FC = () => {

  useEffect(() => {
    document.title = "Inventário";
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string[]>([]);

  const headers = [
    "Tipo",
    "Nome",
    "Data última compra",
    "Taxa de consumo",
    "Quantidade em estoque",
    "Data prevista de compra",
  ];

  const data = [
    ["Alimentação", "Ração cria", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
    ["Alimentação", "Ração produção alta", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
    ["Alimentação", "Ração pré-parto", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
    ["Alimentação", "Ração pós-parto", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
    ["Limpeza", "Detergente", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
  ];

  
  const filteredData = data.filter((row) => {
    const matchesSearch = row[1].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType.length === 0 || filterType.includes(row[0]);
    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (type: string) => {
    setFilterType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Inventário</h1>

      <div className={styles.container}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <SearchInput
            placeholder="Pesquisar por nome"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className={styles.filterGroup}>
            <p>Filtrar por</p>
            <strong>Tipo</strong>
            <label>
              <input
                type="checkbox"
                checked={filterType.includes("Alimentação")}
                onChange={() => toggleFilter("Alimentação")}
              />
              <span>Alimentação</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={filterType.includes("Limpeza")}
                onChange={() => toggleFilter("Limpeza")}
              />
              <span>Limpeza</span>
            </label>
          </div>
        </aside>

        {/* Main content */}
        <main className={styles.mainContent}>
          <div className={styles.buttonGroup}>
            <Button variant="light">Criar</Button>
          </div>

          <Table headers={headers} data={filteredData} />
        </main>
      </div>
    </PageLayout>
  );
};
