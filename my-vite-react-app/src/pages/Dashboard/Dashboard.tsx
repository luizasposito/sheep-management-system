import React, { useEffect, useState } from "react";
import { Card } from "../../components/Card/Card";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import LineGraph from '../../components/LineGraph/LineGraph';
import PieChartGraph from "../../components/PieChart/PieChart";
import styles from "./Dashboard.module.css";
import axios from 'axios';

// Tipos para os dados da produção e atividades
interface ProductionData {
  label: string;
  value: string;
  variation: string;
}

interface GroupData {
  group_name: string;
  total_volume: number;
}

interface Activity {
  activity: string;
  date: string;
}

export const Dashboard: React.FC = () => {
  const [vendasData, setVendasData] = useState<any[]>([]); // Tipar com 'any' se você não sabe o formato exato
  const [producaoPorGrupoData, setProducaoPorGrupoData] = useState<any[]>([]); // O mesmo para esse
  const [pieChartData, setPieChartData] = useState<{ name: string; value: number }[]>([]); // Tipagem para PieChart
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [activitiesData, setActivitiesData] = useState<Activity[]>([]);

  useEffect(() => {
    document.title = "Dashboard";

    // Carregar dados de produção
    const fetchData = async () => {
      try {
        const totalTodayResponse = await axios.get("http://localhost:8000/api/milk-production/total-today");
        const totalLast7DaysResponse = await axios.get("http://localhost:8000/api/milk-production/total-last-7-days");
        const totalTodayByGroupResponse = await axios.get("http://localhost:8000/api/milk-production/total-today-by-group");
        const dailyTotalLast7DaysResponse = await axios.get("http://localhost:8000/api/milk-production/daily-total-last-7-days");

        // Atualizar os estados com os dados da API
        setVendasData(dailyTotalLast7DaysResponse.data);

        setProductionData([
          { label: "Produção últimas 24h", value: `${totalTodayResponse.data.total_volume} L`, variation: "+5%" },
          { label: "Produção últimos 7 dias", value: `${totalLast7DaysResponse.data.total_volume} L`, variation: "-3%" },
        ]);

        const productionByGroup = totalTodayByGroupResponse.data.map((group: GroupData) => ({
          name: group.group_name,
          value: group.total_volume,
        }));
        setPieChartData(productionByGroup);

        const productionByGroup7Days = dailyTotalLast7DaysResponse.data.map((group: any) => ({
          name: group.date,
          ...group,
        }));
        setProducaoPorGrupoData(productionByGroup7Days);

        // Supondo que você também tenha dados de atividades
        setActivitiesData([
          { activity: "Atividade 1", date: "2025-05-14" },
          { activity: "Atividade 2", date: "2025-05-13" },
          // Adicione atividades reais aqui
        ]);

      } catch (error) {
        console.error("Erro ao carregar dados da API", error);
      }
    };

    fetchData();
  }, []);

  return (
    <PageLayout>
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
              dataKeys={[{ key: 'total_volume', color: '#FF9800', label: 'Total' }]}
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
              {activitiesData.map(({ activity, date }, index) => (
                <details key={index} className={styles.activityItem}>
                  <summary>{activity} - {date}</summary>
                  <p>Descrição: blabla bla bla.</p>
                </details>
              ))}
            </ul>
          </Card>
        </section>
      </main>
    </PageLayout>
  );
};
