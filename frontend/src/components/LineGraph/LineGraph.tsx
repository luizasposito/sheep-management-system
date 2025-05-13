import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
  } from 'recharts';
  import styles from './LineGraph.module.css'; // ← IMPORTAÇÃO CORRETA
  
  // Tipo dos dados do gráfico
  type DataPoint = {
    [key: string]: string | number;
  };
  
  interface LineGraphProps {
    data: DataPoint[];
    dataKey: string;
    title?: string;
    strokeColor?: string;
    xKey?: string;
  }
  
  export default function LineGraph({
    data,
    dataKey,
    title = '',
    strokeColor = '#8884d8',
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
            <Line type="monotone" dataKey={dataKey} stroke={strokeColor} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  