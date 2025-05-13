
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../../components/Layout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./AppointmentCreate.module.css";

// Lista fictícia de ovelhas disponíveis
const ovelhas = [
  { id: "001", grupo: "Cria" },
  { id: "002", grupo: "Pré-parto" },
  { id: "003", grupo: "Pós-parto" },
];

export const AppointmentCreate: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState("");
  const [ovelhaId, setOvelhaId] = useState("");
  const [grupo, setGrupo] = useState("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    document.title = "Nova Consulta";
  }, []);

  const handleOvelhaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setOvelhaId(selectedId);
    const ovelha = ovelhas.find((o) => o.id === selectedId);
    setGrupo(ovelha?.grupo || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const novaConsulta = {
      id: "A00X", // gerado automaticamente
      data,
      ovelhaId,
      grupo,
      motivo,
    };

    console.log("Nova consulta:", novaConsulta);

    // Aqui você pode enviar para o backend

    navigate("/appointment");
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Agendar nova consulta</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Card className={styles.card}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <label>
                Data da consulta:
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </label>

              <label>
                Ovelha (ID):
                <select value={ovelhaId} onChange={handleOvelhaChange} required>
                  <option value="">Selecione</option>
                  {ovelhas.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Grupo:
                <input type="text" value={grupo} disabled />
              </label>
            </div>

            <div className={styles.rightColumn}>
              <label>
                Motivo:
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Descreva o motivo da consulta"
                  rows={6}
                  required
                  style={{ resize: "vertical", padding: "0.5rem", fontSize: "1rem", borderRadius: "4px" }}
                />
              </label>
            </div>
          </div>
        </Card>

        <div className={styles.buttonGroup}>
          <Button variant="dark" type="submit">Salvar</Button>
          <Button variant="light" type="button" onClick={() => navigate("/appointment")}>Cancelar</Button>
        </div>
      </form>
    </PageLayout>
  );
};
