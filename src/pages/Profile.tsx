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
import { useState, useEffect } from 'react';
import { PineappleMascot } from '@/components/PineappleMascot';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Plus, Settings, Trash2 } from 'lucide-react';
import { CameraCapture } from '@/components/CameraCapture';
import { UserSettings } from '@/components/UserSettings';
import { getUserGoals, saveUserGoal, updateUserGoal, deleteUserGoal } from '@/services/goals-service';
import * as UserService from '@/services/user-service';
import { format } from 'date-fns';

const Profile = () => {
  const { user, updateProfile, updateNutritionGoals, calculateGoalsBasedOnObjective } = useUser();
  const { toast } = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const [newGoal, setNewGoal] = useState({
    type: 'weight',
    description: '',
    targetValue: 0,
    targetDate: ''
  });
  const [loading, setLoading] = useState(false);
  
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
    nutritionGoal: 'maintain',
    glycemia: '',
    cholesterol: '',
    triglycerides: '',
    hypertension: false,
    foodIntolerances: '',
    digestiveIssues: 'none',
    additionalHealthInfo: '',
    familyHypertension: false,
    familyDiabetes: false,
    tobacco: 'none'
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

  const handleSaveHealthHistory = () => {
    toast({
      title: "Historial médico guardado",
      description: "Se ha actualizado tu información de salud."
    });
  };

  const getInitials = () => {
    if (formData.name) {
      const nameParts = formData.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return formData.name.substring(0, 2).toUpperCase();
    }
    return formData.username.substring(0, 2).toUpperCase();
  };
  
  const handleAvatarCapture = (photoData: string) => {
    updateProfile({
      avatar: photoData
    });
    
    toast({
      description: "Foto de perfil actualizada exitosamente."
    });
  };

  useEffect(() => {
    if (user.isAuthenticated) {
      fetchUserGoals();
    }
  }, [user.isAuthenticated]);
  
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
    <div className="pt-16 pb-4">
      <div className="flex justify-end mb-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowSettings(true)}
          className="rounded-full"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-3">
          <Avatar 
            className="w-24 h-24 border-2 border-primary cursor-pointer"
            onClick={() => setShowCamera(true)}
          >
            {user.profile.avatar ? (
              <AvatarImage src={user.profile.avatar} alt={formData.username} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-lg font-bold">
                {getInitials()}
              </AvatarFallback>
            )}
            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 shadow-sm">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </Avatar>
          <div className="absolute -top-2 -right-2">
            <PineappleMascot size="sm" mood={10} showCrown={true} />
          </div>
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
                  <Label htmlFor="digestive-issues">Trastornos gastrointestinales</Label>
                  <Select 
                    value={formData.digestiveIssues} 
                    onValueChange={(value) => handleInputChange('digestiveIssues', value)}
                  >
                    <SelectTrigger id="digestive-issues">
                      <SelectValue placeholder="Selecciona si aplica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
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
                </div>
              </div>
              
              <Button className="w-full mt-6" onClick={handleSaveHealthHistory}>
                Guardar historial médico
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <CameraCapture 
        open={showCamera} 
        onOpenChange={setShowCamera}
        onCapture={handleAvatarCapture}
      />
      
      <UserSettings 
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default Profile;
