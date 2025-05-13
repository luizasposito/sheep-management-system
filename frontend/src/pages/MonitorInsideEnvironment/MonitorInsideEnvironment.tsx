
import React, { useEffect } from "react";
import { PageLayout } from "../../components/Layout/PageLayout";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import styles from "./MonitorInsideEnvironment.module.css";

export const MonitorInsideEnvironment: React.FC = () => {

  useEffect(() => {
      document.title = "Monitoramento Ambiente Interno";
    }, []);

  const sensores = [
    {
      label: "Oxigênio",
      atual: 50,
      minimo: 10,
      maximo: 60,
      alerta: false,
    },
    {
      label: "Amoníaco",
      atual: 45,
      minimo: 35,
      maximo: 65,
      alerta: false,
    },
    {
      label: "Temperatura",
      atual: 33,
      minimo: 21,
      maximo: 30,
      alerta: true,
    },
  ];

  return (
    <PageLayout>
      <h1 className={styles.title}>Monitoramento do ambiente interno</h1>

      <div className={styles.section}>
        <h2 className={styles.subtitle}>Limpeza de leitos</h2>
        <Button variant="light">Marcar limpeza</Button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.subtitle}>Monitoramento de ar</h2>
        <Button variant="light">Adicionar sensor</Button>
      </div>

      <div className={styles.cardsContainer}>
        {sensores.map((sensor) => (
          <Card
            key={sensor.label}
            className={`${styles.card} ${sensor.alerta ? styles.alerta : ""}`}
          >
            <h3 className={styles.sensorTitle}>{sensor.label}</h3>
            <p className={styles.valorAtualLabel}>Valor atual</p>
            <div
              className={`${styles.valorAtual} ${
                sensor.alerta ? styles.alertaValor : ""
              }`}
            >
              {sensor.atual}
            </div>
            <div className={styles.limites}>
              <div>
                <p>Valor mínimo</p>
                <input type="text" value={sensor.minimo} readOnly />
              </div>
              <div>
                <p>Valor máximo</p>
                <input type="text" value={sensor.maximo} readOnly />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
};
