
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SwipeHandlerProps {
  children: ReactNode;
}

export const SwipeHandler = ({ children }: SwipeHandlerProps) => {
  const navigate = useNavigate();
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 100; // Mínima distancia para considerar un swipe
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  
  const pages = ['/', '/food-log', '/history', '/profile'];
  
  useEffect(() => {
    // Determinar el índice de la página actual basado en la URL
    const currentPath = window.location.pathname;
    const pageIndex = pages.indexOf(currentPath);
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
    }
  }, []);
  
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentPageIndex < pages.length - 1) {
      // Swipe izquierdo -> ir a la siguiente página
      navigate(pages[currentPageIndex + 1]);
      setCurrentPageIndex(prev => prev + 1);
    } else if (isRightSwipe && currentPageIndex > 0) {
      // Swipe derecho -> ir a la página anterior
      navigate(pages[currentPageIndex - 1]);
      setCurrentPageIndex(prev => prev - 1);
    }
    
    // Resetear los valores
    touchStartX.current = null;
    touchEndX.current = null;
  };
  
  return (
    <div 
      className="touch-container" 
      onTouchStart={onTouchStart} 
      onTouchMove={onTouchMove} 
      onTouchEnd={onTouchEnd}
      style={{ height: '100%', width: '100%' }}
    >
      {children}
    </div>
  );
};
