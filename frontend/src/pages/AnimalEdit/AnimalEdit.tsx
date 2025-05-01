
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "../../components/Layout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./AnimalEdit.module.css";

export const AnimalEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
        document.title = "Editar Animal";
      }, []);

  return (
    <PageLayout>
      <h1 className={styles.title}>Editar Animal {id}</h1>

      <form className={styles.form}>
        <Card className={styles.card}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <label>
                Sexo:
                <select defaultValue="">
                  <option value="">Selecione</option>
                  <option value="fêmea">Fêmea</option>
                  <option value="macho">Macho</option>
                </select>
              </label>

              <label>
                Status:
                <select defaultValue="">
                  <option value="">Selecione</option>
                  <option value="Cria">Cria</option>
                  <option value="Pré-parto">Pré-parto</option>
                  <option value="Pós-parto">Pós-parto</option>
                </select>
              </label>

              <label>
                Produção leiteira (em litros):
                <input type="number" placeholder="Litros" />
              </label>
            </div>

            <div className={styles.rightColumn}>
              <label>
                Pai:
                <input type="text" placeholder="ID do pai" />
              </label>

              <label>
                Mãe:
                <input type="text" placeholder="ID da mãe" />
              </label>
            </div>
          </div>
        </Card>

        <div className={styles.buttonGroup}>
          <Button variant="dark">Salvar</Button>
          <Button variant="light" type="button" onClick={() => navigate(`/animal/${id}`)}>Cancelar</Button>
        </div>
      </form>
    </PageLayout>
  );
};
