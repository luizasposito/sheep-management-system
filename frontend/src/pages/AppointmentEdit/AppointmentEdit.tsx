import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import { API_URL } from "../../config";
import styles from "./AppointmentEdit.module.css";

type Medication = {
  name: string;
  dosage: string;
  indication: string;
};

type AppointmentData = {
  id: number;
  vet_id: number;
  date: string;
  medications?: Medication[];
};

export const AppointmentEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState<string>("");

  const [comments, setComments] = useState("");
  const [motivo, setMotivo] = useState("");
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", indication: "" },
  ]);

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // null = carregando

  const token = localStorage.getItem("token");
  const { user } = useUser();
  const role = user?.role;

  const [initialState, setInitialState] = useState({
    comments: "",
    motivo: "",
    medications: [] as Medication[],
  });


  // Verificar role corretamente
  useEffect(() => {
    console.log("Role:", role);
    if (role === undefined) return; // Ainda carregando
    if (role !== "veterinarian") {
      navigate("/unauthorized");
    } else {
      setIsAuthorized(true);
    }
  }, [role, navigate]);


  // Título da página
  useEffect(() => {
    document.title = "Editar Consulta";
  }, []);

  // Buscar dados da consulta
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`${API_URL}/appointment/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao carregar consulta");
        const data = await res.json();

        setComments(data.comentarios || "");
        setDate(data.date || "");
        setMotivo(data.motivo || "");
        setMedications(data.medications || []);
        setInitialState({
          comments: data.comentarios || "",
          motivo: data.motivo || "",
          medications: data.medications || [],
        });

      } catch (err) {
        console.error(err);
      }
    };

    if (token) {
      fetchAppointment();
    }
  }, [id, token]);

  const handleMedicationChange = (
    index: number,
    field: keyof Medication,
    value: string
  ) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const hasChanges = () => {
    const medsChanged = JSON.stringify(initialState.medications) !== JSON.stringify(medications);
    const motivoChanged = motivo !== initialState.motivo;
    const commentsChanged = comments !== initialState.comments;
    return motivoChanged || commentsChanged || medsChanged;
  };


  const addMedication = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", indication: "" },
    ]);
  };

  const removeMedication = (index: number) => {
    const updated = medications.filter((_, i) => i !== index);
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validMedications = medications.filter(med => med.name.trim() !== "");

      const res = await fetch(`${API_URL}/appointment/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          motivo,
          comentarios: comments,
          date: date,
          medications: validMedications.map((med) => ({
            name: med.name,
            dosage: med.dosage,
            indication: med.indication,
          })),
        }),
      });


      if (!res.ok) throw new Error("Erro ao salvar consulta");
      navigate(`/appointment/${id}`);
    } catch (err) {
      console.error(err);
      alert("Falha ao salvar.");
    }
  };

  // Enquanto não autorizou, não renderiza
  if (isAuthorized === null) return null;

  return (
    <PageLayout>
      <h1 className={styles.title}>
        Editar Consulta{" "}
        {date ? new Date(date).toLocaleDateString() : id}
      </h1>


      <form className={styles.form} onSubmit={handleSubmit}>
        <Card>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <label>
                Motivo:
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Motivo da consulta"
                />
              </label>

              <label>
                Comentários:
                <textarea
                  className={styles.textarea}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Descreva os sintomas ou observações"
                />
              </label>
            </div>

            <div className={styles.rightColumn}>
              <label>Medicamentos:</label>
              {medications.map((med, index) => (
                <div key={index} className={styles.medicationItem}>
                  <input
                    type="text"
                    placeholder="Nome"
                    value={med.name}
                    onChange={(e) =>
                      handleMedicationChange(index, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Dosagem"
                    value={med.dosage}
                    onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Indicações"
                    value={med.indication}
                    onChange={(e) => handleMedicationChange(index, "indication", e.target.value)}
                  />
                  <Button
                    variant="dark"
                    type="button"
                    onClick={() => removeMedication(index)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
              <Button
                variant="dark"
                type="button"
                onClick={addMedication}
              >
                Adicionar medicamento
              </Button>
            </div>
          </div>
        </Card>

        <div className={styles.buttonGroup}>
          <Button
            variant="light"
            type="button"
            onClick={() => navigate(`/appointment/${id}`)}
          >
            Cancelar
          </Button>
          <Button
            variant="dark"
            type="submit"
            disabled={!hasChanges()}
          >
            Salvar
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};
