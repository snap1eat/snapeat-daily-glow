
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NutritionGoals } from '@/types/user';
import NutritionGoalSelector from './goals/NutritionGoalSelector';
import GoalSlider from './goals/GoalSlider';
import useGoalsForm from './goals/useGoalsForm';

interface GoalsTabProps {
  nutritionGoals: NutritionGoals;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  calculateGoalsBasedOnObjective: (objective: string) => NutritionGoals;
}

const GoalsTab = ({ nutritionGoals, updateNutritionGoals, calculateGoalsBasedOnObjective }: GoalsTabProps) => {
  const {
    formData,
    loading,
    handleInputChange,
    handleSaveNutrition,
    handleApplyGoalBasedObjective
  } = useGoalsForm({ nutritionGoals, updateNutritionGoals, calculateGoalsBasedOnObjective });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Objetivos nutricionales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <NutritionGoalSelector
            value={formData.nutritionGoal}
            onChange={(value) => handleInputChange('nutritionGoal', value)}
            applyGoalBasedObjective={handleApplyGoalBasedObjective}
          />
          
          <GoalSlider
            id="calories"
            label="Calorías diarias"
            value={formData.calories}
            min={1000}
            max={3500}
            step={50}
            onChange={(value) => handleInputChange('calories', value)}
          />
          
          <GoalSlider
            id="protein"
            label="Proteínas"
            value={formData.protein}
            min={40}
            max={200}
            step={5}
            onChange={(value) => handleInputChange('protein', value)}
          />
          
          <GoalSlider
            id="carbs"
            label="Carbohidratos"
            value={formData.carbs}
            min={100}
            max={400}
            step={10}
            onChange={(value) => handleInputChange('carbs', value)}
          />
          
          <GoalSlider
            id="fat"
            label="Grasas"
            value={formData.fat}
            min={30}
            max={150}
            step={5}
            onChange={(value) => handleInputChange('fat', value)}
          />
          
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
