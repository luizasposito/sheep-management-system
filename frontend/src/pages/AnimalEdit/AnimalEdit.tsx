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
          feeding_hay: animalData.feeding_hay ?? 0,
          feeding_feed: animalData.feeding_feed ?? 0,
          gender: animalData.gender,
          group_id: animalData.group_id ?? null,
          farm_id: animalData.farm_id,
          father_id: animalData.father_id?.toString() ?? "",
          mother_id: animalData.mother_id?.toString() ?? "",
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

        const fatherExists = sameFarmAnimals.some((a: any) => a.id === animalData.father_id);
        const motherExists = sameFarmAnimals.some((a: any) => a.id === animalData.mother_id);
        console.log("ID do pai:", animalData.father_id, "Existe?", fatherExists);
        console.log("ID da mãe:", animalData.mother_id, "Existe?", motherExists);

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
      let val: any = value;

      // converte números
      if (name === "feeding_hay" || name === "feeding_feed") {
        val = value === "" ? 0 : parseFloat(value);
      }

      // converte IDs para números ou null (pai, mãe, grupo)
      if (["father_id", "mother_id", "group_id"].includes(name)) {
        val = value; // mantém como string no estado
      }


      const updated = { ...prev, [name]: val };

      setIsChanged(
        JSON.stringify(updated) !==
        JSON.stringify({
          birth_date: animal.birth_date,
          feeding_hay: animal.feeding_hay ?? 0,
          feeding_feed: animal.feeding_feed ?? 0,
          gender: animal.gender,
          group_id: animal.group_id?.toString() ?? "",
          farm_id: animal.farm_id,
          father_id: animal.father_id?.toString() ?? "",
          mother_id: animal.mother_id?.toString() ?? "",
        })
      );
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
        
        body: JSON.stringify({
          ...form,
          father_id: form.father_id === "" ? null : Number(form.father_id),
          mother_id: form.mother_id === "" ? null : Number(form.mother_id),
          group_id: form.group_id === "" ? null : Number(form.group_id),
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar animal");
      navigate(`/animal/${id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>
        Editar Animal {id}
      </h1>
      {error && <p className={styles.error}>{error}</p>}

      {animal ? (
        <form className={styles.form}>
          <Card>
            <div className={styles.grid}>
              <div className={styles.leftColumn}>
                <div className={styles.formGroup}>
                  <label htmlFor="date">
                    Data de nascimento:
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={form.birth_date}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="gender">
                    Sexo:
                  </label>
                  <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="Macho">
                      Macho
                    </option>
                    <option value="Fêmea">
                      Fêmea
                    </option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="father_id">
                    ID do pai:
                  </label>
                  <select
                    name="father_id"
                    value={form.father_id?.toString() || ""}
                    onChange={handleChange}
                  >
                    <option value="">
                      Nenhum
                    </option>
                    {farmAnimals
                      .filter((a) => (a.gender || "").toLowerCase() === "macho")
                      .map((a) => (
                        <option key={a.id} value={a.id.toString()}>
                          {a.id} - {a.gender}
                        </option>
                      ))}
                  </select>

                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="mother_id">
                    ID da mãe:
                  </label>
                  <select
                    name="mother_id"
                    value={form.mother_id?.toString() || ""}
                    onChange={handleChange}
                  >
                    <option value="">
                      Nenhum
                    </option>
                    {farmAnimals
                      .filter((a) => a.gender.toLowerCase() === "fêmea")
                      .map((a) => (
                        <option
                          key={a.id}
                          value={a.id.toString()}
                        >
                          {a.id} - {a.gender}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className={styles.rightColumn}>
                <div className={styles.formGroup}>
                  <label htmlFor="feeding_hay">
                    Fardo para ingestão diária (kg):
                  </label>
                  <input
                    type="number"
                    name="feeding_hay"
                    value={form.feeding_hay}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="feeding_feed">
                    Ração para ingestão diária (kg):
                  </label>
                  <input
                    type="number"
                    name="feeding_feed"
                    value={form.feeding_feed}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="group_id">
                    Grupo:
                  </label>
                  <select
                    id="group_id" /* talvez esteja errado */
                    name="group_id"
                    value={form.group_id || ""}
                    onChange={handleChange}
                  >
                    <option value="">
                      Nenhum
                    </option>
                    {groups.map((group) => (
                      <option
                        key={group.id}
                        value={group.id}
                      >
                        {group.id} - {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <div className={styles.buttonGroup}>
            <Button
              variant="light"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Button
              variant="dark"
              onClick={handleSubmit}
              disabled={!isChanged}
            >
              Salvar
            </Button>
          </div>
      </form>

      ) : (
        <p>
          Carregando dados...
        </p>
      )}
    </PageLayout>
  );
};
