
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import { RoleOnly } from "../../components/RoleOnly";
import Calendar from "react-calendar"; // Adicionando o componente de calendário
import styles from "./Appointments.module.css";
import "react-calendar/dist/Calendar.css"; // Estilos do calendário

type Appointment = {
  id: string;
  data: string;
  status: "Cria" | "Pré-parto" | "Pós-parto";
  ovelhaId: string;
  sexo: "Fêmea" | "Macho";
  titulo: string;  // Adicionando título
  animais: string[]; // Adicionando animais associados
  motivo: string; // Adicionando motivo
};

const appointmentData: Appointment[] = [
  { id: "A001", data: "2025-11-01", status: "Pós-parto", ovelhaId: "001", sexo: "Fêmea", titulo: "Consulta de rotina", animais: ["A001"], motivo: "Exame preventivo" },
  { id: "A002", data: "2025-11-03", status: "Cria", ovelhaId: "002", sexo: "Macho", titulo: "Primeira consulta", animais: ["A002"], motivo: "Monitoramento de saúde" },
  { id: "A003", data: "2025-11-05", status: "Pré-parto", ovelhaId: "003", sexo: "Fêmea", titulo: "Pré-parto", animais: ["A003"], motivo: "Preparação para o parto" },
];

export const Appointments: React.FC = () => {
  useEffect(() => {
    document.title = "Consultas";
  }, []);

  const [filterSexo, setFilterSexo] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"calendario" | "lista">("lista");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (!user || !user.role) return;
    if (!(user.role === "farmer" || user.role === "vet")) {
      navigate("/unauthorized");
    }
  }, [user]);

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
      appointment.status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSexo =
      filterSexo.length === 0 || filterSexo.includes(appointment.sexo);

    const matchesStatus =
      filterStatus.length === 0 || filterStatus.includes(appointment.status);

    return matchesSearch && matchesSexo && matchesStatus;
  };

  const filteredAppointments = appointmentData.filter(applyFilters);

  const toggleView = () => {
    setViewMode(viewMode === "lista" ? "calendario" : "lista");
    setSelectedDate(null); // Resetar a data selecionada ao alternar a visualização
  };

  const consultasDoDia = selectedDate
    ? appointmentData.filter(
        (appointment) => appointment.data === selectedDate.toISOString().split("T")[0]
      )
    : [];

  const datasMarcadas = new Set(appointmentData.map((appointment) => appointment.data));

  return (
    <PageLayout>
      <h1 className={styles.title}>Consultas</h1>

      <div className={styles.buttonGroup}>
        <RoleOnly role="farmer">
          <Button variant="light" onClick={() => navigate("/appointment/add")}>
            Agendar consulta
          </Button>
        </RoleOnly>
        <Button variant="dark" onClick={() => navigate("/appointment")}>
          Consultas
        </Button>
        <Button variant="light" onClick={() => navigate("/appointment/history")}>
          Histórico de consultas
        </Button>
        <Button variant="light" onClick={toggleView}>
          Alternar para {viewMode === "calendario" ? "lista" : "calendário"}
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

          <div className={styles.filterGroup}>
            <strong>Status</strong>
            {["Cria", "Pré-parto", "Pós-parto"].map((status) => (
              <label key={status}>
                <input
                  type="checkbox"
                  checked={filterStatus.includes(status)}
                  onChange={() => toggleFilter(status, filterStatus, setFilterStatus)}
                />
                <span>{status}</span>
              </label>
            ))}
          </div>
        </aside>

        <section className={styles.cards}>
          {viewMode === "lista" ? (
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
                      <strong>Título:</strong> {appointment.titulo}
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
                  const dateStr = date.toISOString().split("T")[0];
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
                          <strong>Título:</strong> {appointment.titulo}
                        </p>
                        <p>
                          <strong>Animais associados:</strong> {appointment.animais.join(", ")}
                        </p>
                        <p>
                          <strong>Motivo:</strong> {appointment.motivo}
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
