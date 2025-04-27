
import { useState } from "react";
import styles from "./Menu.module.css";
import { Link } from "react-router-dom";

export const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className={styles.menuContainer}>
      <div className={styles.menuToggle} onClick={toggleMenu}>
        <span className={styles.icon}>≡</span>
      </div>
      {isOpen && (
        <div className={styles.menuBox}>
          <Link to="/inventory" className={styles.menuItem}>Inventário</Link>
          <Link to="/sheep" className={styles.menuItem}>Ovelhas</Link>
          <Link to="/calendar" className={styles.menuItem}>Calendário</Link>
          <Link to="/map" className={styles.menuItem}>Mapa</Link>
          <Link to="/consultation" className={styles.menuItem}>Consultas</Link>
          <Link to="/airquality" className={styles.menuItem}>Controlo do Ambiente</Link>
        </div>
      )}
    </div>
  );
};
