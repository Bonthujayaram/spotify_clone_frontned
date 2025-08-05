import { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Volume1, VolumeX, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const BottomPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    pauseTrack, 
    resumeTrack,
    nextTrack,
    previousTrack,
    toggleLike,
    isLiked,
    audioUrl,
    playlist,
    isShuffling,
    isRepeating,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();
  const { toast } = useToast();
  
  // Remove all audioRef and direct DOM audio manipulation
  // We'll use only context for playback actions
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [prevVolume, setPrevVolume] = useState(100);
  const progressRef = useRef<HTMLDivElement>(null);

  // Listen for time/duration/volume updates via events on the global audio element
  useEffect(() => {
    const audio = document.getElementById('music-player') as HTMLAudioElement | null;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    };
    const updateVolume = () => {
      setVolume(Math.round(audio.volume * 100));
    };
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);
    audio.addEventListener('volumechange', updateVolume);
    // Set initial volume
    audio.volume = volume / 100;
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateTime);
      audio.removeEventListener('volumechange', updateVolume);
    };
  }, [currentTrack]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = document.getElementById('music-player') as HTMLAudioElement | null;
    if (!progressRef.current || !audio) return;
    const bounds = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = document.getElementById('music-player') as HTMLAudioElement | null;
    if (!audio || value.length === 0) return;
    const newVolume = value[0];
    setVolume(newVolume);
    audio.volume = newVolume / 100;
  };

  const toggleMute = () => {
    const audio = document.getElementById('music-player') as HTMLAudioElement | null;
    if (!audio) return;
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
      audio.volume = 0;
    } else {
      setVolume(prevVolume);
      audio.volume = prevVolume / 100;
    }
  };

  const handleToggleShuffle = () => {
    toggleShuffle();
    toast({
      title: isShuffling ? "Shuffle Disabled" : "Shuffle Enabled",
      description: isShuffling
        ? "Shuffle mode is now off."
        : "Shuffle mode is now on.",
      duration: 3000,
    });
  };

  const handleToggleRepeat = () => {
    toggleRepeat();
    toast({
      title: isRepeating ? "Repeat Disabled" : "Repeat Enabled",
      description: isRepeating
        ? "Repeat mode is now off."
        : "Repeat mode is now on.",
      duration: 3000,
    });
  };

  if (!currentTrack) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  const isCurrentTrackLiked = currentTrack ? isLiked(currentTrack.id) : false;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-4 md:left-60 z-50">
      <div className="flex flex-col gap-2 max-w-screen-xl mx-auto">
        {/* Progress bar */}
        <div 
          ref={progressRef}
          className="w-full h-1 bg-white/10 rounded-full cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-primary rounded-full relative group-hover:bg-white"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 w-full md:w-auto md:flex-1">
            <Link to="/now-playing" className="flex items-center gap-3 flex-1">
            <img 
              src={currentTrack.artwork?.['480x480'] || '/placeholder.svg'} 
              alt={currentTrack.title}
              className="w-14 h-14 rounded-lg object-cover"
            />
              <div className="min-w-0 flex-1">
              <p className="text-white font-medium truncate text-base">{currentTrack.title}</p>
              <p className="text-gray-400 text-sm truncate">{currentTrack.user?.name}</p>
            </div>
          </Link>
            <button 
              className={cn(
                "text-white/60 hover:text-primary transition-colors p-2",
                isCurrentTrackLiked && "text-primary"
              )}
              onClick={() => currentTrack && toggleLike(currentTrack)}
            >
              <Heart className={cn("w-5 h-5", isCurrentTrackLiked && "fill-current")} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-1 w-full md:w-auto md:flex-1">
            <div className="flex items-center gap-6">
              <button
                onClick={previousTrack}
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={isPlaying ? pauseTrack : resumeTrack}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-black" />
                ) : (
                  <Play className="w-5 h-5 text-black ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration || 0)}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
            <div className="flex items-center gap-2 min-w-[150px]">
              <button 
                onClick={toggleMute}
                className="text-white/60 hover:text-white transition-colors"
              >
                <VolumeIcon className="w-5 h-5" />
              </button>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-24"
              />
            </div>
            <button 
              className={cn("text-white/60 hover:text-white transition-colors", isShuffling && "text-primary")}
              onClick={handleToggleShuffle}
              aria-label="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button 
              className={cn("text-white/60 hover:text-white transition-colors", isRepeating && "text-primary")}
              onClick={handleToggleRepeat}
              aria-label="Repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomPlayer;
