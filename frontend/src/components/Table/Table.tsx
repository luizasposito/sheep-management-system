
import React from "react";
import styles from "./Table.module.css";

type TableProps = {
  headers: string[];
  data: (string | number)[][];
};

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







// import { Table } from "./components/Table/Table";

// const headers = ["Nome", "Raça", "Idade"];
// const data = [
//   ["Ovelha 1", "Merino", 2],
//   ["Ovelha 2", "Suffolk", 3],
//   ["Ovelha 3", "Dorper", 1],
// ];

// export default function App() {
//   return <Table headers={headers} data={data} />;
// }
