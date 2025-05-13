import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "../../components/Layout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./AppointmentEdit.module.css";

type Medication = {
  name: string;
  dosage: string;
  instructions: string;
};

export const AppointmentEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState("");
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", instructions: "" }
  ]);

  useEffect(() => {
    document.title = "Editar Consulta";
    // fetch consulta existente para preencher os campos, se necessário
    // Exemplo (mock):
    // setComments("Animal com febre");
    // setMedications([{ name: "Dipirona", dosage: "10ml", instructions: "2x ao dia" }]);
  }, []);

  const handleMedicationChange = (
    index: number,
    field: keyof Medication,
    value: string
  ) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", instructions: "" }]);
  };

  const removeMedication = (index: number) => {
    const updated = medications.filter((_, i) => i !== index);
    setMedications(updated);
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Editar Consulta {id}</h1>

      <form className={styles.form}>
        <Card className={styles.card}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
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
                      handleMedicationChange(index, "name", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Dosagem"
                    value={med.dosage}
                    onChange={(e) =>
                      handleMedicationChange(index, "dosage", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Indicações"
                    value={med.instructions}
                    onChange={(e) =>
                      handleMedicationChange(index, "instructions", e.target.value)
                    }
                  />
                  <Button variant="dark" type="button" onClick={() => removeMedication(index)}>
                    Remover
                  </Button>
                </div>
              ))}
              <Button variant="dark" type="button" onClick={addMedication}>
                Adicionar medicamento
              </Button>
            </div>
          </div>
        </Card>

        <div className={styles.buttonGroup}>
          <Button variant="dark" type="submit">Salvar</Button>
          <Button variant="light" type="button" onClick={() => navigate(`/appointment/${id}`)}>
            Cancelar
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};
