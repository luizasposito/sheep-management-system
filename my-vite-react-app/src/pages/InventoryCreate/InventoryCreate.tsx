import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./InventoryCreate.module.css";

export const InventoryCreate: React.FC = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Adicionar item";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const item = {
      item_name: nome.trim(),
      category: tipo.trim(),
      quantity: Number(quantidade),
      unit: unidade,
      consumption_rate: 0, // campo fixo por enquanto
      last_updated: new Date().toISOString(), // <-- Aqui está a adição
    };

    if (!item.item_name || !item.category || !item.unit || isNaN(item.quantity) || item.quantity < 0) {
      setError("Por favor, preencha todos os campos corretamente.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/inventory/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Erro ao criar item");
      }

      navigate("/inventory");
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };


  return (
    <PageLayout>
      <h1 className={styles.title}>Adicionar Item ao Inventário</h1>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Card className={styles.card}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <label htmlFor="nome">
                Nome do item:
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  disabled={loading}
                />
              </label>

              <label htmlFor="tipo">
                Tipo:
                <input
                  id="tipo"
                  type="text"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  required
                  disabled={loading}
                />
              </label>
            </div>

            <div className={styles.rightColumn}>
              <label htmlFor="quantidade">
                Quantidade:
                <input
                  id="quantidade"
                  type="number"
                  min="0"
                  step="any"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                  disabled={loading}
                />
              </label>

              <label htmlFor="unidade">
                Unidade de medida:
                <select
                  id="unidade"
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione</option>
                  <option value="kg">kg</option>
                  <option value="L">L</option>
                  <option value="unidades">unidades</option>
                </select>
              </label>
            </div>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </Card>

        <div className={styles.buttonGroup}>
          <Button variant="dark" type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="light" type="button" onClick={() => navigate("/inventory")} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};
