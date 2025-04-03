
import { Home, Camera, Clock, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  const navItems = [
    {
      icon: Home,
      label: 'Inicio',
      path: '/',
    },
    {
      icon: Camera,
      label: 'Captura',
      path: '/food-log',
    },
    {
      icon: Clock,
      label: 'Historial',
      path: '/history',
    },
    {
      icon: User,
      label: 'Perfil',
      path: '/profile',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-30">
      <div className="max-w-md mx-auto grid grid-cols-4 py-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${currentPath === item.path ? 'nav-item-active' : 'text-muted-foreground'}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
