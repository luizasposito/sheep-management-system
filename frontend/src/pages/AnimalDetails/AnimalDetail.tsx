import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import { RoleOnly } from "../../components/RoleOnly";
import styles from "./AnimalDetail.module.css";
import "react-calendar/dist/Calendar.css";

type Consulta = {
  id: number;
  data: string;
  motivo: string;
};

type Animal = {
  id: number;
  gender: string;
  birth_date: string;
  feeding_hay: number;
  feeding_feed: number;
  farm_id: number;
  group_id?: number;
  milk_production?: number;
};

type SheepGroup = {
  id: number;
  name: string;
  description?: string;
  farm_id: number;
};

export const AnimalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [group, setGroup] = useState<SheepGroup | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [viewMode, setViewMode] = useState<"calendario" | "lista">("lista");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [parents, setParents] = useState<Animal[]>([]);
  const [children, setChildren] = useState<Animal[]>([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    document.title = "Detalhes animal";
    if (!id || !token) return;

    const fetchAnimal = async () => {
      try {
        const res = await fetch(`http://localhost:8000/sheep/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar animal");
        const data = await res.json();
        setAnimal(data);

        if (data.group_id) {
          const groupRes = await fetch(`http://localhost:8000/sheep-group/${data.group_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (groupRes.ok) {
            const groupData = await groupRes.json();
            setGroup(groupData);
          }
        }

        // Fetch parents
        const parentsRes = await fetch(`http://localhost:8000/sheep/${id}/parents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (parentsRes.ok) {
          const parentData = await parentsRes.json();
          setParents(parentData);
        }

        // Fetch children
        const childrenRes = await fetch(`http://localhost:8000/sheep/${id}/children`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (childrenRes.ok) {
          const childrenData = await childrenRes.json();
          setChildren(childrenData);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    const fetchConsultas = async () => {
      try {
        const res = await fetch(`http://localhost:8000/appointment?sheep_id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar consultas");
        const data = await res.json();
        setConsultas(
          data.map((c: any) => ({
            id: c.id,
            data: c.date.split("T")[0],
            motivo: c.motivo || "Sem motivo informado",
          }))
        );
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchAnimal();
    fetchConsultas();
  }, [id, token]);

  const consultasDoDia = selectedDate
    ? consultas.filter(c => c.data === selectedDate.toISOString().split("T")[0])
    : [];

  const datasMarcadas = new Set(consultas.map(c => c.data));

  const toggleView = () => {
    setViewMode(viewMode === "lista" ? "calendario" : "lista");
    setSelectedDate(null);
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Animal {id}</h1>

      <div className={styles.buttonGroup}>
        <Button variant="light" onClick={() => navigate(`/animal`)}>Lista de animais</Button>
        <RoleOnly role="farmer">
          <Button variant="light" onClick={() => navigate(`/animal/${id}/edit`)}>Editar</Button>
        </RoleOnly>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.grid}>
        {/* Dados principais */}
        <Card className={styles.mainInfo}>
          <div className={styles.columns}>
            <div>
              <p><strong>ID:</strong> {id}</p>
              <p><strong>Sexo:</strong> {animal?.gender || "Carregando..."}</p>
              <strong>Pai e Mãe</strong>
              <div className={styles.chipList}>
                {parents.length === 0 ? (
                  <p>Nenhuma informação disponível.</p>
                ) : (
                  parents.map((parent) => (
                    <Button
                      key={parent.id}
                      variant="dark"
                      onClick={() => navigate(`/animal/${parent.id}`)}
                    >
                      {parent.gender.toLowerCase() === "macho" ? `Pai - ${parent.id}` : `Mãe - ${parent.id}`}
                    </Button>
                  ))
                )}
              </div>
            </div>
            <div>
              <p><strong>Grupo:</strong> {group?.name || "Sem grupo"}</p>
              {/* Exibir produção leiteira só se for fêmea */}
              {animal?.gender === "Fêmea" && (
                <p><strong>Produção leiteira (em litros):</strong> {animal.milk_production ?? "N/D"} L</p>
              )}
              <p><strong>Fardo para ingestão diária:</strong> {animal?.feeding_hay ?? "N/D"} kg</p>
              <p><strong>Ração para ingestão diária:</strong> {animal?.feeding_feed ?? "N/D"} kg</p>
            </div>
          </div>
        </Card>

        {/* Crias */}
        <Card className={styles.crias}>
          <h3>Crias</h3>
          <div className={styles.chipGrid}>
            {children.length === 0 ? (
              <p>Nenhuma cria registrada.</p>
            ) : (
              children.map((child) => (
                <Button
                  key={child.id}
                  variant="dark"
                  onClick={() => navigate(`/animal/${child.id}`)}
                >
                  C{child.id}
                </Button>
              ))
            )}
          </div>
        </Card>

        {/* Visualização de marcações */}
        <Card className={styles.calendar}>
          <div className={styles.calendarHeader}>
            <h3>Consultas</h3>
            <Button variant="dark" onClick={toggleView}>
              Alternar para {viewMode === "calendario" ? "lista" : "calendário"}
            </Button>
          </div>

          {viewMode === "lista" ? (
            <div className={styles.scrollArea}>
              {consultas.map((c) => (
                <Card
                  key={c.id}
                  className={styles.historyItem}
                  onClick={() => navigate(`/appointment/${c.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <p><strong>Data:</strong> {c.data}</p>
                  <p><strong>Motivo:</strong> {c.motivo}</p>
                </Card>
              ))}

            </div>
          ) : (
            <div className={styles.calendarGrid}>
              <Calendar
                onClickDay={setSelectedDate}
                tileContent={({ date }) => {
                  const dateStr = date.toISOString().split("T")[0];
                  return datasMarcadas.has(dateStr) ? <div className={styles.dot}></div> : null;
                }}
              />
              {selectedDate && (
                <div className={styles.dayDetails}>
                  <h4>Consultas em {selectedDate.toLocaleDateString()}</h4>
                  {consultasDoDia.length === 0 ? (
                    <p>Nenhuma consulta neste dia.</p>
                  ) : (
                    consultasDoDia.map((c) => (
                      <Card
                        key={c.id}
                        className={styles.historyItem}
                        onClick={() => navigate(`/appointment/${c.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <p><strong>Motivo:</strong> {c.motivo}</p>
                      </Card>
                    ))

                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  );
};
