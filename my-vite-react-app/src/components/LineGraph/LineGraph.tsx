import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import styles from "./LineGraph.module.css";

// Tipo dos dados do gráfico
type DataPoint = {
  [key: string]: string | number;
};

interface LineGraphProps {
  data: DataPoint[];
  dataKeys?: { key: string; color: string; label?: string }[];
  title?: string;
  xKey?: string;
}

function generateColors(count: number): string[] {
  const colors = [];
  const saturation = 70;
  const lightness = 50;
  for (let i = 0; i < count; i++) {
    const hue = Math.round((360 * i) / count);
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
}

function formatDateToDDMM(dateString: string) {
  // Assume que a data está no formato 'yyyy-mm-dd' ou 'yyyy-mm-ddThh:mm:ssZ'
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // fallback se não for data válida
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}-${month}`;
}


export default function LineGraph({
  data,
  dataKeys,
  title = "",
  xKey = "name",
}: LineGraphProps) {
  // Se dataKeys não for passado, gerar dinamicamente com base nos dados
  const dynamicDataKeys = React.useMemo(() => {
    if (dataKeys && dataKeys.length > 0) return dataKeys;

    if (!data || data.length === 0) return [];

    // Obter todas as chaves menos a do eixo X (xKey)
    const keys = Object.keys(data[0]).filter((key) => key !== xKey);

    const colors = generateColors(keys.length);

    return keys.map((key, i) => ({
      key,
      color: colors[i],
      label: key,
    }));
  }, [data, dataKeys, xKey]);

  return (
    <div className={styles["line-graph-container"]}>
      {title && <h3 className={styles["line-graph-title"]}>{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xKey} 
            padding={{ left: 20, right: 20 }} 
            tickFormatter={formatDateToDDMM}
          />
          <YAxis />
          <Tooltip labelFormatter={formatDateToDDMM} />
          <Legend />
          {dynamicDataKeys.map(({ key, color, label }) => (
            <Line key={key} type="monotone" dataKey={key} stroke={color} name={label || key} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}