import React, { useState, useRef, useEffect } from "react";
import styles from "./Menu.module.css";
import { Link } from "react-router-dom";
import { Button } from "../Button/Button";
import { useUser } from "../../UserContext";

export const Menu: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const { user } = useUser();

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

  const menuItems = [
    /*{
      name: "Inventário",
      roles: ["farmer"], // apenas farmer pode ver
      subItems: [
        { label: "Ver itens", to: "/inventory" },
        { label: "Adicionar item", to: "/inventory/add" }
      ]
    },*/
    {
      name: "Animais",
      roles: ["farmer", "vet"],
      subItems: [
        { label: "Ver animais", to: "/animal" },
        ...(user?.role === "farmer" ? [{ label: "Adicionar animal", to: "/animal/add" }] : [])
      ]
    },
    {
      name: "Consultas",
      roles: ["farmer", "vet"],
      subItems: [
        { label: "Ver consultas", to: "/appointment" },
        { label: "Ver histórico de consultas", to: "/appointment/history" },
        ...(user?.role === "farmer" ? [{ label: "Agendar consulta", to: "/appointment/add" }] : [])
      ]
    },
    /*{
      name: "Mapa",
      roles: ["farmer"], // supondo que só farmer usa
      subItems: [
        { label: "Ver mapa", to: "/map" },
        { label: "Criar barreira", to: "/map/add-barrier" }
      ]
    }*/
  ];

  return (
    <nav className={styles.navbar}>
      <ul className={styles.menu} ref={menuRef}>
        <li className={styles.menuItem}>
          <Link to="/" className={styles.menuLink}>
            <Button variant="light">Início</Button>
          </Link>
        </li>

        {menuItems
          //.filter(item => user?.role && item.roles.includes(user.role))
          .map(({ name, subItems }) => (
            <li key={name} className={styles.menuItem}>
              <Button
                variant="light"
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
        ))}
      </ul>
    </nav>
  );
};
