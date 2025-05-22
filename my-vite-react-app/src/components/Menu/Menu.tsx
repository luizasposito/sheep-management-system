import React, { useState, useRef, useEffect } from "react";
import styles from "./Menu.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../Button/Button";
import { useUser } from "../../UserContext";

export const Menu: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const location = useLocation();
  const currentPath = location.pathname + location.search;


  const handleMenuClick = (menuName: string) => {
    setOpenMenu(prev => (prev === menuName ? null : menuName));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch("/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Erro ao deslogar:", err);
      }
    }

    localStorage.removeItem("token");
    setUser(null); // limpa contexto
    navigate("/"); // redireciona
  };

  const menuItems = [
    {
      name: "Inventário",
      roles: ["farmer"],
      subItems: [
        { label: "Ver itens", to: "/inventory" },
        { label: "Adicionar item", to: "/inventory/add" }
      ]
    },
    {
      name: "Animais",
      roles: ["farmer", "veterinarian"],
      subItems: [
        { label: "Ver animais", to: "/animal" },
        ...(user?.role === "farmer" ? [{ label: "Adicionar animal", to: "/animal/add" }] : [])
      ]
    },
    {
      name: "Consultas",
      roles: ["farmer", "veterinarian"],
      subItems: [
        { label: "Ver consultas", to: "/appointment" },
        { label: "Ver histórico de consultas",  to: "/appointment?tab=historico" },
        ...(user?.role === "farmer" ? [{ label: "Agendar consulta", to: "/appointment/add" }] : [])
      ]
    }
  ];

  return (
    <nav className={styles.navbar}>
      <ul className={styles.menu} ref={menuRef}>
        {user?.role === "farmer" && (
          <li className={styles.menuItem}>
            <Link to="/dashboard" className={styles.menuLink}>
              <Button variant={currentPath.startsWith("/dashboard") ? "dark" : "light"}>
                Início
              </Button>
            </Link>
          </li>
        )}


        {menuItems
          .filter(item => user?.role && item.roles.includes(user.role))
          .map(({ name, subItems }) => {
            const isActive = subItems.some(sub => currentPath.startsWith(sub.to));

            return (
              <li key={name} className={styles.menuItem}>
                <Button
                  variant={isActive ? "dark" : "light"}
                  onClick={() => handleMenuClick(name)}
                  aria-haspopup="true"
                  aria-expanded={openMenu === name}
                >
                  {name}
                </Button>

                {openMenu === name && (
                  <ul className={styles.submenu} aria-label={`Submenu ${name}`}>
                    {subItems.map(({ label, to }) => (
                      <li key={label}>
                        <Link
                          to={to}
                          className={styles.submenuLink}
                          onClick={() => setOpenMenu(null)}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })
        }


        {/* Botão de Sair (visível para todos os usuários autenticados) */}
        {user && (
          <li className={styles.menuItem}>
            <Button variant="light" onClick={handleLogout}>
              Sair
            </Button>
          </li>
        )}
      </ul>
    </nav>
  );
};
