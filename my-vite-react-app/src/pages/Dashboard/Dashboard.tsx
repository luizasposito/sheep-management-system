import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Button } from "../../components/Button/Button";
import LineGraph from "../../components/LineGraph/LineGraph";
import PieChartGraph from "../../components/PieChart/PieChart";
import styles from "./Dashboard.module.css";
import axios from "axios";

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

interface Appointment {
  id: number;
  date: string;
  motivo?: string;
  sheep_ids?: number[];
}


export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [productionCards, setProductionCards] = useState<ProductionData[]>([]);

  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);
  const [sheepCountByGroup, setSheepCountByGroup] = useState<PieChartData[]>([]);

  const [lineGraphGeneralData, setLineGraphGeneralData] = useState<LineGraphData[]>([]);
  const [lineGraphGroupData, setLineGraphGroupData] = useState<LineGraphData[]>([]);

  const [appointment, setAppointments] = useState<Appointment[]>([]);


  useEffect(() => {
    document.title = "Dashboard";

    const processGroupGraphData = (rawData: any[]) => {
      const today = new Date();
      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        return d.toISOString().split("T")[0];
      }).reverse();

      const groups = Array.from(new Set(rawData.map((item) => item.group_name)));
      const groupedData: { [key: string]: { [date: string]: number } } = {};

      groups.forEach((group) => {
        groupedData[group] = {};
        dates.forEach((date) => {
          groupedData[group][date] = 0;
        });
      });

      rawData.forEach((item) => {
        groupedData[item.group_name][item.date] = item.total_volume;
      });

      const finalData: LineGraphData[] = dates.map((date) => {
        const entry: LineGraphData = { date };
        groups.forEach((group) => {
          entry[group] = groupedData[group][date];
        });
        return entry;
      });

      return finalData;
    };


    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const authHeader = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [
          totalTodayRes,
          totalLast7DaysRes,
          totalTodayByGroupRes,
          dailyTotalLast7DaysRes,
          dailyByGroupLast7DaysRes,
          sum2WeeksAgoRes,
          sheepCountByGroupRes,
          appointmentsRes
        ] = await Promise.all([
          axios.get("http://localhost:8000/milk-production/total-today", authHeader),
          axios.get("http://localhost:8000/milk-production/sum-last-7-days", authHeader),
          axios.get("http://localhost:8000/milk-production/total-today-by-group", authHeader),
          axios.get("http://localhost:8000/milk-production/daily-total-last-7-days"),
          axios.get("http://localhost:8000/milk-production/daily-by-group-last-7-days"),
          axios.get("http://localhost:8000/milk-production/sum-2-weeks-ago", authHeader),
          axios.get("http://localhost:8000/sheep-group/sheep-count-by-group", authHeader),
          axios.get("http://localhost:8000/appointment/", authHeader)
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
        setLineGraphGroupData(processGroupGraphData(dailyByGroupLast7DaysRes.data));

        const pieData = totalTodayByGroupRes.data.map((group: any) => ({
          name: group.group_name,
          value: group.total_volume,
        }));
        setPieChartData(pieData);

        const sheepCountPieData = sheepCountByGroupRes.data.map((group: any) => ({
          name: group.group_name,
          value: group.count,
        }));
        setSheepCountByGroup(sheepCountPieData);

        const todayISO = new Date().toISOString();

        const upcomingAppointments = appointmentsRes.data
          .filter((appt: any) => appt.date >= todayISO)
          .sort((a: any, b: any) => a.date.localeCompare(b.date));

        setAppointments(upcomingAppointments.map((appt: any) => ({
          id: appt.id,
          date: appt.date.split("T")[0],
          motivo: appt.motivo || "Sem motivo informado",
          sheep_ids: appt.sheep_ids || []
        })));

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
              title="Geral"
              xKey="date"
            />
          </Card>

          <Card className={styles.whiteCard}>
            <LineGraph
              data={lineGraphGroupData}
              title="Por grupo"
              xKey="date"
            />
          </Card>

        </section>

        <section className={styles.rightPanel}>
          <Card className={styles.pieChartCard}>
            <PieChartGraph data={sheepCountByGroup} title="Distribuição por Grupo" />
          </Card>

          <Card>
            <h3>Consultas</h3>
            <ul className={styles.appointmentList}>
              {appointment.map(({ id, date, motivo, sheep_ids }, index) => (
                <details key={index} className={styles.appointmentItem}>
                  <summary>{date}</summary>
                  <p><strong>Motivo:</strong> {motivo}</p>
                  <p>
                    <strong>Animais associados:</strong>{" "}
                    {sheep_ids && sheep_ids.length > 0 ? (
                      sheep_ids.map((sheepId) => (
                        <Button key={sheepId} variant="light" onClick={() => navigate(`/animal/${sheepId}`)}>
                          {sheepId}
                        </Button>
                      ))
                    ) : (
                      "Nenhum"
                    )}
                  </p>
                  <p>
                    <Button variant="light" onClick={() => navigate(`/appointment/${id}`)}>
                      Ver detalhes da consulta
                    </Button>
                  </p>
                </details>
              ))}
            </ul>
          </Card>

        </section>
      </main>
    </PageLayout>
  );
};
