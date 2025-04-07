
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ChevronRight, LogIn, UserPlus } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface FormValues {
  name: string;
  email: string;
  password: string;
  healthGoal: string;
  additionalInfo: string;
}

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  healthGoal?: string;
  form?: string;
}

const Auth = () => {
  const navigate = useNavigate();
  const { login, signup, user } = useUser();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
    healthGoal: 'weight_loss',
    additionalInfo: '',
  });
  const [errors, setErrors] = useState<Errors>({});

  // Redirect if already logged in
  if (user.isAuthenticated) {
    navigate('/');
    return null;
  }

  const validateForm = () => {
    const newErrors: Errors = {};
    let isValid = true;

    if (!isLogin && !formValues.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
      isValid = false;
    }

    if (!formValues.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formValues.email)) {
      newErrors.email = 'El correo electrónico no es válido';
      isValid = false;
    }

    if (!formValues.password) {
      newErrors.password = 'La contraseña es obligatoria';
      isValid = false;
    } else if (!isLogin && formValues.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      isValid = false;
    }

    if (!isLogin && step === 2 && !formValues.healthGoal) {
      newErrors.healthGoal = 'Selecciona un objetivo nutricional';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleRadioChange = (value: string) => {
    setFormValues({
      ...formValues,
      healthGoal: value,
    });
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      if (isLogin) {
        await login(formValues.email, formValues.password);
        navigate('/');
      } else {
        if (step === 1) {
          handleNextStep();
          return;
        }

        await signup(formValues.email, formValues.password, {
          name: formValues.name,
          healthGoals: [formValues.healthGoal]
        });

        toast({
          title: "¡Cuenta creada!",
          description: "Por favor, inicia sesión para continuar",
        });

        setIsLogin(true);
        setStep(1);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = 'Ha ocurrido un error. Por favor, intenta de nuevo.';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este correo ya está registrado. Intenta iniciar sesión.';
      } else if (error.message?.includes('Invalid login')) {
        errorMessage = 'Correo o contraseña incorrectos.';
      }
      
      setErrors({ ...errors, form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {isLogin ? 'Iniciar sesión' : (step === 1 ? 'Crear cuenta' : 'Tu objetivo nutricional')}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? 'Ingresa tus datos para acceder' : (
              step === 1 ? 'Completa el formulario para registrarte' : 'Selecciona tu objetivo principal'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.form && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && step === 1 && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Introduce tu nombre"
                  value={formValues.name}
                  onChange={handleInputChange}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
            )}

            {(isLogin || step === 1) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formValues.email}
                    onChange={handleInputChange}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    {isLogin && (
                      <a href="#" className="text-sm text-blue-500 hover:underline">
                        ¿Olvidaste tu contraseña?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={isLogin ? "Tu contraseña" : "Mínimo 8 caracteres"}
                      value={formValues.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>
              </>
            )}

            {!isLogin && step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>¿Cuál es tu objetivo nutricional?</Label>
                  <RadioGroup 
                    value={formValues.healthGoal} 
                    onValueChange={handleRadioChange}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weight_loss" id="weight_loss" />
                      <Label htmlFor="weight_loss">Perder peso</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weight_gain" id="weight_gain" />
                      <Label htmlFor="weight_gain">Aumentar peso</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="muscle_gain" id="muscle_gain" />
                      <Label htmlFor="muscle_gain">Incrementar masa muscular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maintain" id="maintain" />
                      <Label htmlFor="maintain">Mantener peso actual</Label>
                    </div>
                  </RadioGroup>
                  {errors.healthGoal && <p className="text-sm text-red-500">{errors.healthGoal}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Cuéntanos más sobre tu objetivo (opcional)</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    placeholder="Por ejemplo: quiero mejorar mi condición física..."
                    value={formValues.additionalInfo}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            <div className={`flex ${!isLogin && step === 2 ? 'justify-between' : 'justify-center'} mt-6`}>
              {!isLogin && step === 2 && (
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  Atrás
                </Button>
              )}
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                ) : isLogin ? (
                  <LogIn size={18} />
                ) : step === 1 ? (
                  <ChevronRight size={18} />
                ) : (
                  <UserPlus size={18} />
                )}
                {isLogin ? 'Iniciar sesión' : (step === 1 ? 'Siguiente' : 'Crear cuenta')}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setStep(1);
                  setErrors({});
                }}
                className="ml-1 text-blue-500 hover:underline"
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
