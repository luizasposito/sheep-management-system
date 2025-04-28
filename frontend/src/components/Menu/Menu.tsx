import React, { useState, useRef, useEffect } from "react";
import styles from "./Menu.module.css";

export const Menu: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const handleMenuClick = (menuName: string) => {
    setOpenMenu(prev => (prev === menuName ? null : menuName));
  };

  // Fechar o menu se clicar fora
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
    { name: "Inventário", subItems: ["Ver Itens", "Adicionar Item"] },
    { name: "Animais", subItems: ["Ver Animais", "Adicionar Animal"] },
    { name: "Avisos", subItems: ["Ver Avisos", "Criar Aviso"] },
    { name: "Configurações", subItems: ["Perfil", "Preferências"] },
  ];

  return (
    <nav className={styles.navbar}>
      <ul className={styles.menu} ref={menuRef}>
        <li className={styles.menuItem}>
          <a href="#" className={styles.menuLink}>Início</a>
        </li>

        {menuItems.map(({ name, subItems }) => (
          <li key={name} className={styles.menuItem}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick(name);
              }}
              className={styles.menuLink}
              aria-haspopup="true"
              aria-expanded={openMenu === name}
            >
              {name}
            </a>

            {openMenu === name && (
              <ul className={styles.submenu} aria-label={`Submenu ${name}`}>
                {subItems.map((subItem) => (
                  <li key={subItem}>
                    <a href="#" className={styles.submenuLink}>{subItem}</a>
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