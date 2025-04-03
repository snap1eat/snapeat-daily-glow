
import { useUser } from '@/contexts/UserContext';
import { Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TopBar = () => {
  const { user, getTodayLog } = useUser();
  const { currentStreak } = user;
  const todayLog = getTodayLog();
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Generate recommendations based on user data
  const getRecommendations = () => {
    const calories = getTodayLog().meals.reduce(
      (total, meal) => total + meal.foods.reduce((mealTotal, food) => mealTotal + food.calories, 0),
      0
    );
    
    const breakfast = getTodayLog().meals.find(meal => meal.type === 'breakfast');
    const protein = getTodayLog().meals.reduce(
      (total, meal) => total + meal.foods.reduce((mealTotal, food) => mealTotal + food.protein, 0),
      0
    );
    
    const recommendations = [];
    
    if (!breakfast) {
      recommendations.push("Te saltaste el desayuno, prueba un smoothie con proteínas.");
    }
    
    if (calories < 500) {
      recommendations.push("Tu ingesta calórica está muy baja, considera agregar una comida nutritiva.");
    }
    
    if (protein < 30) {
      recommendations.push("Te recomendamos consumir más proteínas hoy.");
    }
    
    if (todayLog.waterGlasses < 4) {
      recommendations.push("Estás tomando poca agua hoy, intenta beber al menos 8 vasos.");
    }
    
    // Default recommendation if none apply
    if (recommendations.length === 0) {
      recommendations.push("¡Vas por buen camino! Mantén tu rutina saludable.");
    }
    
    return recommendations;
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30 border-b">
      <div className="max-w-md mx-auto flex justify-between items-center p-3">
        <div className="flex items-center">
          <div className="font-bold text-xl text-snapeat-green">Snapeat</div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            {Array.from({ length: Math.min(currentStreak, 7) }).map((_, i) => (
              <div 
                key={i} 
                className="w-6 h-6 flex items-center justify-center"
              >
                <span role="img" aria-label="crown" className="text-snapeat-yellow-dark text-lg">👑</span>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setShowRecommendations(true)}
            className="p-2 rounded-full bg-snapeat-yellow hover:bg-snapeat-yellow-dark transition-colors"
          >
            <Lightbulb className="h-5 w-5 text-snapeat-green" />
          </button>
        </div>
      </div>
      
      <Dialog open={showRecommendations} onOpenChange={setShowRecommendations}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recomendaciones para ti</DialogTitle>
            <DialogDescription>
              Basado en tus hábitos alimenticios de hoy
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 py-4">
            {getRecommendations().map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopBar;
