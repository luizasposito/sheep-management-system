
import React from "react";
import { useEffect } from "react";
import { Table } from "../components/Table/Table";
import { PageLayout } from "../components/Layout/PageLayout";
import { Button } from "../components/Button/Button";
import styles from "./Inventory.module.css";

export const Inventory: React.FC = () => {

  useEffect(() => {
    document.title = "Inventário";
  }, []);

  const headers = [
    "Tipo",
    "Nome",
    "Data última compra",
    "Taxa de consumo",
    "Quantidade em estoque",
    "Data próxima compra",
  ];

  const data = [
    ["<xyz>", "Ração xyz", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
    ["<xyz>", "Ração xyz", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
    ["<xyz>", "Ração xyz", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
    ["<xyz>", "Ração xyz", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
    ["<xyz>", "Ração xyz", "dd/mm/yyyy", "x g/dia", "dd/mm/yyyy", "dd/mm/yyyy"],
  ];

  return (
    <PageLayout>
      <h1 className={styles.title}>Inventário</h1>
      <div className={styles.buttonGroup}>
        <Button variant="light">Criar</Button>
        <Button variant="light">Editar</Button>
        <Button variant="light">Deletar</Button>
      </div>
      <Table headers={headers} data={data} />
    </PageLayout>
  );
};
