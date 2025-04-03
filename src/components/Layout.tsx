
import { ReactNode } from 'react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-snapeat-background">
      <TopBar />
      <main className="snapeat-container">
        {children}
      </main>
      <div 
        className="fixed bottom-24 right-6 z-50"
        onClick={() => navigate('/food-log')}
      >
        <Button 
          size="lg" 
          className="h-14 w-14 rounded-full bg-snapeat-orange hover:bg-orange-600 text-white shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Layout;
