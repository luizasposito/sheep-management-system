import React from "react";
import styles from "./Table.module.css";

type TableCell = string | number | React.ReactNode;

interface TableProps {
  headers: string[];
  data: TableCell[][];
}

export const Table: React.FC<TableProps> = ({ headers, data }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? styles.evenRow : ""}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
