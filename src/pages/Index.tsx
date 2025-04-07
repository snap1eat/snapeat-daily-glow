
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user.isAuthenticated) {
      navigate('/');
    }
  }, [user.isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-2 text-green-600">SnapEat</h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tu asistente nutricional</h2>
        <p className="text-lg text-gray-600 mb-8">
          Controla tu alimentación, registra tus comidas y alcanza tus objetivos nutricionales de forma sencilla
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/auth')} 
            size="lg" 
            className="flex items-center gap-2"
          >
            <LogIn size={20} />
            Iniciar sesión
          </Button>
          <Button 
            onClick={() => {
              navigate('/auth');
              // We'll handle the switch to register in the Auth component
            }} 
            variant="outline" 
            size="lg"
            className="flex items-center gap-2"
          >
            <UserPlus size={20} />
            Registrarse
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
