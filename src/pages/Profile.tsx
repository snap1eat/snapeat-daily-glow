
import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CameraCapture } from '@/components/CameraCapture';
import { UserSettings } from '@/components/UserSettings';
import { useToast } from '@/hooks/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfoTab from '@/components/profile/PersonalInfoTab';
import GoalsTab from '@/components/profile/GoalsTab';
import HabitsTab from '@/components/profile/HabitsTab';
import HealthTab from '@/components/profile/HealthTab';

const Profile = () => {
  const { user, updateProfile, updateNutritionGoals, calculateGoalsBasedOnObjective } = useUser();
  const { toast } = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const handleAvatarCapture = (photoData: string) => {
    updateProfile({
      avatar: photoData
    });
    
    toast({
      description: "Foto de perfil actualizada exitosamente."
    });
  };

  return (
    <div className="pt-16 pb-4">
      <ProfileHeader 
        profile={user.profile}
        totalEatsPoints={user.totalEatsPoints}
        onShowCamera={() => setShowCamera(true)}
        onShowSettings={() => setShowSettings(true)}
      />

      <Tabs defaultValue="personal">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="habits">Hábitos</TabsTrigger>
          <TabsTrigger value="health">Salud</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <PersonalInfoTab 
            profile={user.profile}
            updateProfile={updateProfile}
          />
        </TabsContent>
        
        <TabsContent value="goals">
          <GoalsTab 
            nutritionGoals={user.nutritionGoals}
            updateNutritionGoals={updateNutritionGoals}
            calculateGoalsBasedOnObjective={calculateGoalsBasedOnObjective}
          />
        </TabsContent>
        
        <TabsContent value="habits">
          <HabitsTab />
        </TabsContent>

        <TabsContent value="health">
          <HealthTab
            weight={user.profile.weight}
            height={user.profile.height}
          />
        </TabsContent>
      </Tabs>
      
      <CameraCapture 
        open={showCamera} 
        onOpenChange={setShowCamera}
        onCapture={handleAvatarCapture}
      />
      
      <UserSettings 
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default Profile;
