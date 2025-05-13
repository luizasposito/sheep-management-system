
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import { PageLayout } from "../../components/Layout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Table } from "../../components/Table/Table";
import { Button } from "../../components/Button/Button";
import { RoleOnly } from "../../components/RoleOnly";
import styles from "./AppointmentDetail.module.css";

export const AppointmentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useUser();

  useEffect(() => {
    if (!user || !user.role) return;
    if (!(user.role === 'farmer' || user.role === 'vet')) {
      navigate("/unauthorized");
    }
  }, [user]);

  useEffect(() => {
    document.title = `Consulta ${id}`;
  }, [id]);

  // Mock data
  const animalId = "002";
  const grupo = "Pré-parto";
  const motivo = "Animal apresentou sinais de febre e perda de apetite.";
  const comentarios = `Foi observada leve desidratação e sensibilidade abdominal. Recomendado repouso e administração dos medicamentos abaixo por 5 dias. Reavaliação em uma semana.`;
  const medicamentos = [
    ["Dipirona", "10ml", "Administrar via oral a cada 12h"],
    ["Flunixin", "2ml", "Injetável, 1x ao dia"],
    ["Probiótico", "5g", "Misturar na ração diária"],
  ];

  return (
    <PageLayout>
      <h1 className={styles.title}>Detalhes da Consulta {id}</h1>

      <div className={styles.buttonGroup}>
        <Button variant="light" onClick={() => navigate("/appointment")}> Voltar </Button>
        <RoleOnly role="vet">
          <Button variant="light" onClick={() => navigate("/appointment")}> Editar </Button>
        </RoleOnly>
      </div>

      <div className={styles.grid}>
        {/* ID e Grupo do Animal */}
        <Card className={styles.mainInfo}>
          <p><strong>ID do animal:</strong> {animalId}</p>
          <p><strong>Grupo:</strong> {grupo}</p>
        </Card>

        {/* Descrição do Motivo */}
        <Card className={`${styles.crias} ${styles.whiteCard}`}>
            <h3>Motivo</h3>
            <p>{motivo}</p>
        </Card>

        {/* Comentários do veterinário */}
        <Card className={`${styles.history} ${styles.whiteCard}`}>
            <h3>Comentários do veterinário</h3>
            <p>{comentarios}</p>
        </Card>


        {/* Tabela de medicamentos */}
        <Card className={styles.upcoming}>
          <h3>Medicamentos prescritos</h3>
          <Table
            headers={["Nome", "Dosagem", "Observações"]}
            data={medicamentos}
          />
        </Card>
      </div>
    </PageLayout>
  );
};
