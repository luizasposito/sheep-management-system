import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import { PageLayout } from "../../components/Layout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import { RoleOnly } from "../../components/RoleOnly";
import styles from "./AnimalDetail.module.css";
import "react-calendar/dist/Calendar.css"; // calendário base

type Consulta = {
  data: string;
  titulo: string;
  animais: string[];
  motivo: string;
};

const mockConsultas: Consulta[] = [
  {
    data: "2025-05-12",
    titulo: "Vacinação coletiva",
    animais: ["A123", "B456"],
    motivo: "Aplicação da vacina anual"
  },
  {
    data: "2025-05-15",
    titulo: "Consulta de rotina",
    animais: ["A123"],
    motivo: "Exame preventivo"
  }
];

export const AnimalDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"calendario" | "lista">("lista");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    document.title = "Detalhes Animal";

    // Simulando fetch de dados
    setAnimal({
      sexo: "Fêmea",
      status: "Ativa",
      producao: 22,
      comentario: "Animal saudável e com excelente produção"
    });
  }, [id]);

  const consultasDoDia = selectedDate
    ? mockConsultas.filter(c => c.data === selectedDate.toISOString().split("T")[0])
    : [];

  const datasMarcadas = new Set(mockConsultas.map(c => c.data));

  const toggleView = () => {
    setViewMode(viewMode === "lista" ? "calendario" : "lista");
    setSelectedDate(null);
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Animal {id}</h1>

      <div className={styles.buttonGroup}>
        <RoleOnly role="farmer">
          <Button variant="light" onClick={() => navigate(`/animal/${id}/edit`)}>Editar</Button>
        </RoleOnly>
      </div>

      <div className={styles.grid}>
        {/* Dados principais */}
        <Card className={styles.mainInfo}>
          <div className={styles.columns}>
            <div>
              <p><strong>ID:</strong> {id}</p>
              <p><strong>Sexo:</strong> {animal?.sexo || "Carregando..."}</p>
            </div>
            <div>
              <p><strong>Status:</strong> {animal?.status || "Carregando..."}</p>
              <p><strong>Produção leiteira (em litros):</strong> {animal?.producao ?? "Carregando..."}</p>
            </div>
          </div>

          <div>
            <strong>Pai e Mãe</strong>
            <div className={styles.chipList}>
              <Button variant="dark">P123</Button>
              <Button variant="dark">M456</Button>
            </div>
          </div>

          <div className={styles.commentsSection}>
            <h3>Comentários</h3>
            <p className={styles.commentText}>{animal?.comentario || "Nenhum comentário disponível."}</p>
          </div>
        </Card>

        {/* Crias */}
        <Card className={styles.crias}>
          <h3>Crias</h3>
          <div className={styles.chipGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Button key={i} variant="dark">&lt;id&gt;</Button>
            ))}
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
              {mockConsultas.map((c, i) => (
                <Card key={i} className={styles.historyItem}>
                  <p><strong>Data:</strong> {c.data}</p>
                  <p><strong>Título:</strong> {c.titulo}</p>
                  <p><strong>Animais:</strong> {c.animais.join(", ")}</p>
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
                    consultasDoDia.map((c, i) => (
                      <Card key={i} className={styles.historyItem}>
                        <p><strong>Título:</strong> {c.titulo}</p>
                        <p><strong>Animais:</strong> {c.animais.join(", ")}</p>
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
