import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './PieChart.module.css';

type PieData = {
  name: string;
  value: number;
};

// Função para gerar cores dinâmicas HSL (mesma que no LineGraph)
function generateColors(count: number): string[] {
  const colors = [];
  const saturation = 70; // %
  const lightness = 50;  // %
  for (let i = 0; i < count; i++) {
    const hue = Math.round((360 * i) / count);
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
}

interface PieChartGraphProps {
  data: PieData[];
  title?: string;
  colors?: string[]; // deixa opcional para sobrepor cores fixas
}

export default function PieChartGraph({
  data,
  title = '',
  colors,
}: PieChartGraphProps) {
  // Se não passar colors, gera dinamicamente com base no tamanho do data
  const dynamicColors = colors && colors.length > 0 ? colors : generateColors(data.length);

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
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={dynamicColors[index % dynamicColors.length]}
                data-testid="pie-cell"
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
