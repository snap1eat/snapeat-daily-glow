
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MealLog, Food } from '@/types/user';
import { Trash2, Edit, PlusCircle, MinusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fetchUserMeals } from '@/services/meals-service';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MealsList = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMeal, setEditMeal] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editType, setEditType] = useState('');
  const [editFoods, setEditFoods] = useState<any[]>([]);

  useEffect(() => {
    const loadMeals = async () => {
      try {
        setLoading(true);
        const userId = user.profile.id;
        const mealsData = await fetchUserMeals(userId, 90); // Obtener los últimos 90 días
        setMeals(mealsData);
      } catch (error) {
        console.error('Error loading meals:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las comidas',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user.isAuthenticated) {
      loadMeals();
    }
  }, [user.isAuthenticated, user.profile.id]);

  const formatMealDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  const translateMealType = (type: string) => {
    const types: Record<string, string> = {
      'breakfast': 'Desayuno',
      'lunch': 'Almuerzo',
      'dinner': 'Cena',
      'snack': 'Snack',
      'drink': 'Bebida'
    };
    return types[type] || type;
  };

  const handleEditMeal = (meal: any) => {
    setEditMeal(meal);
    setEditDate(meal.created_at.split('T')[0]);
    setEditType(meal.meal_type);
    setEditFoods(meal.foods || []);
    setIsDialogOpen(true);
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta comida?')) {
      try {
        const { error } = await supabase
          .from('meals')
          .delete()
          .eq('id', mealId);

        if (error) throw error;

        setMeals(meals.filter(meal => meal.id !== mealId));
        toast({
          title: 'Comida eliminada',
          description: 'La comida ha sido eliminada correctamente'
        });
      } catch (error) {
        console.error('Error deleting meal:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la comida',
          variant: 'destructive'
        });
      }
    }
  };

  const handleUpdateMeal = async () => {
    try {
      if (!editMeal) return;

      // Traducir el tipo de comida al español para la base de datos
      const mealTypeMapping: Record<string, string> = {
        'breakfast': 'desayuno',
        'lunch': 'almuerzo',
        'dinner': 'cena',
        'snack': 'snack',
        'drink': 'snack'
      };

      const dbMealType = mealTypeMapping[editType] || editType;

      // Calcular totales
      const totalCalories = editFoods.reduce((sum, food) => sum + food.calories, 0);
      const totalProtein = editFoods.reduce((sum, food) => sum + food.protein, 0);
      const totalCarbs = editFoods.reduce((sum, food) => sum + food.carbs, 0);
      const totalFats = editFoods.reduce((sum, food) => sum + food.fat, 0);
      const totalQuantity = editFoods.reduce((sum, food) => sum + food.quantity, 0);

      // Actualizar en la base de datos
      const { error } = await supabase
        .from('meals')
        .update({
          meal_type: dbMealType,
          date: editDate,
          cantidad: totalQuantity,
          total_calories: totalCalories,
          total_protein: totalProtein,
          total_carbs: totalCarbs,
          total_fats: totalFats,
          foods: editFoods
        })
        .eq('id', editMeal.id);

      if (error) throw error;

      // Actualizar la lista local
      setMeals(meals.map(meal => 
        meal.id === editMeal.id 
          ? { 
              ...meal, 
              meal_type: editType,
              created_at: new Date(editDate).toISOString(),
              foods: editFoods,
              total_calories: totalCalories,
              total_protein: totalProtein,
              total_carbs: totalCarbs,
              total_fats: totalFats
            } 
          : meal
      ));

      setIsDialogOpen(false);
      toast({
        title: 'Comida actualizada',
        description: 'Los cambios han sido guardados correctamente'
      });
    } catch (error) {
      console.error('Error updating meal:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la comida',
        variant: 'destructive'
      });
    }
  };

  const handleAddFood = () => {
    setEditFoods([
      ...editFoods,
      {
        id: crypto.randomUUID(),
        name: '',
        quantity: 1,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    ]);
  };

  const handleRemoveFood = (index: number) => {
    setEditFoods(editFoods.filter((_, i) => i !== index));
  };

  const handleFoodChange = (index: number, field: string, value: any) => {
    const newFoods = [...editFoods];
    newFoods[index] = {
      ...newFoods[index],
      [field]: field === 'name' ? value : Number(value)
    };
    setEditFoods(newFoods);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comidas registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Cargando comidas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comidas registradas</CardTitle>
      </CardHeader>
      <CardContent>
        {meals.length === 0 ? (
          <div className="text-center py-8">No hay comidas registradas</div>
        ) : (
          <div className="space-y-4">
            {meals.map((meal) => (
              <div key={meal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{translateMealType(meal.meal_type)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatMealDate(meal.created_at)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMeal(meal)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMeal(meal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-sm font-medium mb-1 mt-3">
                  <div>Alimento</div>
                  <div>Calorías</div>
                  <div>Proteínas</div>
                  <div>Cantidad</div>
                </div>
                
                {meal.foods && meal.foods.map((food: any, index: number) => (
                  <div key={index} className="grid grid-cols-4 gap-2 text-sm py-1 border-b last:border-0">
                    <div>{food.name}</div>
                    <div>{food.calories} kcal</div>
                    <div>{food.protein} g</div>
                    <div>{food.quantity}</div>
                  </div>
                ))}
                
                <div className="mt-2 pt-2 border-t flex justify-between text-sm">
                  <span className="font-medium">Total:</span>
                  <span>{meal.total_calories} kcal</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Editar comida</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha</label>
                  <Input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={editType} onValueChange={setEditType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Desayuno</SelectItem>
                      <SelectItem value="lunch">Almuerzo</SelectItem>
                      <SelectItem value="dinner">Cena</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                      <SelectItem value="drink">Bebida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Alimentos</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddFood}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Añadir alimento
                  </Button>
                </div>
                
                {editFoods.map((food, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 items-center">
                    <div className="col-span-2">
                      <Input
                        placeholder="Nombre"
                        value={food.name}
                        onChange={(e) => handleFoodChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Calorías"
                        value={food.calories}
                        onChange={(e) => handleFoodChange(index, 'calories', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Proteínas"
                        value={food.protein}
                        onChange={(e) => handleFoodChange(index, 'protein', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        value={food.quantity}
                        onChange={(e) => handleFoodChange(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFood(index)}
                      >
                        <MinusCircle className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleUpdateMeal}>
                Guardar cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MealsList;
