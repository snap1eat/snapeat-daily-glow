
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PineappleMascot } from '@/components/PineappleMascot';
import { Camera, Settings } from 'lucide-react';
import { UserProfile } from '@/types/user';

interface ProfileHeaderProps {
  profile: UserProfile;
  totalEatsPoints: number;
  onShowCamera: () => void;
  onShowSettings: () => void;
}

const ProfileHeader = ({ profile, totalEatsPoints, onShowCamera, onShowSettings }: ProfileHeaderProps) => {
  const getInitials = () => {
    if (profile.name) {
      const nameParts = profile.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return profile.name.substring(0, 2).toUpperCase();
    }
    return profile.username.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="flex justify-end mb-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onShowSettings}
          className="rounded-full"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-3">
          <Avatar 
            className="w-24 h-24 border-2 border-primary cursor-pointer"
            onClick={onShowCamera}
          >
            {profile.avatar ? (
              <AvatarImage src={profile.avatar} alt={profile.username} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-lg font-bold">
                {getInitials()}
              </AvatarFallback>
            )}
            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 shadow-sm">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </Avatar>
          <div className="absolute -top-2 -right-2">
            <PineappleMascot size="sm" mood={10} showCrown={true} />
          </div>
        </div>
        <h1 className="text-xl font-bold">{profile.username}</h1>
        <p className="text-muted-foreground">Nivel {Math.floor(totalEatsPoints / 50) + 1}</p>
      </div>
    </>
  );
};

export default ProfileHeader;
