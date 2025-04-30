import React, { useState, useRef, useEffect } from "react";
import styles from "./Menu.module.css";
import { Link } from "react-router-dom";
import { Button } from "../Button/Button"; // importa seu componente Button

export const Menu: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLUListElement>(null);

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
    {
      name: "Inventário",
      subItems: [
        { label: "Ver Itens", to: "/inventory" },
        { label: "Adicionar Item", to: "/inventory/add" }
      ]
    },
    {
      name: "Animais",
      subItems: [
        { label: "Ver Animais", to: "/animal" },
        { label: "Adicionar Animal", to: "/animal/add" }
      ]
    },
    {
      name: "Avisos",
      subItems: [
        { label: "Ver Avisos", to: "/warning" },
        { label: "Criar Aviso", to: "/warning/add" }
      ]
    },
    {
      name: "Consultas",
      subItems: [
        { label: "Ver Consultas", to: "/consult" },
        { label: "Ver Histórico de Consultas", to: "/consult/history" }
      ]
    },
    {
      name: "Ambiente",
      subItems: [
        { label: "Ver Ambiente Interno", to: "/environment" },
        { label: "Criar Sensor", to: "/environment/add-sensor" },
        { label: "Limpar Leito", to: "/environment/clean-bed" }
      ]
    },
    {
      name: "Mapa",
      subItems: [
        { label: "Ver Mapa", to: "/map" },
        { label: "Criar Barreira", to: "/map/add-barrier" }
      ]
    }
  ];

  return (
    <nav className={styles.navbar}>
      <ul className={styles.menu} ref={menuRef}>
        <li className={styles.menuItem}>
          <Link to="/" className={styles.menuLink}>
            <Button variant="light">Início</Button>
          </Link>
        </li>

        {menuItems.map(({ name, subItems }) => (
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
