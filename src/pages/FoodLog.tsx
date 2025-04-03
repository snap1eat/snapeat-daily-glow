
import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Utensils, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { FoodSearchResult } from '@/components/FoodSearchResult';

// Dummy food database
const foodDatabase = [
  { id: '1', name: 'Manzana', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, sodium: 2, fiber: 4, sugar: 19 },
  { id: '2', name: 'Plátano', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, sodium: 1, fiber: 3.1, sugar: 14 },
  { id: '3', name: 'Pollo a la parrilla', calories: 165, protein: 31, carbs: 0, fat: 3.6, sodium: 74, fiber: 0, sugar: 0 },
  { id: '4', name: 'Arroz blanco', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, sodium: 1, fiber: 0.4, sugar: 0.1 },
  { id: '5', name: 'Huevo', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, sodium: 62, fiber: 0, sugar: 0.6 },
  { id: '6', name: 'Pan integral', calories: 81, protein: 4, carbs: 13.8, fat: 1.1, sodium: 144, fiber: 2, sugar: 1.4 },
  { id: '7', name: 'Leche', calories: 42, protein: 3.4, carbs: 5, fat: 1, sodium: 44, fiber: 0, sugar: 5 },
  { id: '8', name: 'Aguacate', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, sodium: 7, fiber: 6.7, sugar: 0.7 },
  { id: '9', name: 'Yogur', calories: 59, protein: 3.5, carbs: 5, fat: 3.3, sodium: 36, fiber: 0, sugar: 5 },
];

