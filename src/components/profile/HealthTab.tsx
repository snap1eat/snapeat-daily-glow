
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface HealthTabProps {
  weight: number;
  height: number;
}

const HealthTab = ({ weight, height }: HealthTabProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    glycemia: '',
    cholesterol: '',
    triglycerides: '',
    hypertension: false,
    foodIntolerances: '',
    digestiveIssues: 'none',
    additionalHealthInfo: '',
    familyHypertension: false,
    familyDiabetes: false,
  });
  
  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const calculateBMI = () => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const handleSaveHealthHistory = () => {
    toast({
      title: "Historial médico guardado",
      description: "Se ha actualizado tu información de salud."
    });
  };

  return (
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
  );
};

export default HealthTab;
