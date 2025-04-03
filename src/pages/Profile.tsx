import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { PineappleMascot } from '@/components/PineappleMascot';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, updateProfile, updateNutritionGoals } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user.profile.name || '',
    username: user.profile.username || 'HealthyPineapple123',
    age: user.profile.age || 30,
    gender: user.profile.gender || 'no-answer',
    weight: user.profile.weight || 70,
    height: user.profile.height || 170,
    activityLevel: user.profile.activityLevel || 'moderate',
    calories: user.nutritionGoals.calories || 2000,
    protein: user.nutritionGoals.protein || 100,
    carbs: user.nutritionGoals.carbs || 250,
    fat: user.nutritionGoals.fat || 70,
    alcoholConsumption: 'no',
    caffeine: 'moderate',
    sugarIntake: 'moderate',
    sleepHours: 7,
    dietQuality: 3,
    favoriteFood: '',
    dietType: 'balanced',
    glycemia: '',
    cholesterol: '',
    triglycerides: '',
    hypertension: false,
    foodIntolerances: '',
    eatingDisorders: '',
    digestiveIssues: '',
    additionalHealthInfo: '',
    familyHypertension: false,
    familyDiabetes: false,
    familyCancer: false
  });
  
  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const calculateBMI = () => {
    const heightInMeters = formData.height / 100;
    return (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: formData.name,
      username: formData.username,
      age: Number(formData.age),
      gender: formData.gender as string,
      weight: Number(formData.weight),
      height: Number(formData.height),
      activityLevel: formData.activityLevel as string
    });
    
    toast({
      title: "Perfil actualizado",
      description: "Se han guardado tus datos personales."
    });
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

  const handleSaveHealthHistory = () => {
    toast({
      title: "Historial médico guardado",
      description: "Se ha actualizado tu información de salud."
    });
  };

  return (
    <div className="pt-16 pb-4">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-3">
          <PineappleMascot size="md" mood={8} />
        </div>
        <h1 className="text-xl font-bold">{formData.username}</h1>
        <p className="text-muted-foreground">Nivel {Math.floor(user.totalEatsPoints / 50) + 1}</p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="habits">Hábitos</TabsTrigger>
          <TabsTrigger value="health">Salud</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Género</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Femenino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no-answer" id="no-answer" />
                      <Label htmlFor="no-answer">Prefiero no decir</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">IMC (Índice de masa corporal)</span>
                  <span className="text-lg font-bold">{calculateBMI()}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Number(calculateBMI()) < 18.5 ? 'Bajo peso' :
                   Number(calculateBMI()) < 25 ? 'Peso normal' :
                   Number(calculateBMI()) < 30 ? 'Sobrepeso' :
                   'Obesidad'}
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="activity">Nivel de actividad física</Label>
                <Select 
                  value={formData.activityLevel} 
                  onValueChange={(value) => handleInputChange('activityLevel', value)}
                >
                  <SelectTrigger id="activity">
                    <SelectValue placeholder="Selecciona tu nivel de actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentario</SelectItem>
                    <SelectItem value="light">Ligeramente activo</SelectItem>
                    <SelectItem value="moderate">Moderadamente activo</SelectItem>
                    <SelectItem value="active">Muy activo</SelectItem>
                    <SelectItem value="extra_active">Extremadamente activo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="w-full mt-6" onClick={handleSaveProfile}>
                Guardar información
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goals">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Objetivos nutricionales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="habits">
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
                
                <Button className="w-full">
                  Guardar preferencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Historial de salud personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">IMC (Índice de masa corporal)</span>
                    <span className="text-lg font-bold">{calculateBMI()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Number(calculateBMI()) < 18.5 ? 'Bajo peso' :
                     Number(calculateBMI()) < 25 ? 'Peso normal' :
                     Number(calculateBMI()) < 30 ? 'Sobrepeso' :
                     'Obesidad'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="glycemia">Glicemia (mg/dL)</Label>
                    <Input
                      id="glycemia"
                      value={formData.glycemia}
                      onChange={(e) => handleInputChange('glycemia', e.target.value)}
                      placeholder="Ej: 85"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cholesterol">Colesterol (mg/dL)</Label>
                    <Input
                      id="cholesterol"
                      value={formData.cholesterol}
                      onChange={(e) => handleInputChange('cholesterol', e.target.value)}
                      placeholder="Ej: 180"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="triglycerides">Triglicéridos (mg/dL)</Label>
                    <Input
                      id="triglycerides"
                      value={formData.triglycerides}
                      onChange={(e) => handleInputChange('triglycerides', e.target.value)}
                      placeholder="Ej: 150"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 h-full pt-8">
                    <input
                      type="checkbox"
                      id="hypertension"
                      checked={formData.hypertension}
                      onChange={(e) => handleInputChange('hypertension', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="hypertension">Hipertensión</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food-intolerances">Intolerancias alimentarias</Label>
                  <Input
                    id="food-intolerances"
                    value={formData.foodIntolerances}
                    onChange={(e) => handleInputChange('foodIntolerances', e.target.value)}
                    placeholder="Ej: Lactosa, gluten, frutos secos..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eating-disorders">Trastornos alimentarios</Label>
                  <Input
                    id="eating-disorders"
                    value={formData.eatingDisorders}
                    onChange={(e) => handleInputChange('eatingDisorders', e.target.value)}
                    placeholder="Ej: Anorexia, bulimia..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="digestive-issues">Trastornos gastrointestinales</Label>
                  <Select 
                    value={formData.digestiveIssues || ""} 
                    onValueChange={(value) => handleInputChange('digestiveIssues', value)}
                  >
                    <SelectTrigger id="digestive-issues">
                      <SelectValue placeholder="Selecciona si aplica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguno</SelectItem>
                      <SelectItem value="ibs">Colon irritable</SelectItem>
                      <SelectItem value="gastritis">Gastritis</SelectItem>
                      <SelectItem value="gases">Gases</SelectItem>
                      <SelectItem value="constipation">Estreñimiento</SelectItem>
                      <SelectItem value="diarrhea">Diarrea</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional-health-info">Información adicional de salud</Label>
                  <Textarea
                    id="additional-health-info"
                    value={formData.additionalHealthInfo}
                    onChange={(e) => handleInputChange('additionalHealthInfo', e.target.value)}
                    placeholder="Cualquier otra información relevante sobre tu salud..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <div className="mt-8 mb-4">
                <h3 className="text-lg font-semibold mb-4">Antecedentes familiares</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="family-hypertension"
                      checked={formData.familyHypertension}
                      onChange={(e) => handleInputChange('familyHypertension', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="family-hypertension">Hipertensión</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="family-diabetes"
                      checked={formData.familyDiabetes}
                      onChange={(e) => handleInputChange('familyDiabetes', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="family-diabetes">Diabetes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="family-cancer"
                      checked={formData.familyCancer}
                      onChange={(e) => handleInputChange('familyCancer', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="family-cancer">Cáncer</Label>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-6" onClick={handleSaveHealthHistory}>
                Guardar historial médico
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
