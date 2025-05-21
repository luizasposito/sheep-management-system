import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { PageLayout } from "../../components/PageLayout/PageLayout";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./AppointmentCreate.module.css";
import { useUser } from "../../UserContext";

type Sheep = {
  id: number;
  gender: string;
  group_id: number | null;
};

type SheepGroup = {
  id: number;
  name: string;
};

type SelectOption = {
  value: number;
  label: string;
};

const todayLocal = new Date();
const yyyy = todayLocal.getFullYear();
const mm = String(todayLocal.getMonth() + 1).padStart(2, "0");
const dd = String(todayLocal.getDate()).padStart(2, "0");
const minDate = `${yyyy}-${mm}-${dd}`;


export const AppointmentCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [data, setData] = useState("");
  const [motivo, setMotivo] = useState("");

  const [sheepList, setSheepList] = useState<Sheep[]>([]);
  const [groupMap, setGroupMap] = useState<Record<number, string>>({});
  const [formAnimals, setFormAnimals] = useState<number[]>([]);

  const [animalOptions, setAnimalOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    document.title = "Nova Consulta";
  }, []);

  useEffect(() => {
    if (!user || user.role !== "farmer") {
      navigate("/unauthorized");
      return;
    }

    const fetchData = async () => {
      try {
        const [sheepRes, groupRes] = await Promise.all([
          fetch("http://localhost:8000/sheep", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          fetch("http://localhost:8000/sheep-group", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ]);

        if (!sheepRes.ok || !groupRes.ok) throw new Error("Erro ao buscar dados");

        const sheeps: Sheep[] = await sheepRes.json();
        const groups: SheepGroup[] = await groupRes.json();

        const groupDict: Record<number, string> = {};
        groups.forEach((group) => {
          groupDict[group.id] = group.name;
        });

        const options: SelectOption[] = sheeps.map((s) => ({
          value: s.id,
          label: `${s.id} - ${s.group_id ? groupDict[s.group_id] : "Sem grupo"}`,
        }));

        setGroupMap(groupDict);
        setSheepList(sheeps);
        setAnimalOptions(options);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formAnimals.length === 0 || !user) return;

    const payload = {
      vet_id: 1,
      sheep_ids: formAnimals,
      motivo,
      date: data ? data + "T00:00:00" : undefined,
    };

    try {
      const response = await fetch("http://localhost:8000/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar consulta");
      }

      const result = await response.json();
      console.log("Consulta criada:", result);
      navigate("/appointment");
    } catch (error) {
      console.error("Erro ao salvar consulta:", error);
    }
  };

  return (
    <PageLayout>
      <h1 className={styles.title}>Agendar nova consulta</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Card className={styles.card}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <label>
                Data da consulta:
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  min={minDate}
                  required
                />
              </label>

              <label>
                Animais:
                <Select
                  options={animalOptions}
                  isMulti
                  value={animalOptions.filter((opt) => formAnimals.includes(opt.value))}
                  onChange={(selectedOptions) =>
                    setFormAnimals(selectedOptions.map((opt) => opt.value))
                  }
                />
              </label>
            </div>

            <div className={styles.rightColumn}>
              <label>
                Motivo:
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Descreva o motivo da consulta"
                  rows={6}
                  required
                />
              </label>
            </div>
          </div>
        </Card>

        <div className={styles.buttonGroup}>
          <Button variant="dark" type="submit">
            Salvar
          </Button>
          <Button variant="light" type="button" onClick={() => navigate("/appointment")}>
            Cancelar
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};
