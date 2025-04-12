
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { fetchUserHabits, saveUserHabits, UserHabit } from '@/services/habits-service';
import { Skeleton } from '@/components/ui/skeleton';

const HabitsTab = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Omit<UserHabit, 'id'>>({
    alcoholConsumption: 'no',
    caffeine: 'moderate',
    sugarIntake: 'moderate',
    sleepHours: 7,
    dietQuality: 3,
    favoriteFood: '',
    dietType: 'balanced',
    tobacco: 'none'
  });
  
  // Fetch user habits when component mounts
  useEffect(() => {
    const loadUserHabits = async () => {
      if (!user.isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        const habits = await fetchUserHabits(user.profile.id);
        console.log("Fetched user habits:", habits);
        if (habits) {
          setFormData({
            alcoholConsumption: habits.alcoholConsumption,
            caffeine: habits.caffeine,
            sugarIntake: habits.sugarIntake,
            sleepHours: habits.sleepHours,
            dietQuality: habits.dietQuality,
            favoriteFood: habits.favoriteFood,
            dietType: habits.dietType,
            tobacco: habits.tobacco
          });
        }
      } catch (error) {
        console.error('Error loading user habits:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los hábitos del usuario.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserHabits();
  }, [user.isAuthenticated, user.profile.id]);
  
  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSavePreferences = async () => {
    if (!user.isAuthenticated) {
      toast({
        title: "Autenticación requerida",
        description: "Debe iniciar sesión para guardar sus preferencias."
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log("Saving habits:", formData);
      const success = await saveUserHabits(user.profile.id, formData);
      
      if (success) {
        toast({
          title: "Preferencias guardadas",
          description: "Se han guardado tus preferencias de hábitos."
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron guardar las preferencias.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving habits:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Hábitos y preferencias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="alcohol">Consumo de alcohol</Label>
            <Select 
              value={formData.alcoholConsumption} 
              onValueChange={(value) => handleInputChange('alcoholConsumption', value)}
            >
              <SelectTrigger id="alcohol">
                <SelectValue placeholder="Selecciona tu consumo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No consumo</SelectItem>
                <SelectItem value="occasional">Ocasional</SelectItem>
                <SelectItem value="moderate">Moderado</SelectItem>
                <SelectItem value="frequent">Frecuente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tobacco">Consumo de tabaco</Label>
            <Select 
              value={formData.tobacco} 
              onValueChange={(value) => handleInputChange('tobacco', value)}
            >
              <SelectTrigger id="tobacco">
                <SelectValue placeholder="Selecciona tu consumo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No consumo</SelectItem>
                <SelectItem value="occasional">Ocasional</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="heavy">Intenso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="caffeine">Consumo de cafeína</Label>
            <Select 
              value={formData.caffeine} 
              onValueChange={(value) => handleInputChange('caffeine', value)}
            >
              <SelectTrigger id="caffeine">
                <SelectValue placeholder="Selecciona tu consumo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No consumo</SelectItem>
                <SelectItem value="light">Ligero</SelectItem>
                <SelectItem value="moderate">Moderado</SelectItem>
                <SelectItem value="heavy">Intenso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sugar">Consumo de azúcar</Label>
            <Select 
              value={formData.sugarIntake} 
              onValueChange={(value) => handleInputChange('sugarIntake', value)}
            >
              <SelectTrigger id="sugar">
                <SelectValue placeholder="Selecciona tu consumo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Bajo</SelectItem>
                <SelectItem value="moderate">Moderado</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="sleep">Horas de sueño</Label>
              <span className="font-medium">{formData.sleepHours} horas</span>
            </div>
            <Slider
              id="sleep"
              min={4}
              max={12}
              step={0.5}
              value={[formData.sleepHours]}
              onValueChange={(value) => handleInputChange('sleepHours', value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="diet-quality">Calidad de la dieta</Label>
              <span className="font-medium">{
                formData.dietQuality === 1 ? 'Muy mala' :
                formData.dietQuality === 2 ? 'Regular' :
                formData.dietQuality === 3 ? 'Normal' :
                formData.dietQuality === 4 ? 'Buena' :
                'Excelente'
              }</span>
            </div>
            <Slider
              id="diet-quality"
              min={1}
              max={5}
              step={1}
              value={[formData.dietQuality]}
              onValueChange={(value) => handleInputChange('dietQuality', value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="favorite-food">Comida favorita</Label>
            <Input
              id="favorite-food"
              value={formData.favoriteFood}
              onChange={(e) => handleInputChange('favoriteFood', e.target.value)}
              placeholder="Ej: Pasta, Ensalada, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="diet-type">Tipo de dieta</Label>
            <Select 
              value={formData.dietType} 
              onValueChange={(value) => handleInputChange('dietType', value)}
            >
              <SelectTrigger id="diet-type">
                <SelectValue placeholder="Selecciona tu tipo de dieta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Balanceada</SelectItem>
                <SelectItem value="vegetarian">Vegetariana</SelectItem>
                <SelectItem value="vegan">Vegana</SelectItem>
                <SelectItem value="keto">Cetogénica</SelectItem>
                <SelectItem value="paleo">Paleo</SelectItem>
                <SelectItem value="mediterranean">Mediterránea</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleSavePreferences}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar preferencias'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitsTab;
