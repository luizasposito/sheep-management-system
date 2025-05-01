
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

  const headers = [
    "Tipo",
    "Nome",
    "Data última compra",
    "Taxa de consumo",
    "Quantidade em estoque",
    "Data próxima compra",
  ];

  const data = [
    ["01", "Ração cria", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
    ["02", "Ração produção alta", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
    ["03", "Ração pré-parto", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
    ["04", "Ração pós-parto", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
    ["05", "Limpeza", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
  ];

  const filteredData = data.filter((row) =>
    row[1].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout>
      <h1 className={styles.title}>Inventário</h1>
      <div className={styles.buttonGroup}>
        <Button variant="light">Criar</Button>
        <Button variant="light">Editar</Button>
        <Button variant="light">Deletar</Button>
      </div>

      <div className={styles.searchBar}>
        <SearchInput
          placeholder="Pesquisar por nome"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table headers={headers} data={filteredData} />
    </PageLayout>
  );
};
