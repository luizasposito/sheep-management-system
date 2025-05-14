

import React, { useEffect } from "react";
import { Card } from "../../components/Card/Card";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import LineGraph from '../../components/LineGraph/LineGraph';
import PieChartGraph from "../../components/PieChart/PieChart";
import styles from "./Dashboard.module.css";


const vendasData = [
  { name: '01/01', produção: 327 },
  { name: '02/01', produção: 465 },
  { name: '03/01', produção: 217 },
  { name: '04/01', produção: 236 },
  { name: '05/01', produção: 333 },
  { name: '06/01', produção: 369 },
  { name: '07/01', produção: 472 },
];

const producaoPorGrupoData = [
  { name: '01/01', GrupoA: 120, GrupoB: 80, GrupoC: 60 },
  { name: '02/01', GrupoA: 150, GrupoB: 90, GrupoC: 70 },
  { name: '03/01', GrupoA: 130, GrupoB: 85, GrupoC: 65 },
  { name: '04/01', GrupoA: 160, GrupoB: 95, GrupoC: 75 },
  { name: '05/01', GrupoA: 170, GrupoB: 100, GrupoC: 80 },
  { name: '06/01', GrupoA: 180, GrupoB: 110, GrupoC: 85 },
  { name: '07/01', GrupoA: 190, GrupoB: 120, GrupoC: 90 },
];



const pieChartData = [
  { name: 'Grupo A', value: 8 },
  { name: 'Grupo B', value: 127 },
  { name: 'Grupo C', value: 53 },
  { name: 'Grupo D', value: 223 },
];



export const Dashboard: React.FC = () => {

  useEffect(() => {
      document.title = "Dashboard";
    }, []);

  const productionData = [
    { label: "Produção últimas 24h", value: "86 L", variation: "+5%" },
    { label: "Produção últimos 7 dias", value: "432 L", variation: "-3%" },
  ];

  const activitiesData = [
    ["Ecografia", "10/05/2025"],
    ["Parto", "13/05/2025"],
    ["Vacinação", "22/06/2025"],
    ["Consulta", "30/07/2025"],
  ];

  
  return (
    <PageLayout>
      {/* <header className={styles.header}>
        <h1>Nome da Fazenda</h1> 
      </header> */}

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

          <Card className={`${styles.whiteCard}`}>
            <LineGraph
              data={vendasData}
              dataKeys={[{ key: 'produção', color: '#FF9800', label: 'Total' }]}
              title="Geral"
            />
          </Card>

          <Card className={`${styles.whiteCard}`}>
            <LineGraph
              data={producaoPorGrupoData}
              dataKeys={[
                { key: 'GrupoA', color: '#FF6384', label: 'Grupo A' },
                { key: 'GrupoB', color: '#36A2EB', label: 'Grupo B' },
                { key: 'GrupoC', color: '#FFCE56', label: 'Grupo C' },
              ]}
              title="Por grupo"
            />
          </Card>
        </section>


        <section className={styles.rightPanel}>
          <Card>
            <PieChartGraph data={pieChartData} title="Distribuição por Grupo" />
          </Card>

          <Card>
            <h3>Avisos</h3>
            <ul className={styles.activitiesList}>
              {activitiesData.map(([activity, date], index) => (
                <details key={index} className={styles.activityItem}>
                  <summary>{activity} - {date}</summary>
                  <p>Descrição: blabla bla bla.</p>
                </details>
              ))}
            </ul>
          </Card>
        </section>
      </main>

      <section className={styles.monitoramentoSection}>
        <h2 className={styles.sectionTitle}>Ambiente interno</h2>
        <div className={styles.cardsContainer}>
          {[
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
          ].map((sensor) => (
            <Card
              key={sensor.label}
              className={`${styles.sensorCard} ${sensor.alerta ? styles.alerta : ""}`}
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
      </section>


    </PageLayout>
  );
};
