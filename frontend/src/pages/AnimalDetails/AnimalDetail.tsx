
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "../../components/Layout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./AnimalDetail.module.css";

export const AnimalDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <PageLayout>
      <h1 className={styles.title}>Animal {id}</h1>

      <div className={styles.buttonGroup}>
        <Button variant="light" onClick={() => navigate(`/animal/${id}/edit`)}>Editar</Button>
      </div>

      <div className={styles.grid}>
        {/* Dados principais */}
        <Card className={styles.mainInfo}>
            <div className={styles.columns}>
                <div>
                <p><strong>ID:</strong> {id}</p>
                <p><strong>Sexo:</strong> &lt;...&gt;</p>
                </div>
                <div>
                <p><strong>Status:</strong> &lt;...&gt;</p>
                <p><strong>Produção leiteira (em litros):</strong> &lt;...&gt;</p>
                </div>
            </div>

            <div>
                <strong>Pai e Mãe</strong>
                <div className={styles.chipList}>
                <Button variant="dark">&lt;id&gt;</Button>
                <Button variant="dark">&lt;id&gt;</Button>
                </div>
            </div>
        </Card>


        {/* Crias */}
        <Card className={styles.crias}>
          <h3>Crias</h3>
          <div className={styles.chipGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Button key={i} variant="dark">&lt;id&gt;</Button>
            ))}
          </div>
        </Card>

        {/* Histórico de consultas */}
        <Card className={styles.history}>
          <h3>Histórico de consultas</h3>
          <div className={styles.scrollArea}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className={styles.historyItem}>
                <p><strong>Data:</strong> dd/mm/yyyy</p>
                <p><strong>Descrição:</strong> &lt;...&gt;</p>
              </Card>
            ))}
          </div>
        </Card>

        {/* Próximas consultas */}
        <Card className={styles.upcoming}>
          <h3>Próximas consultas</h3>
          <div className={styles.scrollArea}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className={styles.upcomingItem}>
                <p><strong>Data:</strong> dd/mm/yyyy</p>
                <p><strong>Criado por:</strong> &lt;...&gt;</p>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};
