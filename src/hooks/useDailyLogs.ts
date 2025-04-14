
import { DailyLog } from '@/types/user';

export const useDailyLogs = (
  user: any,
  setUser: React.Dispatch<React.SetStateAction<any>>
) => {
  const getTodayLog = (): DailyLog => {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = user.dailyLogs.find(log => log.date === today);
    
    if (todayLog) {
      return todayLog;
    }

    const newLog: DailyLog = {
      date: today,
      meals: [],
      waterGlasses: 0,
      streakDay: user.currentStreak + 1,
      eatsPoints: 0,
    };

    setUser(prev => ({
      ...prev,
      dailyLogs: [...prev.dailyLogs, newLog],
      currentStreak: prev.currentStreak + 1,
    }));

    return newLog;
  };

  return {
    getTodayLog
  };
};
