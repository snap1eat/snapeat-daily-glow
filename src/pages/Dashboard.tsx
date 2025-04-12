import { useUser } from '@/contexts/UserContext';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ProgressCircle } from '@/components/ProgressCircle';
import { MealIndicator } from '@/components/MealIndicator';
import { PineappleMascot } from '@/components/PineappleMascot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DisplayedExcess {
  calories: boolean;
  protein: boolean;
  carbs: boolean;
  fat: boolean;
}

const Dashboard = () => {
  const { 
    user, 
    getTodayLog, 
    getDailyCalories, 
    getDailyProtein, 
    getDailyCarbs, 
    getDailyFat,
    getTodayMealsByType,
    incrementWater,
    decrementWater
  } = useUser();
  const { toast } = useToast();
  const todayLog = getTodayLog();
  const totalCalories = getDailyCalories();
  const totalProtein = getDailyProtein();
  const totalCarbs = getDailyCarbs();
  const totalFat = getDailyFat();
  
  const [displayedExcess, setDisplayedExcess] = useState<DisplayedExcess>({
    calories: false,
    protein: false,
    carbs: false,
    fat: false,
  });
  
  const caloriePercentage = Math.round((totalCalories / user.nutritionGoals.calories) * 100);
  const proteinPercentage = Math.round((totalProtein / user.nutritionGoals.protein) * 100);
  const carbsPercentage = Math.round((totalCarbs / user.nutritionGoals.carbs) * 100);
  const fatPercentage = Math.round((totalFat / user.nutritionGoals.fat) * 100);
  
  const hasExcess = caloriePercentage > 110 || proteinPercentage > 110 || carbsPercentage > 110 || fatPercentage > 110;
  
  const calorieExcess = caloriePercentage > 100 ? `+${caloriePercentage - 100}%` : '';
  const proteinExcess = proteinPercentage > 100 ? `+${proteinPercentage - 100}%` : '';
  const carbsExcess = carbsPercentage > 100 ? `+${carbsPercentage - 100}%` : '';
  const fatExcess = fatPercentage > 100 ? `+${fatPercentage - 100}%` : '';
  
  const breakfastMeals = getTodayMealsByType('breakfast');
  const lunchMeals = getTodayMealsByType('lunch');
  const dinnerMeals = getTodayMealsByType('dinner');
  const snackMeals = getTodayMealsByType('snack');
  
  const calculateMascotMood = () => {
    let mood = 5; // neutral starting point
    
    if (breakfastMeals.length > 0) mood += 1;
    if (lunchMeals.length > 0) mood += 1;
    if (dinnerMeals.length > 0) mood += 1;
    if (snackMeals.length > 0) mood += 0.5;
    
    mood += todayLog.waterGlasses * 0.25;
    
    if (caloriePercentage > 110) mood -= 1;
    if (caloriePercentage < 50) mood -= 1;
    
    return Math.max(0, Math.min(mood, 10));
  };
  
  const mascotMood = calculateMascotMood();
  
  const handleAddWater = () => {
    incrementWater();
    
    if (todayLog.waterGlasses >= 8) {
      toast({
        title: "¡Meta alcanzada!",
        description: "Has completado tu ingesta diaria recomendada de agua.",
      });
    } else {
      toast({
        description: `Agua registrada: ${todayLog.waterGlasses} de 8 vasos`,
      });
    }
  };
  
  const handleRemoveWater = () => {
    if (todayLog.waterGlasses > 0) {
      decrementWater();
      toast({
        description: `Vaso de agua eliminado: ${todayLog.waterGlasses} de 8 vasos`,
      });
    }
  };
  
  const getDailyRecommendation = () => {
    if (breakfastMeals.length === 0) {
      return "Te saltaste el desayuno. ¡Es la comida más importante del día!";
    }
    
    if (totalProtein < 30) {
      return "Tu consumo de proteínas está bajo hoy. Considera añadir pollo, huevos o legumbres.";
    }
    
    if (todayLog.waterGlasses < 3) {
      return "Recuerda mantenerte hidratado. Intenta tomar al menos 8 vasos de agua al día.";
    }
    
    if (caloriePercentage > 100) {
      return "Has alcanzado tu meta calórica diaria. Considera opciones ligeras para el resto del día.";
    }
    
    return "¡Vas por buen camino! Sigue manteniendo este equilibrio nutricional.";
  };
  
  useEffect(() => {
    if (!hasExcess) return;
    
    let excessDetails = '';
    let shouldShowToast = false;
    const newDisplayedExcess = {...displayedExcess};
    
    if (caloriePercentage > 110 && !displayedExcess.calories) {
      excessDetails += `Calorías: ${calorieExcess}, `;
      newDisplayedExcess.calories = true;
      shouldShowToast = true;
    }
    
    if (proteinPercentage > 110 && !displayedExcess.protein) {
      excessDetails += `Proteína: ${proteinExcess}, `;
      newDisplayedExcess.protein = true;
      shouldShowToast = true;
    }
    
    if (carbsPercentage > 110 && !displayedExcess.carbs) {
      excessDetails += `Carbohidratos: ${carbsExcess}, `;
      newDisplayedExcess.carbs = true;
      shouldShowToast = true;
    }
    
    if (fatPercentage > 110 && !displayedExcess.fat) {
      excessDetails += `Grasas: ${fatExcess}, `;
      newDisplayedExcess.fat = true;
      shouldShowToast = true;
    }
    
    excessDetails = excessDetails.replace(/, $/, '');
    
    if (shouldShowToast && excessDetails) {
      toast({
        variant: "destructive",
        title: "¡Atención!",
        description: `Has excedido algunas de tus metas nutricionales diarias. ${excessDetails}`,
        action: <AlertTriangle className="h-5 w-5" />
      });
      
      setDisplayedExcess(newDisplayedExcess);
    }
  }, [caloriePercentage, proteinPercentage, carbsPercentage, fatPercentage]);

  return (
    <div className="pt-16 pb-4">
      <h1 className="text-2xl font-bold mb-6">Resumen Diario</h1>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Nutrición</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <ProgressCircle
              percentage={caloriePercentage}
              size={120}
              label="Calorías"
              value={`${Math.round(totalCalories)} / ${user.nutritionGoals.calories}`}
              showAlert={caloriePercentage > 110}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium">Proteínas</div>
              <div className="w-full progress-container mt-1">
                <div 
                  className={`progress-bar ${proteinPercentage > 110 ? 'bg-red-500' : 'bg-blue-500'}`} 
                  style={{ '--progress-width': `${Math.min(proteinPercentage, 100)}%` } as React.CSSProperties}
                ></div>
              </div>
              <div className="text-xs mt-1">
                {totalProtein.toFixed(1)}g / {user.nutritionGoals.protein}g
                {proteinExcess && <span className="text-red-500 ml-1 font-bold">{proteinExcess}</span>}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium">Carbohidratos</div>
              <div className="w-full progress-container mt-1">
                <div 
                  className={`progress-bar ${carbsPercentage > 110 ? 'bg-red-500' : 'bg-amber-500'}`} 
                  style={{ '--progress-width': `${Math.min(carbsPercentage, 100)}%` } as React.CSSProperties} 
                ></div>
              </div>
              <div className="text-xs mt-1">
                {totalCarbs.toFixed(1)}g / {user.nutritionGoals.carbs}g
                {carbsExcess && <span className="text-red-500 ml-1 font-bold">{carbsExcess}</span>}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium">Grasas</div>
              <div className="w-full progress-container mt-1">
                <div 
                  className={`progress-bar ${fatPercentage > 110 ? 'bg-red-500' : 'bg-green-500'}`} 
                  style={{ '--progress-width': `${Math.min(fatPercentage, 100)}%` } as React.CSSProperties}
                ></div>
              </div>
              <div className="text-xs mt-1">
                {totalFat.toFixed(1)}g / {user.nutritionGoals.fat}g
                {fatExcess && <span className="text-red-500 ml-1 font-bold">{fatExcess}</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Comidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            <MealIndicator 
              type="breakfast" 
              isCompleted={breakfastMeals.length > 0}
              label="Desayuno"
              count={breakfastMeals.length}
            />
            <MealIndicator 
              type="lunch" 
              isCompleted={lunchMeals.length > 0}
              label="Almuerzo"
              count={lunchMeals.length}
            />
            <MealIndicator 
              type="dinner" 
              isCompleted={dinnerMeals.length > 0}
              label="Cena"
              count={dinnerMeals.length}
            />
            <MealIndicator 
              type="snack" 
              isCompleted={snackMeals.length > 0}
              label="Snack"
              count={snackMeals.length}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-muted bg-opacity-50">
          <CardContent className="pt-6 flex flex-col items-center">
            <PineappleMascot mood={mascotMood} />
            <div className="mt-2 text-sm font-medium text-center">
              {mascotMood >= 7 ? '¡Excelente día!' : 
               mascotMood >= 4 ? 'Buen progreso' : 
               'Te falta completar actividades'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Consejo de hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{getDailyRecommendation()}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Hidratación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-32 bg-blue-100 rounded-b-full overflow-hidden border border-blue-200">
                <div 
                  className="absolute bottom-0 w-full bg-blue-500 animate-water-fill"
                  style={{ '--water-level': `${(todayLog.waterGlasses / 8) * 100}%` } as React.CSSProperties}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-bold text-lg text-blue-800">
                    {todayLog.waterGlasses}/8
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleAddWater} 
                variant="outline"
                disabled={todayLog.waterGlasses >= 8}
                className="flex items-center gap-2"
              >
                <Droplet className="h-4 w-4" />
                Agregar vaso
              </Button>
              
              <Button 
                onClick={handleRemoveWater} 
                variant="outline"
                disabled={todayLog.waterGlasses <= 0}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar vaso
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
