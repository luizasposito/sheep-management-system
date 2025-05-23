import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Table } from "../../components/Table/Table";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import { RoleOnly } from "../../components/RoleOnly";
import styles from "./AppointmentDetail.module.css";

type Sheep = {
  id: number;
  gender: string;
};

type Medication = {
  id: number;
  name: string;
  dosage?: string;
  indication?: string;
};

type AppointmentDetailData = {
  id: number;
  sheep_ids: number[];
  vet_id: number;
  date: string;
  motivo?: string;
  comentarios?: string;
  medications?: Medication[];
};


export const AppointmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [appointment, setAppointment] = useState<AppointmentDetailData | null>(
    null
  );
  const [sheepList, setSheepList] = useState<Sheep[]>([]);
  const [groupMap, setGroupMap] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!user || !user.role) return;
    if (!(user.role === "farmer" || user.role === "veterinarian")) {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (appointment?.date) {
      const formattedDate = new Date(appointment.date).toLocaleDateString();
      document.title = `Consulta ${formattedDate}`;
    }
  }, [appointment]);

  // Busca dados da consulta
  useEffect(() => {
    if (!id) return;

    const fetchAppointment = async () => {
      try {
        const res = await fetch(`http://localhost:8000/appointment/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar consulta");
        const data = await res.json();
        setAppointment(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAppointment();
  }, [id]);

  // Busca lista de ovelhas
  useEffect(() => {
    const fetchSheep = async () => {
      try {
        const sheepRes = await fetch("http://localhost:8000/sheep", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!sheepRes.ok) throw new Error("Erro ao buscar ovelhas");

        const sheeps: Sheep[] = await sheepRes.json();
        setSheepList(sheeps);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSheep();
  }, []);

  // Preparar dados para exibir os animais da consulta
  const sheepsInAppointment = React.useMemo(() => {
    if (!appointment || sheepList.length === 0) return [];
    return appointment.sheep_ids
      .map((id) => sheepList.find((s) => s.id === id))
      .filter((s): s is Sheep => !!s);
  }, [appointment, sheepList]);

  return (
    <PageLayout>
      <h1 className={styles.title}>
        Detalhes da consulta{" "}
        {appointment ? new Date(appointment.date).toLocaleDateString() : "..."}
      </h1>

      <div className={styles.buttonGroup}>
        <Button variant="light" onClick={() => navigate("/appointment")}>
          Lista de consultas
        </Button>
        <RoleOnly role="veterinarian">
          <Button
            variant="light"
            onClick={() => navigate(`/appointment/${id}/edit`)}
          >
            Editar
          </Button>
        </RoleOnly>
      </div>

      <div className={styles.grid}>
        {/* Listar todos os animais da consulta */}
        <Card className={styles.mainInfo}>
          <h3>Animais na consulta</h3>
          {sheepsInAppointment.length === 0 ? (
            <p>Carregando animais...</p>
          ) : (
            <div className={styles.animalList}>
              {sheepsInAppointment.map((sheep) => (
                <Button
                  variant="dark"
                  onClick={() => navigate(`/animal/${sheep.id}`)}
                >
                  ID: {sheep.id} — Sexo: {sheep.gender}
                </Button>
              ))}
            </div>
          )}
        </Card>

        {/* Motivo */}
        <Card className={`${styles.crias} ${styles.whiteCard}`}>
          <h3>Motivo</h3>
          <p>{appointment?.motivo ?? "Sem motivo informado."}</p>
        </Card>

        {/* Comentários do veterinário */}
        <Card className={`${styles.history} ${styles.whiteCard}`}>
          <h3>Comentários do veterinário</h3>
          <p>{appointment?.comentarios ?? "Sem comentários."}</p>
        </Card>

        {/* Medicação */}
        <Card>
          <h3>Medicamentos Prescritos</h3>
          {appointment?.medications && appointment.medications.length > 0 ? (
            <Table
              headers={["Nome", "Dosagem", "Indicação"]}
              data={appointment.medications.map((med) => [
                med.name,
                med.dosage || "-",
                med.indication || "-",
              ])}
            />
          ) : (
            <p>Nenhum medicamento prescrito.</p>
          )}
        </Card>


      </div>
    </PageLayout>
  );
};
