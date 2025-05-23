import React, { useState, forwardRef } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "light" | "dark";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

// Usando forwardRef para expor o ref do botão interno
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = "light",
  onClick,
  type = "button",
  disabled = false,
}, ref) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (disabled) return;

    onClick?.();
    setClicked(true);
    setTimeout(() => setClicked(false), 150);
  };

  const activeVariant =
    clicked && !disabled ? (variant === "light" ? "dark" : "light") : variant;

  return (
    <button
      ref={ref}
      className={`${styles.button} ${styles[activeVariant]}`}
      onClick={handleClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
});