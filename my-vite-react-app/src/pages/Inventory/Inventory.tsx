import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/Table/Table";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Button } from "../../components/Button/Button";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import { Card } from "../../components/Card/Card";
import styles from "./Inventory.module.css";

interface InventoryItem {
  id: number;
  item_name: string;
  quantity: number;
  unit: string;
  consumption_rate: number;
  last_updated: string;
  category: string;
}

export const Inventory: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Inventário";
  }, []);

  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string[]>([]);
  const [adjustMode, setAdjustMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [editedQuantity, setEditedQuantity] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const headers = [
    "Categoria",
    "Nome",
    "Data última compra",
    "Quantidade em estoque",
    "Unidade",
    "Data prevista de compra",
    adjustMode ? "Ações" : "",
  ].filter(Boolean);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch("http://localhost:8000/inventory", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Erro ao buscar inventário");

        const data = await response.json();
        setInventoryData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const categories = Array.from(new Set(inventoryData.map((item) => item.category)));

  const formattedData = inventoryData.map((item) => [
    item.category,
    item.item_name,
    new Date(item.last_updated).toLocaleDateString("pt-PT"),
    item.quantity.toString(),
    item.unit,
    "-", // Pode ser substituído por lógica para próxima compra
  ]);

  const filteredData = formattedData
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

  const handleSave = async () => {
    if (selectedItem !== null && isDirty) {
      const itemToUpdate = inventoryData[selectedItem];
      const updatedData = {
        ...itemToUpdate,
        quantity: Number(editedQuantity),
      };

      try {
        const response = await fetch(`http://localhost:8000/inventory/${itemToUpdate.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedData),
        });

        if (!response.ok) throw new Error("Erro ao atualizar item");

        const updatedItem = await response.json();
        setInventoryData((prev) =>
          prev.map((item, index) =>
            index === selectedItem ? updatedItem : item
          )
        );

        setSelectedItem(null);
        setIsDirty(false);
      } catch (error) {
        console.error(error);
      }
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
            <strong>Categoria</strong>
            {categories.map((cat) => (
              <label key={cat}>
                <input
                  type="checkbox"
                  checked={filterType.includes(cat)}
                  onChange={() => toggleFilter(cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className={styles.mainContent}>
          {loading ? (
            <p>Carregando inventário...</p>
          ) : (
            <Table headers={headers} data={filteredData} />
          )}

          {adjustMode && selectedItem !== null && (
            <Card className={styles.detailCard}>
              <h2>{inventoryData[selectedItem].item_name}</h2>
              <p><strong>Categoria:</strong> {inventoryData[selectedItem].category}</p>
              <p><strong>Última compra:</strong> {new Date(inventoryData[selectedItem].last_updated).toLocaleDateString("pt-PT")}</p>
              <label className={styles.inputGroup}>
                <strong>Quantidade em estoque:</strong>
                <input
                  type="number"
                  value={editedQuantity}
                  onChange={(e) => {
                    setEditedQuantity(e.target.value);
                    setIsDirty(Number(e.target.value) !== inventoryData[selectedItem].quantity);
                  }}
                />
              </label>
              <p><strong>Unidade:</strong> {inventoryData[selectedItem].unit}</p>
              <p><strong>Próxima compra:</strong> -</p>
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