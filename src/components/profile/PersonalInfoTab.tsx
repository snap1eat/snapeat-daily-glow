
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/user';

interface PersonalInfoTabProps {
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const PersonalInfoTab = ({ profile, updateProfile }: PersonalInfoTabProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: profile.name || '',
    username: profile.username || 'HealthyPineapple123',
    age: profile.age || 30,
    gender: profile.gender || 'no-answer',
    weight: profile.weight || 70,
    height: profile.height || 170,
    activityLevel: profile.activityLevel || 'moderate',
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

  return (
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
  );
};

export default PersonalInfoTab;
