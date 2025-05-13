
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./AnimalCreate.module.css"; // reutilizando os mesmos estilos

export const AnimalCreate: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Adicionar Animal";
  }, []);

  // Estados locais para os campos do formulário
  const [sexo, setSexo] = useState("");
  const [status, setStatus] = useState("");
  const [producaoLeiteira, setProducaoLeiteira] = useState("");
  const [pai, setPai] = useState("");
  const [mae, setMae] = useState("");
  const [comentarios, setComentarios] = useState("");

  // Geração fictícia de ID e data atual
  const generatedId = "00X"; // Substituir por lógica real
  const nascimento = new Date().toISOString().split("T")[0]; // formato yyyy-mm-dd

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const novoAnimal = {
      id: generatedId,
      dataNascimento: nascimento,
      sexo,
      status,
      producaoLeiteira,
      pai,
      mae,
      comentarios,
    };

    console.log("Novo animal:", novoAnimal);

    // Aqui você pode fazer o POST para o backend...

    navigate("/animal"); // redirecionar após salvar
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Adicionar novo animal</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Card className={styles.card}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <label>
                ID:
                <input type="text" value={generatedId} readOnly />
              </label>

              <label>
                Data de nascimento:
                <input type="date" value={nascimento} readOnly />
              </label>

              <label>
                Sexo:
                <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="Fêmea">Fêmea</option>
                  <option value="Macho">Macho</option>
                </select>
              </label>

              <label>
                Status:
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="Cria">Cria</option>
                  <option value="Prenha">Prenha</option>
                  <option value="Pós-parto">Pós-parto</option>
                  <option value="Macho">Macho</option>
                </select>
              </label>

              <label>
                Produção leiteira (em litros):
                <input
                  type="number"
                  value={producaoLeiteira}
                  onChange={(e) => setProducaoLeiteira(e.target.value)}
                  placeholder="Litros"
                />
              </label>
            </div>

            <div className={styles.rightColumn}>
              <label>
                Pai:
                <input
                  type="text"
                  value={pai}
                  onChange={(e) => setPai(e.target.value)}
                  placeholder="ID do pai"
                />
              </label>

              <label>
                Mãe:
                <input
                  type="text"
                  value={mae}
                  onChange={(e) => setMae(e.target.value)}
                  placeholder="ID da mãe"
                />
              </label>
            </div>
          </div>

          {/* Campo de comentários */}
          <label className={styles.fullWidth}>
            Comentários:
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={4}
              placeholder="Informações adicionais sobre o animal"
            />
          </label>
        </Card>

        <div className={styles.buttonGroup}>
          <Button variant="dark" type="submit">Salvar</Button>
          <Button variant="light" type="button" onClick={() => navigate("/animal")}>Cancelar</Button>
        </div>
      </form>
    </PageLayout>
  );
};
