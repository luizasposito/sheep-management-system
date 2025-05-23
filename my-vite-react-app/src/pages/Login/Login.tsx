import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import { useUser } from "../../UserContext";
import styles from "./Login.module.css";
import showPassIcon from "../../icons/show-pass.png";
import hidePassIcon from "../../icons/hide-pass.png";


export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser();

  useEffect(() => {
    document.title = "Login";
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.detail || "Login inválido");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const token = data.access_token;
      localStorage.setItem("token", token);

      navigate(from, { replace: true });

      // Testar se o token funciona para acessar endpoint protegido
      const meRes = await fetch("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!meRes.ok) {
        alert("Token inválido para acessar dados do usuário");
        setLoading(false);
        return;
      }

      const userData = await meRes.json();
      setUser(userData);
      console.log("Usuário autenticado:", userData);

      // Decodificar token e navegar conforme role
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (decoded.role === "farmer") {
          navigate("/dashboard");
        } else if (decoded.role === "veterinarian") {
          navigate("/appointment");
        } else {
          alert("Tipo de usuário desconhecido");
        }
      } catch (err) {
        console.error("Erro ao decodificar token:", err);
        alert("Erro ao processar login.");
      }
    } catch (err) {
      console.error("Erro na requisição de login:", err);
      alert("Erro na comunicação com o servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        <h1 className={styles.title}>Login</h1>

        <form
          onSubmit={handleLogin}
          className={styles.form}
        >
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="senha">Senha</label>
            <div className={styles.passwordWrapper}>
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="inserir senha"
                required
                disabled={loading}
              />
              <button
                type="button"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                onClick={() => setShowPassword(!showPassword)}
                className={styles.showPasswordBtn}
              >
                <img
                  src={showPassword ? hidePassIcon : showPassIcon}
                  alt={showPassword ? "Esconder senha" : "Mostrar senha"}
                />
              </button>
            </div>
          </div>

          <div className={styles.buttonWrapper}>
            <Button variant="dark" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
