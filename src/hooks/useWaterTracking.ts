
import { useToast } from '@/hooks/use-toast';
import * as UserService from '@/services/user-service';
import { StorageService } from '@/services/storage-service';

export const useWaterTracking = (user: any, setUser: React.Dispatch<React.SetStateAction<any>>) => {
  const { toast } = useToast();

  const incrementWater = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (!user.isAuthenticated) {
        const updatedLogs = user.dailyLogs.map(log => {
          if (log.date === today) {
            return {
              ...log,
              waterGlasses: Math.min(log.waterGlasses + 1, 8),
            };
          }
          return log;
        });

        setUser(prev => ({
          ...prev,
          dailyLogs: updatedLogs,
        }));
        
        const userData = { ...user, dailyLogs: updatedLogs };
        StorageService.set('snapeat_user', JSON.stringify(userData));
        
        return;
      }
      
      const userId = await UserService.getCurrentUserId();
      
      // Using the new water logs service
      await UserService.incrementWaterIntake(userId, today);
      
      const updatedLogs = user.dailyLogs.map(log => {
        if (log.date === today) {
          return {
            ...log,
            waterGlasses: Math.min(log.waterGlasses + 1, 8),
          };
        }
        return log;
      });

      setUser(prev => ({
        ...prev,
        dailyLogs: updatedLogs,
      }));
      
      console.log("Water intake incremented successfully");
    } catch (error) {
      console.error("Error incrementing water:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el vaso de agua",
      });
    }
  };

  const decrementWater = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (!user.isAuthenticated) {
        const updatedLogs = user.dailyLogs.map(log => {
          if (log.date === today && log.waterGlasses > 0) {
            return {
              ...log,
              waterGlasses: log.waterGlasses - 1,
            };
          }
          return log;
        });

        setUser(prev => ({
          ...prev,
          dailyLogs: updatedLogs,
        }));
        
        const userData = { ...user, dailyLogs: updatedLogs };
        StorageService.set('snapeat_user', JSON.stringify(userData));
        
        return;
      }
      
      const userId = await UserService.getCurrentUserId();
      
      // Using the new water logs service
      await UserService.decrementWaterIntake(userId, today);
      
      const updatedLogs = user.dailyLogs.map(log => {
        if (log.date === today && log.waterGlasses > 0) {
          return {
            ...log,
            waterGlasses: log.waterGlasses - 1,
          };
        }
        return log;
      });

      setUser(prev => ({
        ...prev,
        dailyLogs: updatedLogs,
      }));
      
      console.log("Water intake decremented successfully");
    } catch (error) {
      console.error("Error decrementing water:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el vaso de agua",
      });
    }
  };

  return {
    incrementWater,
    decrementWater
  };
};
