import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/Table/Table";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Button } from "../../components/Button/Button";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import { Card } from "../../components/Card/Card";
import { useIsMobile } from "../../useIsMobile";
import { useIsLandscape } from "../../useIsLandscape";
import { API_URL } from "../../config";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const isMobile = useIsMobile();
  const isLandscape = useIsLandscape();
  const showCards = isMobile && !isLandscape;
  const showTable = !showCards;

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
        const response = await fetch(`${API_URL}/inventory`, {
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

  const formattedData = [...inventoryData]
    .sort((a, b) => a.item_name.localeCompare(b.item_name, "pt-PT"))
    .map((item) => [
      item.category,
      item.item_name,
      new Date(item.last_updated).toLocaleDateString("pt-PT"),
      item.quantity.toString(),
      item.unit,
      "-",
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
          <>
            <Button
              variant="dark"
              key={`edit-${index}`}
              onClick={() => {
                setSelectedItem(index);
                setEditedQuantity(row[3]);
                setIsDirty(false);
                setShowEditModal(true);
              }}
            >
              Editar
            </Button>
            <Button
              variant="light"
              key={`delete-${index}`}
              onClick={() => {
                setSelectedItem(index);
                setShowDeleteModal(true);
              }}
            >
              Apagar
            </Button>
          </>,
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

  const handleDeleteConfirm = async () => {
    if (selectedItem === null) return;
    const itemToDelete = inventoryData[selectedItem];

    try {
      const response = await fetch(`${API_URL}/inventory/${itemToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao apagar item");

      // Atualiza lista local removendo o item
      setInventoryData((prev) => prev.filter((_, i) => i !== selectedItem));
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao apagar o item.");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Inventário</h1>

      <div className={styles.buttonGroup}>
        <Button variant="light" onClick={() => navigate("/inventory/add")}>
          Adicionar item
        </Button>
        {!showCards && (
          <Button
            variant={adjustMode ? "dark" : "light"}
            onClick={() => {
              setAdjustMode((prev) => !prev);
              setSelectedItem(null);
            }}
          >
            {adjustMode ? "Sair do ajuste" : "Ajuste"}
          </Button>
        )}
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
            <h3>Filtrar por</h3>
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
          ) : showCards ? (
            <div className={styles.cardList}>
              {inventoryData
                .filter((item) => {
                  const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesFilter = filterType.length === 0 || filterType.includes(item.category);
                  return matchesSearch && matchesFilter;
                })
                .map((item, index) => (
                  <Card key={item.id} className={styles.inventoryCard}>
                    <h2 className={styles.cardTitle}>{item.item_name}</h2>
                    <p><strong>Categoria:</strong> {item.category}</p>
                    <p><strong>Última compra:</strong> {new Date(item.last_updated).toLocaleDateString("pt-PT")}</p>
                    <p><strong>Quantidade:</strong> {item.quantity}</p>
                    <p><strong>Unidade:</strong> {item.unit}</p>
                    <p><strong>Próxima compra:</strong> -</p>
                    {(adjustMode || showCards) && (
                      <div className={styles.cardButtonRow}>
                        <Button
                          variant="light"
                          onClick={() => {
                            setSelectedItem(index);
                            setEditedQuantity(String(item.quantity));
                            setIsDirty(false);
                            setShowEditModal(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="dark"
                          onClick={() => {
                            setSelectedItem(index);
                            setShowDeleteModal(true);
                          }}
                        >
                          Apagar
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
            </div>
          ) : (
            <Table headers={headers} data={filteredData} />
          )}

          {/* Modal de edição */}
          {showEditModal && selectedItem !== null && (
            <div className={styles.modalOverlay}>
              <Card className={styles.modalCard}>
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
                  <Button variant="light" onClick={() => {
                    setShowEditModal(false);
                    handleCancel();
                  }}>
                    Cancelar
                  </Button>
                  <Button variant="dark" onClick={() => {
                    handleSave();
                    setShowEditModal(false);
                  }} disabled={!isDirty}>
                    Salvar
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Modal de apagar */}
          {showDeleteModal && selectedItem !== null && (
            <div className={styles.modalOverlay}>
              <Card className={styles.modalCard}>
                <h2>Tem certeza que deseja apagar o item <em>{inventoryData[selectedItem].item_name}</em>?</h2>
                <p><strong>Quantidade em estoque:</strong> {inventoryData[selectedItem].quantity} {inventoryData[selectedItem].unit}</p>
                <p><strong>Data da última compra:</strong> {new Date(inventoryData[selectedItem].last_updated).toLocaleDateString("pt-PT")}</p>
                <div className={styles.buttonRow}>
                  <Button variant="light" onClick={handleDeleteCancel}>
                    Cancelar
                  </Button>
                  <Button variant="dark" onClick={handleDeleteConfirm}>
                    Confirmar
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </main>

      </div>
    </PageLayout>
  );
};