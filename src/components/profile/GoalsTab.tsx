
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { NutritionGoals } from '@/types/user';
import { getUserGoals, saveUserGoal, updateUserGoal, deleteUserGoal } from '@/services/goals-service';
import * as UserService from '@/services/user-service';

interface GoalsTabProps {
  nutritionGoals: NutritionGoals;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  calculateGoalsBasedOnObjective: (objective: string) => NutritionGoals;
}

const GoalsTab = ({ nutritionGoals, updateNutritionGoals, calculateGoalsBasedOnObjective }: GoalsTabProps) => {
  const { toast } = useToast();
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: 'weight',
    description: '',
    targetValue: 0,
    targetDate: ''
  });
  const [formData, setFormData] = useState({
    calories: nutritionGoals.calories || 2000,
    protein: nutritionGoals.protein || 100,
    carbs: nutritionGoals.carbs || 250,
    fat: nutritionGoals.fat || 70,
    nutritionGoal: 'maintain',
  });

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveNutrition = () => {
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

  useEffect(() => {
    fetchUserGoals();
  }, []);
  
  const fetchUserGoals = async () => {
    try {
      setLoading(true);
      const userId = await UserService.getCurrentUserId();
      const goals = await getUserGoals(userId);
      setUserGoals(goals);
    } catch (error) {
      console.error("Error fetching user goals:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus objetivos personales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddGoal = async () => {
    try {
      if (!newGoal.description) {
        toast({
          description: "La descripción del objetivo es obligatoria",
          variant: "destructive"
        });
        return;
      }
      
      setLoading(true);
      const userId = await UserService.getCurrentUserId();
      const targetDate = newGoal.targetDate ? new Date(newGoal.targetDate) : undefined;
      
      await saveUserGoal(
        userId,
        newGoal.type,
        newGoal.description,
        newGoal.targetValue || undefined,
        targetDate
      );
      
      setNewGoal({
        type: 'weight',
        description: '',
        targetValue: 0,
        targetDate: ''
      });
      
      await fetchUserGoals();
      
      toast({
        description: "Objetivo guardado exitosamente",
      });
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el objetivo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteGoal = async (goalId: string) => {
    try {
      setLoading(true);
      await deleteUserGoal(goalId);
      await fetchUserGoals();
      
      toast({
        description: "Objetivo eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el objetivo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleGoalAchieved = async (goalId: string, isAchieved: boolean) => {
    try {
      setLoading(true);
      await updateUserGoal(goalId, { is_achieved: !isAchieved });
      await fetchUserGoals();
      
      toast({
        description: isAchieved ? "Objetivo marcado como no logrado" : "¡Felicidades por lograr tu objetivo!",
      });
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del objetivo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getGoalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'weight': 'Peso',
      'fitness': 'Fitness',
      'nutrition': 'Nutrición',
      'health': 'Salud',
      'habit': 'Hábito',
      'other': 'Otro'
    };
    return labels[type] || 'Otro';
  };

  const getGoalTypeStyle = (type: string) => {
    const styles: Record<string, string> = {
      'weight': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'fitness': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'nutrition': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'health': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      'habit': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
      'other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
    };
    return styles[type] || styles['other'];
  };

  return (
    <>
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
            
            <Button className="w-full" onClick={handleSaveNutrition}>
              Guardar objetivos
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mis objetivos personales</CardTitle>
          <div className="text-sm text-muted-foreground">
            {userGoals.length} objetivos en total
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg space-y-4">
              <h4 className="font-medium">Agregar nuevo objetivo</h4>
              
              <div className="space-y-2">
                <Label htmlFor="goal-type">Tipo de objetivo</Label>
                <Select 
                  value={newGoal.type} 
                  onValueChange={(value) => setNewGoal({...newGoal, type: value})}
                >
                  <SelectTrigger id="goal-type">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">Peso</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="nutrition">Nutrición</SelectItem>
                    <SelectItem value="health">Salud</SelectItem>
                    <SelectItem value="habit">Hábito</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal-description">Descripción</Label>
                <Input 
                  id="goal-description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Ej: Bajar 5kg, Correr 5km, etc."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-target">Valor objetivo (opcional)</Label>
                  <Input 
                    id="goal-target"
                    type="number"
                    value={newGoal.targetValue || ''}
                    onChange={(e) => setNewGoal({...newGoal, targetValue: parseFloat(e.target.value) || 0})}
                    placeholder="Ej: 70"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goal-date">Fecha límite (opcional)</Label>
                  <Input 
                    id="goal-date"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleAddGoal}
                disabled={loading || !newGoal.description}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Agregar objetivo
              </Button>
            </div>
            
            <div className="space-y-4">
              {userGoals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tienes objetivos registrados. ¡Agrega uno!
                </div>
              ) : (
                userGoals.map((goal) => (
                  <div 
                    key={goal.id} 
                    className={`p-4 rounded-lg border ${goal.is_achieved ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-background'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getGoalTypeStyle(goal.goal_type)}`}>
                            {getGoalTypeLabel(goal.goal_type)}
                          </span>
                          {goal.is_achieved && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-100">
                              Logrado
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium">{goal.description}</h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          {goal.target_value && (
                            <div>Objetivo: {goal.target_value}</div>
                          )}
                          {goal.target_date && (
                            <div>Fecha límite: {format(new Date(goal.target_date), 'dd/MM/yyyy')}</div>
                          )}
                          {goal.current_value !== null && (
                            <div>Progreso actual: {goal.current_value} {goal.target_value ? `de ${goal.target_value}` : ''}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleGoalAchieved(goal.id, goal.is_achieved)}
                        >
                          {goal.is_achieved ? 'Desmarcar' : 'Logrado'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default GoalsTab;
