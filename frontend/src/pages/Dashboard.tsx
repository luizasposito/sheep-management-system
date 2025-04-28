import React from "react";
import { Menu } from "../components/Menu/Menu";
import { Card } from "../components/Card/Card";
import { Table } from "../components/Table/Table";
import styles from "./Dashboard.module.css";

export const Dashboard: React.FC = () => {
  // Dados mockados
  const productionData = [
    { label: "Produção últimas 24h", value: "86 L", variation: "+5%" },
    { label: "Produção últimos 7 dias", value: "432 L", variation: "-3%" },
    { label: "Produção últimos 30 dias", value: "967 L", variation: "+7%" },
  ];

  const activitiesData = [
    ["Ecografia", 13],
    ["Parto", 6],
    ["Vacinação", 412],
    ["Consulta", 4],
  ];

  const tableHeaders = ["Atividade", "Quantidade"];

  return (
    <div className={styles.dashboardContainer}>
      <Menu />
      <header className={styles.header}>
        <h1>Nome da Fazenda</h1>
      </header>
      
      <main className={styles.mainContent}>
        <section className={styles.leftPanel}>
          {productionData.map((item, index) => (
            <Card key={index}>
              <div className={styles.cardContent}>
                <h3>{item.label}</h3>
                <p className={styles.liters}>{item.value}</p>
                <p
                  className={`${styles.variation} ${
                    item.variation.startsWith("+") ? styles.up : styles.down
                  }`}
                >
                  {item.variation}
                </p>
              </div>
            </Card>
          ))}
        </section>

        <section className={styles.centerPanel}>
            <h2 className={styles.sectionTitle}>Produção de leite dos últimos 7 dias</h2>

            <Card>
                <h3>Por grupo</h3>
                <div className={styles.chartPlaceholder}>[Gráfico Placeholder]</div>
            </Card>

            <Card>
                <h3>Geral</h3>
                <div className={styles.chartPlaceholder}>[Gráfico Placeholder]</div>
            </Card>
        </section>


        <section className={styles.rightPanel}>
            <Card>
                <h3>Esta semana</h3>
                <ul className={styles.activitiesList}>
                {activitiesData.map(([activity, quantity], index) => (
                    <details key={index} className={styles.activityItem}>
                    <summary>{activity}</summary>
                    <p>Quantidade: {quantity}</p>
                    <p>Descrição: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </details>
                ))}
                </ul>
            </Card>
        </section>

      </main>
    </div>
  );
};
