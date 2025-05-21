import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../UserContext";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./AnimalEdit.module.css";

export const AnimalEdit: React.FC = () => {
  useEffect(() => {
      document.title = "Editar animal";
    }, []);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
    const { user } = useUser();
  const token = localStorage.getItem("token");

  const [animal, setAnimal] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [isChanged, setIsChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [farmAnimals, setFarmAnimals] = useState<any[]>([]);

  const [groups, setGroups] = useState<any[]>([]); // grupos disponíveis

  useEffect(() => {
      if (!user || !user.role) return;
      if (!(user.role === "farmer" || user.role === "veterinarian")) {
        navigate("/unauthorized");
      }
    }, [user, navigate]);

  useEffect(() => {
    if (!id || !token) return;

    const fetchData = async () => {
      try {
        // Busca animal específico
        const animalRes = await fetch(`http://localhost:8000/sheep/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!animalRes.ok) throw new Error("Erro ao buscar dados do animal");
        const animalData = await animalRes.json();
        setAnimal(animalData);
        setForm({
          birth_date: animalData.birth_date,
          feeding_hay: animalData.feeding_hay,
          feeding_feed: animalData.feeding_feed,
          gender: animalData.gender,
          group_id: animalData.group_id || "",
          farm_id: animalData.farm_id,
          father_id: animalData.father_id || "",
          mother_id: animalData.mother_id || "",
        });

        // Busca todos os animais da mesma fazenda (excluindo o próprio animal)
        const allAnimalsRes = await fetch("http://localhost:8000/sheep", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!allAnimalsRes.ok) throw new Error("Erro ao buscar todos os animais");
        const allAnimals = await allAnimalsRes.json();
        const sameFarmAnimals = allAnimals.filter(
          (a: any) => a.farm_id === animalData.farm_id && a.id !== animalData.id
        );
        setFarmAnimals(sameFarmAnimals);

        // Busca grupos
        const groupRes = await fetch("http://localhost:8000/sheep-group", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!groupRes.ok) throw new Error("Erro ao buscar grupos");
        const groupData = await groupRes.json();
        setGroups(groupData);

      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, [id, token]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => {
      const updated = { ...prev, [name]: value };
      setIsChanged(JSON.stringify(updated) !== JSON.stringify({
        birth_date: animal.birth_date,
        feeding_hay: animal.feeding_hay,
        feeding_feed: animal.feeding_feed,
        gender: animal.gender,
        group_id: animal.group_id || "",
        farm_id: animal.farm_id,
      }));
      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`http://localhost:8000/sheep/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar animal");
      navigate(`/animal/${id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Editar Animal {id}</h1>
      {error && <p className={styles.error}>{error}</p>}

      {animal ? (
        <Card className={styles.formCard}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <div className={styles.formGroup}>
                <label>Data de nascimento:</label>
                <input
                  type="date"
                  name="birth_date"
                  value={form.birth_date}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Sexo:</label>
                <select name="gender" value={form.gender.toLowerCase()} onChange={handleChange}>
                  <option value="macho">Macho</option>
                  <option value="fêmea">Fêmea</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>ID do pai:</label>
                <select name="father_id" value={form.father_id || ""} onChange={handleChange}>
                  <option value="">Nenhum</option>
                  {farmAnimals
                    .filter((a) => a.gender.toLowerCase() === "macho")
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} - {a.gender}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>ID da mãe:</label>
                <select name="mother_id" value={form.mother_id || ""} onChange={handleChange}>
                  <option value="">Nenhum</option>
                  {farmAnimals
                    .filter((a) => a.gender.toLowerCase() === "fêmea")
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
                <label>Feno para ingestão diária (kg):</label>
                <input
                  type="number"
                  name="feeding_hay"
                  value={form.feeding_hay}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Ração para ingestão diária (kg):</label>
                <input
                  type="number"
                  name="feeding_feed"
                  value={form.feeding_feed}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Grupo:</label>
                <select name="group_id" value={form.group_id || ""} onChange={handleChange}>
                  <option value="">Nenhum</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.id} - {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <Button variant="dark" onClick={handleSubmit} disabled={!isChanged}>
              Salvar
            </Button>
            <Button variant="dark" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
          </div>
        </Card>

      ) : (
        <p>Carregando dados...</p>
      )}
    </PageLayout>
  );
};
