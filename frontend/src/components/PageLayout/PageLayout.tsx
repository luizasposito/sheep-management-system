
import React from "react";
import { Menu } from "../Menu/Menu";
import styles from "./PageLayout.module.css";

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      <Menu />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};