
import React from "react";
import styles from "./Card.module.css";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
};




// import { Card } from "./components/Card/Card";

// export default function App() {
//     return (
//       <Card>
//         <h2>Título do Card</h2>
//         <p>Conteúdo do card aqui.</p>
//       </Card>
//     );
//   }