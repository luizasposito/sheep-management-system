
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend  } from 'recharts';
  import styles from './LineGraph.module.css';
  
  // Tipo dos dados do gráfico
  type DataPoint = {
    [key: string]: string | number;
  };
  
  interface LineGraphProps {
  data: DataPoint[];
  dataKeys: { key: string; color: string; label?: string }[];
  title?: string;
  xKey?: string;
}

  
  export default function LineGraph({
  data,
  dataKeys,
  title = '',
  xKey = 'name',
}: LineGraphProps) {
  return (
    <div className={styles['line-graph-container']}>
      {title && <h3 className={styles['line-graph-title']}>{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} padding={{ left: 20, right: 20 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          {dataKeys.map(({ key, color, label }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              name={label || key}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
  