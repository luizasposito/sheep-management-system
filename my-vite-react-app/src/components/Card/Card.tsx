import React from "react";
import styles from "./Card.module.css";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  return (
    <div className={`${styles.card} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};