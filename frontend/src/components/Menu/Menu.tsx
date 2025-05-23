import React, { useState, useRef, useEffect } from "react";
import styles from "./Menu.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { useUser } from "../../UserContext";

export const Menu: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const location = useLocation();
  const currentPath = location.pathname + location.search;

  const logoutButtonRef = useRef<HTMLButtonElement>(null);
  const [logoutCardPosition, setLogoutCardPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (showLogoutConfirmation && logoutButtonRef.current) {
      const rect = logoutButtonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      const buttonCenter = rect.left + rect.width / 2;

      setLogoutCardPosition({
        top: rect.bottom + scrollY + 8,
        left: buttonCenter + scrollX,
      });
    }
  }, [showLogoutConfirmation]);

  // Função simplificada que alterna abrir/fechar o card
  const handleLogoutClick = () => {
    setShowLogoutConfirmation(prev => !prev);
  };

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

  const confirmLogout = async () => {
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
    setUser(null);
    navigate("/");
  };

  const menuItems = [
    {
      name: "Inventário",
      roles: ["farmer"],
      subItems: [
        { label: "Ver itens", to: "/inventory" },
        { label: "Adicionar item", to: "/inventory/add" },
      ],
    },
    {
      name: "Animais",
      roles: ["farmer", "veterinarian"],
      subItems: [
        { label: "Ver animais", to: "/animal" },
        ...(user?.role === "farmer" ? [{ label: "Adicionar animal", to: "/animal/add" }] : []),
      ],
    },
    {
      name: "Consultas",
      roles: ["farmer", "veterinarian"],
      subItems: [
        { label: "Ver consultas", to: "/appointment" },
        { label: "Ver histórico de consultas", to: "/appointment?tab=historico" },
        ...(user?.role === "farmer" ? [{ label: "Agendar consulta", to: "/appointment/add" }] : []),
      ],
    },
  ];

  return (
    <>
      <nav className={styles.navbar}>
        <ul className={styles.menu} ref={menuRef}>
          {user?.role === "farmer" && (
            <li className={styles.menuItem}>
              <Button
                variant={currentPath.startsWith("/dashboard") ? "dark" : "light"}
                onClick={() => navigate("/dashboard")}
              >
                Início
              </Button>

            </li>
          )}

          {menuItems
            .filter((item) => user?.role && item.roles.includes(user.role))
            .map(({ name, subItems }) => {
              const isActive = subItems.some((sub) => currentPath.startsWith(sub.to));
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
                          <Link to={to} className={styles.submenuLink} onClick={() => setOpenMenu(null)}>
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}

          {user && (
            <li className={styles.menuItem}>
              <Button variant="light" onClick={handleLogoutClick} ref={logoutButtonRef}>
                Sair
              </Button>
            </li>
          )}
        </ul>
      </nav>

      {showLogoutConfirmation && (
        <div className={styles.logoutOverlay}>
          <Card
            className={styles.logoutCardContent}
            style={{
              "--logout-card-top": `${logoutCardPosition.top}px`,
              "--logout-card-left": `${logoutCardPosition.left}px`,
            } as React.CSSProperties}
          >
            <p>
              Tem certeza que deseja sair da conta <strong>{user?.role}</strong>, <strong>{user?.name}</strong>?
            </p>
            <div className={styles.logoutButtons}>
              <Button variant="light" onClick={() => setShowLogoutConfirmation(false)}>
                Cancelar
              </Button>
              <Button variant="dark" onClick={confirmLogout}>
                Confirmar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
