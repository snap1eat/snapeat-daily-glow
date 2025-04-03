
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const History = () => {
  const { user, getTodayLog } = useUser();

  // Calculate daily averages for the past 7 days
  const calculateAverages = () => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const log = user.dailyLogs.find(log => log.date === date);
      
      if (!log) {
        return {
          date: formatDate(date),
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          water: 0
        };
      }
      
      // Calculate nutrition totals
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      log.meals.forEach(meal => {
        meal.foods.forEach(food => {
          totalCalories += food.calories;
          totalProtein += food.protein;
          totalCarbs += food.carbs;
          totalFat += food.fat;
        });
      });
      
      return {
        date: formatDate(date),
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
        water: log.waterGlasses
      };
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  };

  // Generate data for the macronutrient chart
  const generateMacroData = () => {
    const todayLog = getTodayLog();
    
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    todayLog.meals.forEach(meal => {
      meal.foods.forEach(food => {
        totalProtein += food.protein;
        totalCarbs += food.carbs;
        totalFat += food.fat;
      });
    });
    
    return [
      { name: 'Proteínas', value: totalProtein },
      { name: 'Carbohidratos', value: totalCarbs },
      { name: 'Grasas', value: totalFat },
    ];
  };

  // Data for charts
  const lineChartData = calculateAverages();
  const pieChartData = generateMacroData();

  return (
    <div className="pt-16 pb-4 px-1">
      <h1 className="text-2xl font-bold mb-6">Historial y Estadísticas</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Distribución de macronutrientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Racha actual</div>
                  <div className="text-2xl font-bold">{user.currentStreak} días</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Puntos EATS</div>
                  <div className="text-2xl font-bold">{user.totalEatsPoints}</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Comidas registradas</div>
                  <div className="text-2xl font-bold">
                    {user.dailyLogs.reduce((total, log) => total + log.meals.length, 0)}
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Promedio de agua</div>
                  <div className="text-2xl font-bold">
                    {(user.dailyLogs.reduce((total, log) => total + log.waterGlasses, 0) / user.dailyLogs.length).toFixed(1)}
                    <span className="text-sm ml-1">vasos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias (últimos 7 días)</CardTitle>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={lineChartData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="calories" 
                      stroke="#FF8042" 
                      name="Calorías"
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="protein" 
                      stroke="#0088FE" 
                      name="Proteínas (g)"
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="carbs" 
                      stroke="#FFBB28" 
                      name="Carbohidratos (g)"
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="fat" 
                      stroke="#00C49F" 
                      name="Grasas (g)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-[200px] mt-8 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={lineChartData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 8]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="water" 
                      stroke="#0088FE" 
                      name="Vasos de agua"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
