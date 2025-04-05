
import { useUser } from '@/contexts/UserContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

interface MacroDistributionChartProps {
  size?: 'sm' | 'md' | 'lg';
  showAlert?: boolean;
}

export const MacroDistributionChart = ({ size = 'md', showAlert = false }: MacroDistributionChartProps) => {
  const { getDailyProtein, getDailyCarbs, getDailyFat } = useUser();
  
  const protein = getDailyProtein();
  const carbs = getDailyCarbs();
  const fat = getDailyFat();
  
  const totalMacros = protein + carbs + fat;
  
  // Calculate percentages
  const proteinPercentage = totalMacros > 0 ? Math.round((protein / totalMacros) * 100) : 0;
  const carbsPercentage = totalMacros > 0 ? Math.round((carbs / totalMacros) * 100) : 0;
  const fatPercentage = totalMacros > 0 ? Math.round((fat / totalMacros) * 100) : 0;
  
  const data = [
    { name: 'Proteínas', value: protein, percentage: proteinPercentage },
    { name: 'Carbohidratos', value: carbs, percentage: carbsPercentage },
    { name: 'Grasas', value: fat, percentage: fatPercentage },
  ];
  
  // Determine chart dimensions based on size prop
  const getDimensions = () => {
    switch(size) {
      case 'sm': return { width: 120, height: 120, innerRadius: 30, outerRadius: 50 };
      case 'lg': return { width: 180, height: 180, innerRadius: 55, outerRadius: 80 };
      case 'md':
      default: return { width: 150, height: 150, innerRadius: 40, outerRadius: 65 };
    }
  };
  
  const { width, height, innerRadius, outerRadius } = getDimensions();
  
  // No data case
  if (totalMacros === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ width, height }}>
        <p className="text-center text-sm text-muted-foreground">Sin datos</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Pie
            data={data.filter(d => d.value > 0)}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            animationDuration={800}
            className={showAlert ? "animate-pulse" : ""}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke={showAlert ? "#FF0000" : "#fff"} 
                strokeWidth={showAlert ? 2 : 1}
              />
            ))}
            <Label
              content={({ viewBox }) => {
                const { cx, cy } = viewBox as { cx: number; cy: number };
                return (
                  <text 
                    x={cx} 
                    y={cy} 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className="font-medium"
                  >
                    <tspan x={cx} dy="-0.5em" className="text-xs text-muted-foreground">
                      Macros
                    </tspan>
                    <tspan x={cx} dy="1.2em" className="text-lg font-bold">
                      {totalMacros}g
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="flex justify-center mt-2 gap-4">
        {data.filter(d => d.value > 0).map((entry, index) => (
          <div key={`legend-${index}`} className="flex flex-col items-center">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs">{entry.name}</span>
            </div>
            <span className="text-sm font-medium">{entry.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
