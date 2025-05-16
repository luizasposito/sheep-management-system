import React, { useEffect, useState } from "react";
import { Card } from "../../components/Card/Card";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import LineGraph from '../../components/LineGraph/LineGraph';
import PieChartGraph from "../../components/PieChart/PieChart";
import styles from "./Dashboard.module.css";
import axios from 'axios';

interface ProductionData {
  label: string;
  value: string;
  variation: string;
}

interface PieChartData {
  name: string;
  value: number;
}

interface LineGraphData {
  date: string;
  [key: string]: string | number;
}

interface Activity {
  activity: string;
  date: string;
}

export const Dashboard: React.FC = () => {
  const [productionCards, setProductionCards] = useState<ProductionData[]>([]);
  const [totalLast7DaysData, setTotalLast7DaysData] = useState<{ total_volume: number } | null>(null);
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);
  const [lineGraphGeneralData, setLineGraphGeneralData] = useState<LineGraphData[]>([]);
  const [lineGraphGroupData, setLineGraphGroupData] = useState<LineGraphData[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    document.title = "Dashboard";

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // ou sessionStorage.getItem
        const authHeader = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [
          totalTodayRes,
          totalLast7DaysRes,
          totalTodayByGroupRes,
          dailyTotalLast7DaysRes,
          dailyByGroupLast7DaysRes,
          sum2WeeksAgoRes
        ] = await Promise.all([
          axios.get("http://localhost:8000/milk-production/total-today", authHeader),
          axios.get("http://localhost:8000/milk-production/sum-last-7-days", authHeader),
          axios.get("http://localhost:8000/milk-production/total-today-by-group", authHeader),
          axios.get("http://localhost:8000/milk-production/daily-total-last-7-days"),
          axios.get("http://localhost:8000/milk-production/daily-by-group-last-7-days"),
          axios.get("http://localhost:8000/milk-production/sum-2-weeks-ago", authHeader),
        ]);

        const totalToday = totalTodayRes.data.total_volume || 0;
        const totalLast7Days = totalLast7DaysRes.data.total_volume || 0;
        const total2WeeksAgo = sum2WeeksAgoRes.data.total_volume || 0;

        const calcVariation = (current: number, previous: number): string => {
          if (previous === 0) return "+100%";
          const diff = current - previous;
          const percent = (diff / previous) * 100;
          return (percent >= 0 ? "+" : "") + percent.toFixed(1) + "%";
        };

        setProductionCards([
          {
            label: "Produção últimas 24h",
            value: `${totalToday.toFixed(2)} L`,
            variation: calcVariation(totalToday, totalLast7Days / 7),
          },
          {
            label: "Produção últimos 7 dias",
            value: `${totalLast7Days.toFixed(2)} L`,
            variation: calcVariation(totalLast7Days, total2WeeksAgo),
          },
        ]);

        const generalLineData = dailyTotalLast7DaysRes.data.map((item: any) => ({
          date: item.date,
          total_volume: item.total_volume || 0,
        }));
        setLineGraphGeneralData(generalLineData);

        const groupedByDate: { [date: string]: LineGraphData } = {};
        dailyByGroupLast7DaysRes.data.forEach((entry: any) => {
          const { date, group_name, total_volume } = entry;
          if (!groupedByDate[date]) {
            groupedByDate[date] = { date };
          }
          groupedByDate[date][group_name] = total_volume || 0;
        });

        const groupLineData = Object.values(groupedByDate).sort((a, b) =>
          a.date.localeCompare(b.date)
        );
        setLineGraphGroupData(groupLineData);

        const pieData = totalTodayByGroupRes.data.map((group: any) => ({
          name: group.group_name,
          value: group.total_volume,
        }));
        setPieChartData(pieData);

        setActivities([
          { activity: "Verificação diária das ovelhas", date: "2025-05-14" },
          { activity: "Manutenção do equipamento de ordenha", date: "2025-05-13" },
        ]);
      } catch (error) {
        console.error("Erro ao carregar dados da API:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <PageLayout>
      <main className={styles.mainContent}>
        <section className={styles.leftPanel}>
          {productionCards.map((item, index) => (
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

          <Card className={styles.whiteCard}>
            <LineGraph
              data={lineGraphGeneralData}
              dataKeys={[{ key: 'total_volume', color: '#FF9800', label: 'Total' }]}
              title="Geral"
            />
          </Card>

          <Card className={styles.whiteCard}>
            <LineGraph
              data={lineGraphGroupData}
              dataKeys={[
                { key: 'Grupo A', color: '#FF6384', label: 'Grupo A' },
                { key: 'Grupo B', color: '#36A2EB', label: 'Grupo B' },
                { key: 'Grupo C', color: '#FFCE56', label: 'Grupo C' },
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
              {activities.map(({ activity, date }, index) => (
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
