import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "../../components/Layout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./AnimalEdit.module.css";

// Mock de dados existentes do animal
const mockAnimalData = {
  sexo: "fêmea",
  status: "Pré-parto",
  producao: 20,
  pai: "P123",
  mae: "M456"
};

export const AnimalEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    sexo: "",
    status: "",
    producao: "",
    pai: "",
    mae: ""
  });

  const [original, setOriginal] = useState<typeof form | null>(null);

  useEffect(() => {
    document.title = "Editar Animal";

    // Simulando fetch
    const data = mockAnimalData;
    setForm(data);
    setOriginal(data);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const isModified = JSON.stringify(form) !== JSON.stringify(original);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simula o envio para a API
    console.log("Dados salvos:", form);
    navigate(`/animal/${id}`);
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Editar Animal {id}</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Card className={styles.card}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <label>
                Sexo:
                <select name="sexo" value={form.sexo} onChange={handleChange}>
                  <option value="">Selecione</option>
                  <option value="fêmea">Fêmea</option>
                  <option value="macho">Macho</option>
                </select>
              </label>

              <label>
                Status:
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="">Selecione</option>
                  <option value="Cria">Cria</option>
                  <option value="Pré-parto">Pré-parto</option>
                  <option value="Pós-parto">Pós-parto</option>
                </select>
              </label>

              <label>
                Produção leiteira (em litros):
                <input
                  name="producao"
                  type="number"
                  value={form.producao}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className={styles.rightColumn}>
              <label>
                Pai:
                <input
                  name="pai"
                  type="text"
                  value={form.pai}
                  onChange={handleChange}
                />
              </label>

              <label>
                Mãe:
                <input
                  name="mae"
                  type="text"
                  value={form.mae}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>
        </Card>

        <div className={styles.buttonGroup}>
          <Button variant="dark" type="submit" disabled={!isModified}>
            Salvar
          </Button>
          <Button variant="light" type="button" onClick={() => navigate(`/animal/${id}`)}>
            Cancelar
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};
