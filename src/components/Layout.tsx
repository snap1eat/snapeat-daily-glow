
import { ReactNode } from 'react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SwipeHandler } from './SwipeHandler';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <SwipeHandler>
      <div className="min-h-screen bg-snapeat-background">
        <TopBar />
        <main className={`snapeat-container ${isMobile ? 'pb-24' : 'pb-20'}`}>
          {children}
        </main>
        <div className="fixed bottom-24 right-6 z-50">
          <Button 
            size="lg" 
            className="h-14 w-14 rounded-full bg-snapeat-orange hover:bg-orange-600 text-white shadow-lg"
            onClick={() => navigate('/food-log')}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        <BottomNav />
      </div>
    </SwipeHandler>
  );
};

export default Layout;
