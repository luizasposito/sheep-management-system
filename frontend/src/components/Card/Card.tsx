import React from "react";
import styles from "./Card.module.css";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
};


export const Card: React.FC<CardProps> = ({ children, className = "", onClick, style }) => {
  const clickableClass = onClick ? styles.clickable : "";

  return (
    <div
      className={`${styles.card} ${clickableClass} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};