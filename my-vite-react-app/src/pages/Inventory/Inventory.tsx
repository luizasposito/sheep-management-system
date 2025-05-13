
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/Table/Table";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Button } from "../../components/Button/Button";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import { Card } from "../../components/Card/Card";
import styles from "./Inventory.module.css";

export const Inventory: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Inventário";
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string[]>([]);
  const [adjustMode, setAdjustMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [editedQuantity, setEditedQuantity] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const headers = [
    "Tipo",
    "Nome",
    "Data última compra",
    "Quantidade em estoque",
    "Unidade",
    "Data prevista de compra",
    adjustMode ? "Ações" : "",
  ].filter(Boolean);

  const data = [
    ["Alimentação", "Ração cria", "01/01/2024", "25", "kg", "01/06/2024"],
    ["Alimentação", "Ração produção alta", "15/01/2024", "40", "kg", "15/06/2024"],
    ["Alimentação", "Ração pré-parto", "10/02/2024", "35", "kg", "10/07/2024"],
    ["Alimentação", "Ração pós-parto", "20/02/2024", "30", "kg", "20/07/2024"],
    ["Limpeza", "Detergente", "05/03/2024", "10", "L", "05/08/2024"],
  ];

  const filteredData = data
    .filter((row) => {
      const matchesSearch = row[1].toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType.length === 0 || filterType.includes(row[0]);
      return matchesSearch && matchesFilter;
    })
    .map((row, index) => {
      if (adjustMode) {
        return [
          ...row,
          <Button
            variant="dark"
            key={`adjust-${index}`}
            onClick={() => {
              setSelectedItem(index);
              setEditedQuantity(row[3]);
              setIsDirty(false);
            }}
          >
            Ajustar
          </Button>,
        ];
      }
      return row;
    });

  const toggleFilter = (type: string) => {
    setFilterType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = () => {
    if (selectedItem !== null && isDirty) {
      console.log(`Salvar nova quantidade para ${data[selectedItem][1]}: ${editedQuantity}`);
      setSelectedItem(null);
      setIsDirty(false);
    }
  };

  const handleCancel = () => {
    setSelectedItem(null);
    setIsDirty(false);
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Inventário</h1>

      <div className={styles.buttonGroup}>
        <Button variant="light" onClick={() => navigate("/inventory/add")}>
          Criar
        </Button>
        <Button
          variant={adjustMode ? "dark" : "light"}
          onClick={() => {
            setAdjustMode((prev) => !prev);
            setSelectedItem(null);
          }}
        >
          {adjustMode ? "Sair do ajuste" : "Ajuste"}
        </Button>
      </div>

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
          <Table headers={headers} data={filteredData} />

          {adjustMode && selectedItem !== null && (
            <Card className={styles.detailCard}>
              <h2>{data[selectedItem][1]}</h2>
              <p><strong>Tipo:</strong> {data[selectedItem][0]}</p>
              <p><strong>Última compra:</strong> {data[selectedItem][2]}</p>
              <label className={styles.inputGroup}>
                <strong>Quantidade em estoque:</strong>
                <input
                  type="number"
                  value={editedQuantity}
                  onChange={(e) => {
                    setEditedQuantity(e.target.value);
                    setIsDirty(e.target.value !== data[selectedItem][3]);
                  }}
                />
              </label>
              <p><strong>Unidade:</strong> {data[selectedItem][4]}</p>
              <p><strong>Próxima compra:</strong> {data[selectedItem][5]}</p>
              <div className={styles.buttonRow}>
                <Button variant="dark" onClick={handleSave} disabled={!isDirty}>
                  Salvar
                </Button>
                <Button variant="light" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </Card>
          )}

        </main>
      </div>
    </PageLayout>
  );
};
