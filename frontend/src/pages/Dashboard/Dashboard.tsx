import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import { Card } from "../../components/Card/Card";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Button } from "../../components/Button/Button";
import LineGraph from "../../components/LineGraph/LineGraph";
import PieChartGraph from "../../components/PieChart/PieChart";
import styles from "./Dashboard.module.css";

interface ProductionData {
  label: string;
  value: string;
  variation: string;
}

type SensorForm = {
  name: string;
  min_value: string;
  max_value: string;
  current_value: string;
};

type SensorResponse = {
  id: number;
  name: string;
  current_value: number;
  min_value: number;
  max_value: number;
};

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
  const [sensors, setSensors] = useState<SensorResponse[]>([]);
  const [creatingSensor, setCreatingSensor] = useState(false);
  const [editingSensorId, setEditingSensorId] = useState<number | null>(null);
  const [deleteSensorId, setDeleteSensorId] = useState<number | null>(null);
  const [sensorForm, setSensorForm] = useState<SensorForm>({
    name: "",
    min_value: "",
    max_value: "",
    current_value: "",
  });
  const [formChanged, setFormChanged] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    document.title = "Dashboard";
    fetchData();
    fetchSensors();
  }, []);

  const processGroupGraphData = (apiData: any[]): LineGraphData[] => {
    const groupedData: { [date: string]: LineGraphData } = {};
    const groupNames = new Set<string>();

    // Primeiro passo: organizar por data e coletar todos os grupos
    for (const entry of apiData) {
      const { date, group_name, total_volume } = entry;
      groupNames.add(group_name);
      if (!groupedData[date]) {
        groupedData[date] = { date };
      }
      groupedData[date][group_name] = total_volume || 0;
    }

    // Segundo passo: garantir que todas as datas tenham todos os grupos
    const completeData: LineGraphData[] = Object.values(groupedData).map((entry) => {
      for (const group of groupNames) {
        if (!(group in entry)) {
          entry[group] = 0;
        }
      }
      return entry;
    });

    return completeData.sort((a, b) => a.date.localeCompare(b.date));
  };


  const fetchSensors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/sensor/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSensors(data);
    } catch (error) {
      console.error("Erro ao buscar sensores:", error);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const requests = [
        fetch("http://localhost:8000/milk-production/total-today", {
          method: "GET",
          headers,
        }),
        fetch("http://localhost:8000/milk-production/sum-last-7-days", {
          method: "GET",
          headers,
        }),
        fetch("http://localhost:8000/milk-production/total-today-by-group", {
          method: "GET",
          headers,
        }),
        fetch("http://localhost:8000/milk-production/daily-total-last-7-days", {
          method: "GET",
          headers,
        }),
        fetch("http://localhost:8000/milk-production/daily-by-group-last-7-days", {
          method: "GET",
          headers,
        }),
        fetch("http://localhost:8000/milk-production/sum-2-weeks-ago", {
          method: "GET",
          headers,
        }),
        fetch("http://localhost:8000/sheep-group/sheep-count-by-group", {
          method: "GET",
          headers,
        }),
        fetch("http://localhost:8000/appointment/", {
          method: "GET",
          headers,
        }),
      ];

      const responses = await Promise.all(requests);
      const [
        totalTodayRes,
        totalLast7DaysRes,
        totalTodayByGroupRes,
        dailyTotalLast7DaysRes,
        dailyByGroupLast7DaysRes,
        sum2WeeksAgoRes,
        sheepCountByGroupRes,
        appointmentsRes,
      ] = await Promise.all(responses.map((res) => res.json()));

      const totalToday = totalTodayRes.total_volume || 0;
      const totalLast7Days = totalLast7DaysRes.total_volume || 0;
      const total2WeeksAgo = sum2WeeksAgoRes.total_volume || 0;

      const calcVariation = (current: number, previous: number): string => {
        if (previous === 0) return "+100%";
        const diff = current - previous;
        const percent = (diff / previous) * 100;
        return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
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

      setLineGraphGeneralData(
        dailyTotalLast7DaysRes.map((item: any) => ({
          date: item.date,
          total_volume: item.total_volume || 0,
        }))
      );

      setLineGraphGroupData(processGroupGraphData(dailyByGroupLast7DaysRes));

      setPieChartData(
        totalTodayByGroupRes.map((group: any) => ({
          name: group.group_name,
          value: group.total_volume,
        }))
      );

      setSheepCountByGroup(
        sheepCountByGroupRes.map((group: any) => ({
          name: group.group_name,
          value: group.count,
        }))
      );

      const todayISO = new Date().toISOString();
      const upcomingAppointments = appointmentsRes
        .filter((appt: any) => appt.date >= todayISO)
        .sort((a: any, b: any) => a.date.localeCompare(b.date))
        .map((appt: any) => ({
          id: appt.id,
          date: appt.date.split("T")[0],
          motivo: appt.motivo || "Sem motivo informado",
          sheep_ids: appt.sheep_ids || [],
        }));

      setAppointments(upcomingAppointments);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };


  const handleSensorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSensorForm((prev) => {
      const changed = prev[name as keyof typeof prev] !== value;
      setFormChanged(changed);
      return { ...prev, [name]: value };
    });
  };

  const cancelSensorForm = () => {
    setSensorForm({
      name: "",
      min_value: "",
      max_value: "",
      current_value: "",
    });
    setCreatingSensor(false);
    setEditingSensorId(null);
    setFormChanged(false);
  };

  const handleSaveSensor = async () => {
    if (!user) {
      alert("Usuário não autenticado");
      return;
    }

    const method = editingSensorId !== null ? "PUT" : "POST";
    const url = editingSensorId !== null
      ? `http://localhost:8000/sensor/${editingSensorId}`
      : "http://localhost:8000/sensor/";

    const payload = {
      name: sensorForm.name,
      min_value: parseFloat(sensorForm.min_value),
      max_value: parseFloat(sensorForm.max_value),
      current_value: parseFloat(sensorForm.current_value),
      farm_id: user.farmId,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao salvar sensor");
      const updatedSensor = await response.json();

      setSensors((prev) =>
        method === "POST"
          ? [...prev, updatedSensor]
          : prev.map((s) => (s.id === updatedSensor.id ? updatedSensor : s))
      );
      cancelSensorForm();
    } catch (error) {
      console.error("Erro ao salvar sensor:", error);
      alert("Erro ao salvar sensor. Verifique os dados.");
    }
  };


  const handleDeleteSensor = async () => {
    if (deleteSensorId === null) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/sensor/${deleteSensorId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erro ao deletar sensor");

      setSensors((prev) => prev.filter((s) => s.id !== deleteSensorId));
      setDeleteSensorId(null);
    } catch (error) {
      console.error("Erro ao deletar sensor:", error);
      alert("Erro ao deletar sensor.");
    }
  };


  const startEditingSensor = (sensor: SensorResponse) => {
    setSensorForm({
      name: sensor.name,
      min_value: String(sensor.min_value),
      max_value: String(sensor.max_value),
      current_value: String(sensor.current_value),
    });
    setEditingSensorId(sensor.id);
    setCreatingSensor(false);
    setFormChanged(false);
  };


  return (
    <PageLayout>
      <main className={styles.mainContent}>
        <section className={styles.leftPanel}>
          <Card className={styles.whiteCard}>
            {creatingSensor || editingSensorId !== null ? (
              <>
                <Card className={`${styles.groupCard}`}>
                  <h3>{creatingSensor ? "Novo Sensor" : "Editar Sensor"}</h3>
                  <div className={styles.formGroup}>
                    <div className={styles.formField}>
                      <label htmlFor="sensor-name">Nome do sensor</label>
                      <input
                        id="sensor-name"
                        type="text"
                        name="name"
                        value={sensorForm.name}
                        onChange={handleSensorChange}
                      />
                    </div>

                    <div className={styles.formField}>
                      <label htmlFor="sensor-min">Valor mínimo</label>
                      <input
                        id="sensor-min"
                        type="number"
                        name="min_value"
                        value={sensorForm.min_value}
                        onChange={handleSensorChange}
                      />
                    </div>

                    <div className={styles.formField}>
                      <label htmlFor="sensor-max">Valor máximo</label>
                      <input
                        id="sensor-max"
                        type="number"
                        name="max_value"
                        value={sensorForm.max_value}
                        onChange={handleSensorChange}
                      />
                    </div>

                    <div className={styles.formField}>
                      <label htmlFor="sensor-current">Valor atual</label>
                      <input
                        id="sensor-current"
                        type="number"
                        name="current_value"
                        value={sensorForm.current_value}
                        onChange={handleSensorChange}
                      />
                    </div>

                    <div className={styles.buttonRow}>
                      <Button variant="light" onClick={cancelSensorForm}>
                        Cancelar
                      </Button>
                      <Button variant="dark" disabled={!formChanged} onClick={handleSaveSensor}>
                        Salvar
                      </Button>
                    </div>
                  </div>
                </Card>


              </>
            ) : (
              <>
                <div className={styles.sensorHeaderWrapper}>
                  <h3 className={styles.sensorHeader}>Sensores</h3>
                  <Button variant="light" onClick={() => setCreatingSensor(true)}>
                    Criar novo sensor
                  </Button>
                </div>

              </>
            )}
          </Card>

          {sensors.map((sensor) => (
            <Card key={sensor.id}>
              <h3>{sensor.name}</h3>
              <div className={styles.sensorValues}>
                <div className={styles.valueBox}>
                  <p className={styles.valueTitle}>Valor atual</p>
                  <div
                    className={`${styles.valueRect} ${
                      (sensor.current_value < sensor.min_value || sensor.current_value > sensor.max_value) ? styles.alertaValor : ''
                    }`}
                  >
                    {sensor.current_value}
                  </div>

                </div>
                <div className={styles.valueRow}>
                  <div className={styles.valueBoxSmall}>
                    <p className={styles.valueTitle}>Valor mínimo</p>
                    <div className={styles.valueRectSmall}>{sensor.min_value}</div>
                  </div>
                  <div className={styles.valueBoxSmall}>
                    <p className={styles.valueTitle}>Valor máximo</p>
                    <div className={styles.valueRectSmall}>{sensor.max_value}</div>
                  </div>
                </div>
                <div className={styles.sensorActions}>
                  <Button variant="dark" onClick={() => startEditingSensor(sensor)}>
                    Editar
                  </Button>
                  <Button variant="dark" onClick={() => setDeleteSensorId(sensor.id)}>
                    Apagar
                  </Button>
                </div>
              </div>
            </Card>
          ))}

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

          {/* Modal de confirmação de exclusão */}
          {deleteSensorId !== null && (
            <div className={styles.modalOverlay}>
              <Card className={styles.modalCard}>
                <h2>
                  Tem certeza que deseja apagar o sensor{" "}
                  <em>{sensors.find((s) => s.id === deleteSensorId)?.name}</em>?
                </h2>
                <div className={styles.buttonRow}>
                  <Button variant="light" onClick={() => setDeleteSensorId(null)}>
                    Cancelar
                  </Button>
                  <Button variant="dark" onClick={handleDeleteSensor}>
                    Confirmar
                  </Button>
                </div>
              </Card>
            </div>
          )}
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
      </main>
    </PageLayout>
  );
};
