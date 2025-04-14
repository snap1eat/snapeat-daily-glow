
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { NutritionGoals } from '@/types/user';
import * as UserService from '@/services/user-service';
import { getUserNutritionGoals, updateNutritionGoals as saveNutritionGoalsToDb } from '@/services/profile-service';

interface UseGoalsFormProps {
  nutritionGoals: NutritionGoals;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  calculateGoalsBasedOnObjective: (objective: string) => NutritionGoals;
}

const useGoalsForm = ({ nutritionGoals, updateNutritionGoals, calculateGoalsBasedOnObjective }: UseGoalsFormProps) => {
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
        
        console.log("Fetched nutrition goals:", userGoals);
        
        if (userGoals) {
          setFormData({
            calories: userGoals.calories || nutritionGoals.calories,
            protein: userGoals.protein || nutritionGoals.protein,
            carbs: userGoals.carbs || nutritionGoals.carbs,
            fat: userGoals.fat || nutritionGoals.fat,
            nutritionGoal: userGoals.nutrition_goal || 'maintain',
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
      
      console.log("Saving nutrition goals:", formData, "with nutrition goal:", formData.nutritionGoal);
      
      // Guardar en la base de datos con el nutrition_goal
      await saveNutritionGoalsToDb(
        userId, 
        {
          calories: Number(formData.calories),
          protein: Number(formData.protein),
          carbs: Number(formData.carbs),
          fat: Number(formData.fat)
        },
        formData.nutritionGoal
      );
      
      // Actualizar el estado del contexto
      await updateNutritionGoals({
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
        nutritionGoal: formData.nutritionGoal // Asegurarnos de actualizar también el nutritionGoal en el contexto
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

  return {
    formData,
    loading,
    handleInputChange,
    handleSaveNutrition,
    handleApplyGoalBasedObjective
  };
};

export default useGoalsForm;
