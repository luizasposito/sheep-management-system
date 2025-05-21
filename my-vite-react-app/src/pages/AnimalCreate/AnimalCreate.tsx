// AnimalCreate.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./AnimalCreate.module.css";

export const AnimalCreate: React.FC = () => {
  const navigate = useNavigate();

  const [sexo, setSexo] = useState("");
  const [producaoLeiteira, setProducaoLeiteira] = useState("");
  const [nascimento, setNascimento] = useState(() => new Date().toISOString().split("T")[0]);
  const [fatherId, setFatherId] = useState("");
  const [motherId, setMotherId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [farmId, setFarmId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Adicionar Animal";

    const fetchFarmId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Usuário não autenticado.");

        const response = await fetch("http://localhost:8000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erro ao buscar informações do usuário.");

        const userData = await response.json();
        setFarmId(userData.farm_id);
      } catch (err: any) {
        setError(err.message || "Erro ao buscar fazenda do usuário.");
      }
    };

    fetchFarmId();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!farmId) {
      setError("ID da fazenda não encontrado.");
      setLoading(false);
      return;
    }

    const novoAnimal: any = {
      birth_date: nascimento,
      gender: sexo.trim(),
      status: status.trim(),
      feeding_hay: 0,
      feeding_feed: 0,
      farm_id: farmId,
    };

    // Campos opcionais: IDs dos pais
    if (fatherId.trim() !== "") novoAnimal.father_id = parseInt(fatherId);
    if (motherId.trim() !== "") novoAnimal.mother_id = parseInt(motherId);

    if (!novoAnimal.gender) {
      setError("Por favor, preencha os campos obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      const animalResponse = await fetch("http://localhost:8000/sheep/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(novoAnimal),
      });

      if (!animalResponse.ok) {
        const errData = await animalResponse.json().catch(() => ({}));
        throw new Error(errData.detail || "Erro ao adicionar animal.");
      }

      const animalData = await animalResponse.json();
      const animalId = animalData.id;

      const volume = parseFloat(producaoLeiteira);
      if (!isNaN(volume) && volume >= 0) {
        const milkData = {
          date: nascimento,
          volume,
        };

        const milkResponse = await fetch(`http://localhost:8000/sheep/${animalId}/milk-yield`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(milkData),
        });

        if (!milkResponse.ok) {
          const milkErr = await milkResponse.json().catch(() => ({}));
          throw new Error(milkErr.detail || "Erro ao registrar produção de leite.");
        }
      }

      navigate("/animal");
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Adicionar novo animal</h1>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Card className={styles.card}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <label>
                Data de nascimento:
                <input
                  type="date"
                  value={nascimento}
                  onChange={(e) => setNascimento(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                  disabled={loading}
                />
              </label>

              <label>
                Sexo:
                <select value={sexo} onChange={(e) => setSexo(e.target.value)} disabled={loading} required>
                  <option value="">Selecione</option>
                  <option value="Fêmea">Fêmea</option>
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
                  min="0"
                  step="any"
                  disabled={loading}
                />
              </label>

              <label>
                ID Pai (opcional):
                <input
                  type="number"
                  value={fatherId}
                  onChange={(e) => setFatherId(e.target.value)}
                  min="1"
                  disabled={loading}
                />
              </label>

              <label>
                ID Mãe (opcional):
                <input
                  type="number"
                  value={motherId}
                  onChange={(e) => setMotherId(e.target.value)}
                  min="1"
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </Card>

        <div className={styles.buttonGroup}>
          <Button variant="dark" type="submit" disabled={loading || !farmId}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="light" type="button" onClick={() => navigate("/animal")} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};
