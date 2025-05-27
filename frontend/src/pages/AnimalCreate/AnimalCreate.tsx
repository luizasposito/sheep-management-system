import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./AnimalCreate.module.css";

export const AnimalCreate: React.FC = () => {
  const navigate = useNavigate();

  const [sexo, setSexo] = useState("");
  const [nascimento, setNascimento] = useState(() => new Date().toISOString().split("T")[0]);
  const [fatherId, setFatherId] = useState("");
  const [motherId, setMotherId] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [farmId, setFarmId] = useState<number | null>(null);
  const [farmAnimals, setFarmAnimals] = useState<any[]>([]);

  const [feedingHay, setFeedingHay] = useState(0);
  const [feedingFeed, setFeedingFeed] = useState(0);


  useEffect(() => {
    document.title = "Adicionar Animal";

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Usuário não autenticado.");

        // Buscar dados do usuário
        const userRes = await fetch("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error("Erro ao buscar informações do usuário.");
        const userData = await userRes.json();
        setFarmId(userData.farm_id);

        // Buscar animais da fazenda
        const animalsRes = await fetch("http://localhost:8000/sheep", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!animalsRes.ok) throw new Error("Erro ao buscar animais.");
        const allAnimals = await animalsRes.json();
        const sameFarmAnimals = allAnimals.filter((a: any) => a.farm_id === userData.farm_id);
        setFarmAnimals(sameFarmAnimals);

      } catch (err: any) {
        setError(err.message || "Erro ao buscar dados.");
      }
    };

    fetchData();
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

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    const novoAnimal: any = {
      birth_date: nascimento,
      gender: sexo.trim().charAt(0).toUpperCase() + sexo.trim().slice(1),
      father_id: fatherId === "" ? null : Number(fatherId),
      mother_id: motherId === "" ? null : Number(motherId),
      farm_id: farmId,
      feeding_hay: feedingHay,
      feeding_feed: feedingFeed,
    };


    try {
      const res = await fetch("http://localhost:8000/sheep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novoAnimal),
      });

      if (!res.ok) throw new Error("Erro ao criar animal.");
      navigate("/animal");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>
        Adicionar Animal
      </h1>
      {error && <p className={styles.error}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        className={styles.form}
      >
        <Card className={styles.formCard}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <div className={styles.formGroup}>
                <label>
                  Data de nascimento:
                </label>
                <input
                  type="date"
                  value={nascimento}
                  onChange={(e) => setNascimento(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  ID do pai:
                </label>
                <select
                  value={fatherId}
                  onChange={(e) => setFatherId(e.target.value)}
                >
                  <option value="">
                    Nenhum
                  </option>
                  {farmAnimals
                    .filter((a) => (a.gender || "").toLowerCase() === "macho")
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} - {a.gender}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>
                  ID da mãe:
                </label>
                <select
                  value={motherId}
                  onChange={(e) => setMotherId(e.target.value)}
                >
                  <option value="">
                    Nenhum
                  </option>
                  {farmAnimals
                    .filter((a) => (a.gender || "").toLowerCase() === "fêmea")
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} - {a.gender}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.formGroup}>
                <label>
                  Sexo:
                </label>
                <select
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)} required
                >
                  <option value="">
                    Selecione
                  </option>
                  <option value="Macho">
                    Macho
                  </option>
                  <option value="Fêmea">
                    Fêmea
                  </option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>
                  Feno (kg):
                </label>
                <input
                  type="number"
                  value={feedingHay}
                  onChange={(e) => setFeedingHay(parseFloat(e.target.value))}
                  min={0}
                  step={0.01}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  Ração (kg):
                </label>
                <input
                  type="number"
                  value={feedingFeed}
                  onChange={(e) => setFeedingFeed(parseFloat(e.target.value))}
                  min={0}
                  step={0.01}
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        <div className={styles.buttonGroup}>
          <Button
            variant="light"
            type="button" onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            variant="dark"
            type="submit"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};
