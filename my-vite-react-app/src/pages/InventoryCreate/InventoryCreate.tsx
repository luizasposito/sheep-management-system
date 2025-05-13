

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = { nome, tipo, quantidade, unidade };
    console.log("Novo item de inventário:", item);
    // Aqui você pode fazer o POST para a API
    navigate("/inventory");
  };

  useEffect(() => {
        document.title = "Adicionar item";
      }, []);

  return (
    <PageLayout>
      <h1 className={styles.title}>Adicionar Item ao Inventário</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Card className={styles.card}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <label>
                Nome do item:
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </label>

              <label>
                Tipo:
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                  <option value="">Selecione</option>
                  <option value="alimentação">Alimentação</option>
                  <option value="limpeza">Limpeza</option>
                </select>
              </label>
            </div>

            <div className={styles.rightColumn}>
              <label>
                Quantidade:
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                />
              </label>

              <label>
                Unidade de medida:
                <select value={unidade} onChange={(e) => setUnidade(e.target.value)} required>
                  <option value="">Selecione</option>
                  <option value="kg">kg</option>
                  <option value="L">L</option>
                </select>
              </label>
            </div>
          </div>
        </Card>

        <div className={styles.buttonGroup}>
          <Button variant="dark" type="submit">Salvar</Button>
          <Button variant="light" type="button" onClick={() => navigate("/inventory")}>
            Cancelar
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};
