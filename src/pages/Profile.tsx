import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/authApi';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.profilePicture || ''
  });
  const [settings, setSettings] = useState({
    highQualityAudio: true,
    notifications: true,
    autoplay: false
  });
  const { isShuffling, isRepeating, toggleShuffle, toggleRepeat } = usePlayer();

  const { toast } = useToast();
  const navigate = useNavigate();

  // Update profile state when user data changes
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        avatar: user.profilePicture || ''
      });
    }
  }, [user]);

  const stats = [
    { label: 'Playlists', value: '1' },
    { label: 'Liked Songs', value: '4' }
  ];

  // Handle profile save
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const { user: updatedUser } = await authApi.updateProfile(token, {
        name: profile.name,
        profilePicture: profile.avatar,
      });

      // Update local user state
      if (user) {
        user.name = updatedUser.name;
        user.profilePicture = updatedUser.profilePicture;
      }

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  // Handle settings change
  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    toast({
      title: "Settings Updated",
      description: `${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} has been ${value ? 'enabled' : 'disabled'}`,
    });
  };

  // Handle logout
  const handleLogout = () => {
    try {
      logout();
      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-white">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-white/20">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="bg-white/20 text-white text-4xl">
                {profile.name ? profile.name[0].toUpperCase() : <User className="w-16 h-16" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{profile.name || 'EchoVibe User'}</h1>
              <p className="text-white/80 mb-4">{profile.email}</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      variant="secondary"
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="secondary" 
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="secondary" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Edit Profile
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-white/10 rounded-lg">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <p className="text-sm text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Liked Songs & Recently Played Buttons (after stats) */}
        <div className="flex gap-4 justify-center mb-8">
          <Button
            className="bg-primary text-white hover:bg-primary/80 px-6 py-2 rounded-full shadow"
            onClick={() => navigate('/library')}
          >
            Liked Songs
          </Button>
          <Button
            className="bg-secondary text-white hover:bg-secondary/80 px-6 py-2 rounded-full shadow"
            onClick={() => navigate('/recent')}
          >
            Recently Played
          </Button>
        </div>
        {/* Settings Section (below profile header and buttons) */}
        <div className="bg-white/5 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="shuffle">Shuffle Mode</Label>
              <Switch
                id="shuffle"
                checked={isShuffling}
                onCheckedChange={toggleShuffle}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="repeat">Repeat Mode</Label>
              <Switch
                id="repeat"
                checked={isRepeating}
                onCheckedChange={toggleRepeat}
              />
            </div>
            {isEditing && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white/10 border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="avatar">Profile Picture URL</Label>
                  <Input
                    id="avatar"
                    value={profile.avatar}
                    onChange={(e) => setProfile(prev => ({ ...prev, avatar: e.target.value }))}
                    className="bg-white/10 border-white/20"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
