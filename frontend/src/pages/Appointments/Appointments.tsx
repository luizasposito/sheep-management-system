import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import { useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import { RoleOnly } from "../../components/RoleOnly";
import styles from "./Appointments.module.css";
import "react-calendar/dist/Calendar.css";

type Appointment = {
  id: string;
  data: string;
  ovelhaId: string;
  sexo: "Fêmea" | "Macho";
  grupo: string;
  animais: string[];
  motivo: string;
};

type Sheep = {
  id: number;
  gender: string;
  group_id: number | null;
};

type SheepGroup = {
  id: number;
  name: string;
};

// Função para comparar apenas ano, mês e dia ignorando horário/fuso
const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const Appointments: React.FC = () => {
  useEffect(() => {
    document.title = "Consultas";
  }, []);

  const [appointmentData, setAppointmentData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"futuras" | "historico">("futuras");

  const [filterSexo, setFilterSexo] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [viewMode, setViewMode] = useState<"calendario" | "lista">("lista");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [sheepMap, setSheepMap] = useState<Record<number, Sheep>>({});
  const [groupMap, setGroupMap] = useState<Record<number, string>>({});
  const [filterGroups, setFilterGroups] = useState<string[]>([]);

  const navigate = useNavigate();
  const { user } = useUser();

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialTab = params.get("tab");

    if (initialTab === "historico" || initialTab === "futuras") {
      setTab(initialTab);
    }
  }, [location.search]);


  useEffect(() => {
    if (!user || !user.role) return;
    if (!(user.role === "farmer" || user.role === "veterinarian")) {
      navigate("/unauthorized");
    }
  }, [user]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("http://localhost:8000/appointment", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar consultas");
        }

        const data = await response.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const formatted = data.map((item: any) => {
          const animais = item.sheep_ids.map((id: number) => id.toString());
          const primeiroSheep = sheepMap[item.sheep_ids[0]];

            return {
              id: item.id.toString(),
              data: item.date.split("T")[0],
              ovelhaId: primeiroSheep?.id.toString() || "-",
              sexo: primeiroSheep?.gender === "Macho" ? "Macho" : "Fêmea",
              grupo: primeiroSheep?.group_id
                ? groupMap[primeiroSheep.group_id] || "Sem grupo"
                : "Sem grupo",
              animais,
              motivo: item.motivo || "Sem motivo especificado",
            };
          });

        setAppointmentData(formatted);
      } catch (error) {
        console.error("Erro ao carregar consultas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [sheepMap, groupMap]);

  useEffect(() => {
    const fetchSheepAndGroups = async () => {
      try {
        const [sheepRes, groupRes] = await Promise.all([
          fetch("http://localhost:8000/sheep", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          fetch("http://localhost:8000/sheep-group", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ]);

        if (!sheepRes.ok || !groupRes.ok) throw new Error("Erro ao buscar dados");

        const sheepData: Sheep[] = await sheepRes.json();
        const groupData: SheepGroup[] = await groupRes.json();

        const sheepDict = sheepData.reduce((acc, sheep) => {
          acc[sheep.id] = sheep;
          return acc;
        }, {} as Record<number, Sheep>);

        const groupDict = groupData.reduce((acc, group) => {
          acc[group.id] = group.name;
          return acc;
        }, {} as Record<number, string>);

        setSheepMap(sheepDict);
        setGroupMap(groupDict);
      } catch (error) {
        console.error("Erro ao buscar ovelhas/grupos", error);
      }
    };

    fetchSheepAndGroups();
  }, []);

  const toggleFilter = (
    value: string,
    filterState: string[],
    setFilterState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setFilterState((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const applyFilters = (appointment: Appointment) => {
    const matchesSearch =
      appointment.ovelhaId.includes(searchTerm) ||
      appointment.grupo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSexo =
      filterSexo.length === 0 || filterSexo.includes(appointment.sexo);

    const matchesGroup =
      filterGroups.length === 0 || filterGroups.includes(appointment.grupo || "");

    return matchesSearch && matchesSexo && matchesGroup;
  };

  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointmentsByTab = viewMode === "calendario"
    ? appointmentData
    : appointmentData.filter((item) => {
        const itemDate = new Date(item.data);
        itemDate.setHours(0, 0, 0, 0);
        return tab === "futuras" ? itemDate >= today : itemDate < today;
      });


  // Aplicar filtros para lista e calendário
  const filteredAppointments = appointmentsByTab.filter(applyFilters);

  // Datas marcadas baseadas em filteredAppointments
  const datasMarcadas = new Set(
    filteredAppointments.map((appointment) => new Date(appointment.data).toDateString())
  );

  // Consultas do dia aplicando filtro também
  const consultasDoDia = selectedDate
    ? filteredAppointments.filter((appointment) => {
        const appDate = new Date(appointment.data);
        return isSameDate(appDate, selectedDate);
      })
    : [];

  const toggleView = () => {
    setViewMode(viewMode === "lista" ? "calendario" : "lista");
    setSelectedDate(null);
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Consultas</h1>

      <div className={styles.buttonGroup}>
        <RoleOnly role="farmer">
          <Button variant="light" onClick={() => navigate("/appointment/add")}>
            Agendar consulta
          </Button>
        </RoleOnly>

        {viewMode === "lista" && (
          <>
            <Button
              variant={tab === "futuras" ? "dark" : "light"}
              onClick={() => setTab("futuras")}
            >
              Próximas consultas
            </Button>
            <Button
              variant={tab === "historico" ? "dark" : "light"}
              onClick={() => setTab("historico")}
            >
              Histórico de consultas
            </Button>
          </>
        )}

        <Button
          variant="light"
          onClick={toggleView}
        >
          {viewMode === "calendario" ? "Calendário" : "Lista"} - Alternar para {viewMode === "calendario" ? "lista" : "calendário"}
        </Button>
      </div>


      <div className={styles.searchBar}>
        <SearchInput
          placeholder="Pesquisar pelo ID do animal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.content}>
        <aside className={styles.filters}>
          <h3>Filtrar por</h3>

          <div className={styles.filterGroup}>
            <strong>Sexo</strong>
            {["Fêmea", "Macho"].map((sexo) => (
              <label key={sexo}>
                <input
                  type="checkbox"
                  checked={filterSexo.includes(sexo)}
                  onChange={() => toggleFilter(sexo, filterSexo, setFilterSexo)}
                />
                <span>{sexo}</span>
              </label>
            ))}
          </div>

          {user?.role === "farmer" && (
            <div className={styles.filterGroup}>
              <strong>Grupo</strong>
              {Object.values(groupMap).map((groupName) => (
                <label key={groupName}>
                  <input
                    type="checkbox"
                    checked={filterGroups.includes(groupName)}
                    onChange={() => toggleFilter(groupName, filterGroups, setFilterGroups)}
                  />
                  <span>{groupName}</span>
                </label>
              ))}
            </div>
          )}
        </aside>


        <section className={styles.cards}>
          {loading ? (
            <p>Carregando consultas...</p>
          ) : viewMode === "lista" ? (
            filteredAppointments.length === 0 ? (
              <p>Nenhuma consulta encontrada.</p>
            ) : (
              filteredAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className={styles.clickableCard}
                  onClick={() => navigate(`/appointment/${appointment.id}`)}
                >
                  <div className={styles.cardContent}>
                    <p>
                      <strong>Data:</strong> {appointment.data}
                    </p>
                    <p>
                      <strong>Animais associados:</strong> {appointment.animais.join(", ")}
                    </p>
                    <p>
                      <strong>Motivo:</strong> {appointment.motivo}
                    </p>
                  </div>
                </Card>
              ))
            )
          ) : (
            <div className={styles.calendarView}>
              <Calendar
                onClickDay={setSelectedDate}
                tileContent={({ date }) => {
                  const dateStr = date.toDateString();
                  return datasMarcadas.has(dateStr) ? (
                    <div className={styles.dot}></div>
                  ) : null;
                }}
              />
              {selectedDate && (
                <div className={styles.dayDetails}>
                  <h4>Consultas em {selectedDate.toLocaleDateString()}</h4>
                  {consultasDoDia.length === 0 ? (
                    <p>Nenhuma consulta neste dia.</p>
                  ) : (
                    consultasDoDia.map((appointment) => (
                      <Card
                        key={appointment.id}
                        className={styles.historyItem}
                        onClick={() => navigate(`/appointment/${appointment.id}`)}
                      >
                        <p>
                          <strong>Animais associados:</strong> {appointment.animais.join(", ")}
                        </p>
                        <p>
                          <strong>Motivo:</strong> {appointment.motivo}
                        </p>
                        <p>
                          <strong>Grupo:</strong> {appointment.grupo}
                        </p>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
};
