
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
  import styles from './PieChart.module.css';
  
  type PieData = {
    name: string;
    value: number;
  };
  
  interface PieChartGraphProps {
    data: PieData[];
    title?: string;
    colors?: string[];
  }
  
  export default function PieChartGraph({
    data,
    title = '',
    colors = ['#9932CC', '#20B2AA', '#DC143C', '#000080'],
  }: PieChartGraphProps) {
    return (
      <div className={styles.pieChartContainer}>
        {title && <h3 className={styles.pieChartTitle}>{title}</h3>}
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
  