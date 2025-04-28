import React, { useState } from "react";
import styles from "./Menu.module.css";

export const Menu: React.FC = () => {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  const handleMouseEnter = (menuName: string) => {
    setHoveredMenu(menuName);
  };

  const handleMouseLeave = () => {
    setHoveredMenu(null);
  };

  return (
    <nav className={styles.navbar}>
      <ul className={styles.menu}>
        <li className={styles.menuItem}>
          <a href="#">Início</a>
        </li>

        <li 
          className={styles.menuItem}
          onMouseEnter={() => handleMouseEnter("Inventário")}
          onMouseLeave={handleMouseLeave}
        >
          <a href="#" aria-haspopup="true" aria-expanded={hoveredMenu === "Inventário"}>
            Inventário
          </a>
          {hoveredMenu === "Inventário" && (
            <ul className={styles.submenu} aria-label="Submenu Inventário">
              <li><a href="#">Ver Itens</a></li>
              <li><a href="#">Adicionar Item</a></li>
            </ul>
          )}
        </li>

        <li 
          className={styles.menuItem}
          onMouseEnter={() => handleMouseEnter("Animais")}
          onMouseLeave={handleMouseLeave}
        >
          <a href="#" aria-haspopup="true" aria-expanded={hoveredMenu === "Animais"}>
            Animais
          </a>
          {hoveredMenu === "Animais" && (
            <ul className={styles.submenu} aria-label="Submenu Animais">
              <li><a href="#">Ver Animais</a></li>
              <li><a href="#">Adicionar Animal</a></li>
            </ul>
          )}
        </li>

        <li 
          className={styles.menuItem}
          onMouseEnter={() => handleMouseEnter("Avisos")}
          onMouseLeave={handleMouseLeave}
        >
          <a href="#" aria-haspopup="true" aria-expanded={hoveredMenu === "Avisos"}>
            Avisos
          </a>
          {hoveredMenu === "Avisos" && (
            <ul className={styles.submenu} aria-label="Submenu Avisos">
              <li><a href="#">Ver Avisos</a></li>
              <li><a href="#">Criar Aviso</a></li>
            </ul>
          )}
        </li>

        <li 
          className={styles.menuItem}
          onMouseEnter={() => handleMouseEnter("Configurações")}
          onMouseLeave={handleMouseLeave}
        >
          <a href="#" aria-haspopup="true" aria-expanded={hoveredMenu === "Configurações"}>
            Configurações
          </a>
          {hoveredMenu === "Configurações" && (
            <ul className={styles.submenu} aria-label="Submenu Configurações">
              <li><a href="#">Perfil</a></li>
              <li><a href="#">Preferências</a></li>
            </ul>
          )}
        </li>

      </ul>
    </nav>
  );
};
