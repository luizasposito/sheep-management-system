import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./Login.module.css";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (res.ok) {
      const data = await res.json();
      const token = data.token;
      localStorage.setItem("token", token);

      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (decoded.role === "farmer") {
          navigate("/");
        } else if (decoded.role === "vet") {
          navigate("/appointment");
        } else {
          alert("Tipo de usuário desconhecido");
        }
      } catch (err) {
        console.error("Token inválido");
        alert("Erro ao processar login.");
      }
    } else {
      alert("Login inválido");
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        <h1 className={styles.title}>Login</h1>

        {/* manter o conteúdo do form com flexbox do CSS */}
        <form onSubmit={handleLogin} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="inserir senha"
              required
            />
          </div>

          <div className={styles.buttonWrapper}>
            <Button variant="dark" type="submit">
              Entrar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
