
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { NutritionGoals } from '@/types/user';
import * as UserService from '@/services/user-service';
import { getUserNutritionGoals, updateNutritionGoals } from '@/services/profile-service';

interface GoalsTabProps {
  nutritionGoals: NutritionGoals;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  calculateGoalsBasedOnObjective: (objective: string) => NutritionGoals;
}

const GoalsTab = ({ nutritionGoals, updateNutritionGoals, calculateGoalsBasedOnObjective }: GoalsTabProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    calories: nutritionGoals.calories || 2000,
    protein: nutritionGoals.protein || 100,
    carbs: nutritionGoals.carbs || 250,
    fat: nutritionGoals.fat || 70,
    nutritionGoal: 'maintain',
  });

  useEffect(() => {
    const fetchUserGoals = async () => {
      try {
        setLoading(true);
        const userId = await UserService.getCurrentUserId();
        const userGoals = await getUserNutritionGoals(userId);
        
        if (userGoals) {
          setFormData({
            calories: userGoals.calories || nutritionGoals.calories,
            protein: userGoals.protein || nutritionGoals.protein,
            carbs: userGoals.carbs || nutritionGoals.carbs,
            fat: userGoals.fat || nutritionGoals.fat,
            nutritionGoal: userGoals.nutritionGoal || 'maintain',
          });
        }
      } catch (error) {
        console.error("Error fetching nutrition goals:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserGoals();
  }, [nutritionGoals]);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveNutrition = async () => {
    try {
      setLoading(true);
      const userId = await UserService.getCurrentUserId();
      
      await updateNutritionGoals(
        userId, 
        {
          calories: Number(formData.calories),
          protein: Number(formData.protein),
          carbs: Number(formData.carbs),
          fat: Number(formData.fat)
        },
        formData.nutritionGoal
      );
      
      updateNutritionGoals({
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat)
      });
      
      toast({
        title: "Objetivos actualizados",
        description: "Se han guardado tus objetivos nutricionales."
      });
    } catch (error) {
      console.error("Error saving nutrition goals:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los objetivos nutricionales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplyGoalBasedObjective = (objective: string) => {
    const newGoals = calculateGoalsBasedOnObjective(objective);
    setFormData(prev => ({
      ...prev,
      nutritionGoal: objective,
      calories: newGoals.calories,
      protein: newGoals.protein,
      carbs: newGoals.carbs,
      fat: newGoals.fat
    }));
    
    toast({
      description: "Objetivos nutricionales actualizados según tu objetivo."
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Objetivos nutricionales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nutrition-goal">Mi objetivo principal es</Label>
            <Select 
              value={formData.nutritionGoal} 
              onValueChange={(value) => {
                handleInputChange('nutritionGoal', value);
                handleApplyGoalBasedObjective(value);
              }}
            >
              <SelectTrigger id="nutrition-goal">
                <SelectValue placeholder="Selecciona tu objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="muscle_gain">Incrementar mi masa muscular</SelectItem>
                <SelectItem value="weight_loss">Bajar de peso</SelectItem>
                <SelectItem value="weight_gain">Subir de peso</SelectItem>
                <SelectItem value="immune_boost">Fortalecer mi sistema inmune</SelectItem>
                <SelectItem value="maintain">Mantener mi peso actual</SelectItem>
                <SelectItem value="energy">Aumentar mi energía diaria</SelectItem>
                <SelectItem value="performance">Mejorar mi rendimiento deportivo</SelectItem>
                <SelectItem value="health">Mejorar mi salud general</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="calories">Calorías diarias</Label>
              <span className="font-medium">{formData.calories} kcal</span>
            </div>
            <Slider
              id="calories"
              min={1000}
              max={3500}
              step={50}
              value={[formData.calories]}
              onValueChange={(value) => handleInputChange('calories', value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="protein">Proteínas</Label>
              <span className="font-medium">{formData.protein} g</span>
            </div>
            <Slider
              id="protein"
              min={40}
              max={200}
              step={5}
              value={[formData.protein]}
              onValueChange={(value) => handleInputChange('protein', value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="carbs">Carbohidratos</Label>
              <span className="font-medium">{formData.carbs} g</span>
            </div>
            <Slider
              id="carbs"
              min={100}
              max={400}
              step={10}
              value={[formData.carbs]}
              onValueChange={(value) => handleInputChange('carbs', value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="fat">Grasas</Label>
              <span className="font-medium">{formData.fat} g</span>
            </div>
            <Slider
              id="fat"
              min={30}
              max={150}
              step={5}
              value={[formData.fat]}
              onValueChange={(value) => handleInputChange('fat', value[0])}
            />
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleSaveNutrition}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar objetivos'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsTab;