const FoodLog = () => {
  const { logMeal } = useUser();
  const [step, setStep] = useState<'selectType' | 'selectFood' | 'summary'>('selectType');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<Array<{food: typeof foodDatabase[0], quantity: number}>>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredFoods = foodDatabase.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate scanning with a timeout
    setTimeout(() => {
      setIsScanning(false);
      
      // Add random foods to selection
      const randomFoods = [];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 random items
      
      for (let i = 0; i < numItems; i++) {
        const randomIndex = Math.floor(Math.random() * foodDatabase.length);
        const randomQuantity = Math.floor(Math.random() * 150) + 50; // 50-200g
        
        randomFoods.push({
          food: foodDatabase[randomIndex],
          quantity: randomQuantity
        });
      }
      
      setSelectedFoods(randomFoods);
      setStep('summary');
      
      toast({
        title: "Alimentos detectados",
        description: `Se han identificado ${randomFoods.length} alimentos.`
      });
    }, 2000);
  };

  const handleAddFood = (food: typeof foodDatabase[0]) => {
    setSelectedFoods(prev => [
      ...prev,
      { food, quantity: 100 } // Default to 100g
    ]);
    setSearchQuery('');
  };

  const handleRemoveFood = (index: number) => {
    setSelectedFoods(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    setSelectedFoods(prev => {
      const updated = [...prev];
      updated[index].quantity = newQuantity;
      return updated;
    });
  };

  const getTotalNutrition = () => {
    return selectedFoods.reduce((totals, { food, quantity }) => {
      const multiplier = quantity / 100; // Assuming database values are per 100g
      return {
        calories: totals.calories + food.calories * multiplier,
        protein: totals.protein + food.protein * multiplier,
        carbs: totals.carbs + food.carbs * multiplier,
        fat: totals.fat + food.fat * multiplier
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleSaveMeal = () => {
    if (selectedFoods.length === 0) {
      toast({
        variant: "destructive",
        title: "No hay alimentos seleccionados",
        description: "Por favor, agrega al menos un alimento."
      });
      return;
    }

    const foods = selectedFoods.map(({ food, quantity }) => ({
      id: uuidv4(),
      name: food.name,
      quantity,
      calories: food.calories * (quantity / 100),
      protein: food.protein * (quantity / 100),
      carbs: food.carbs * (quantity / 100),
      fat: food.fat * (quantity / 100),
      sodium: food.sodium * (quantity / 100),
      fiber: food.fiber * (quantity / 100),
      sugar: food.sugar * (quantity / 100),
    }));

    logMeal({
      id: uuidv4(),
      type: mealType,
      foods,
      timestamp: new Date()
    });

    toast({
      title: "Comida registrada",
      description: `Has registrado exitosamente tu ${
        mealType === 'breakfast' ? 'desayuno' :
        mealType === 'lunch' ? 'almuerzo' :
        mealType === 'dinner' ? 'cena' : 'merienda'
      }.`
    });

    navigate('/');
  };

  return (
    <div className="pt-16 pb-4">
      <h1 className="text-2xl font-bold mb-6">Registro de Comida</h1>
      
      {step === 'selectType' && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tipo de comida</CardTitle>
              <CardDescription>Selecciona qué estás por comer</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={mealType}
                onValueChange={(value) => setMealType(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de comida" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Desayuno</SelectItem>
                  <SelectItem value="lunch">Almuerzo</SelectItem>
                  <SelectItem value="dinner">Cena</SelectItem>
                  <SelectItem value="snack">Merienda</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="mt-6 space-y-4">
                <Button 
                  className="w-full" 
                  onClick={() => setStep('selectFood')}
                >
                  <Utensils className="mr-2 h-4 w-4" /> 
                  Continuar
                </Button>
                
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={handleScan}
                  disabled={isScanning}
                >
                  {isScanning ? "Escaneando..." : "Escanear alimento"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {step === 'selectFood' && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Buscar alimentos</CardTitle>
              <CardDescription>
                Busca y selecciona los alimentos que consumiste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Buscar alimento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow"
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredFoods.map(food => (
                  <FoodSearchResult 
                    key={food.id}
                    food={food}
                    onAdd={() => handleAddFood(food)}
                  />
                ))}
                {filteredFoods.length === 0 && searchQuery && (
                  <div className="p-4 text-center text-muted-foreground">
                    No se encontraron resultados
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Alimentos seleccionados ({selectedFoods.length})</h3>
                <div className="space-y-2">
                  {selectedFoods.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border rounded-md p-2">
                      <div>
                        <div className="font-medium">{item.food.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(item.food.calories * item.quantity / 100)} kcal
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value))}
                          className="w-20 mr-2"
                        />
                        <Label className="mr-2">g</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFood(index)}
                        >
                          &times;
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => setStep('summary')}
                  disabled={selectedFoods.length === 0}
                >
                  Continuar
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setStep('selectType')}
                >
                  Atrás
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {step === 'summary' && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resumen nutricional</CardTitle>
              <CardDescription>
                Resumen de tu {
                  mealType === 'breakfast' ? 'desayuno' :
                  mealType === 'lunch' ? 'almuerzo' :
                  mealType === 'dinner' ? 'cena' : 'merienda'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {selectedFoods.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium">{item.food.name}</div>
                      <div className="text-sm text-muted-foreground">{item.quantity}g</div>
                    </div>
                    <div className="text-right">
                      <div>{Math.round(item.food.calories * item.quantity / 100)} kcal</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-medium mb-2">Nutrientes totales</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Calorías</div>
                    <div className="font-medium">{Math.round(getTotalNutrition().calories)} kcal</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Proteínas</div>
                    <div className="font-medium">{Math.round(getTotalNutrition().protein)}g</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Carbohidratos</div>
                    <div className="font-medium">{Math.round(getTotalNutrition().carbs)}g</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Grasas</div>
                    <div className="font-medium">{Math.round(getTotalNutrition().fat)}g</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <Button 
                  className="w-full bg-snapeat-green hover:bg-green-600"
                  onClick={handleSaveMeal}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> 
                  Confirmar y guardar
                </Button>
                
                {!isScanning && (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setStep('selectFood')}
                  >
                    Editar alimentos
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FoodLog;
