import { useState, useEffect, useRef, useCallback } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { usePlayer } from '@/contexts/PlayerContext';
import { Skeleton } from '@/components/ui/skeleton';
import type { Track } from '@/contexts/PlayerContext';
import HorizontalMusicCard from '@/components/HorizontalMusicCard';
import { authApi } from '@/lib/authApi';

const BATCH_SIZE = 100;
const MAX_RESULTS = 1000;

// Helper to get best image from JioSaavn
const getBestImage = (images: any[]) => {
  if (!images || !images.length) return undefined;
  const best = images.find(img => img.quality === '500x500') ||
               images.find(img => img.quality === '150x150') ||
               images[0];
  return best?.url;
};

// Helper to get best audio quality from JioSaavn
const getBestAudio = (downloads: any[]) => {
  if (!downloads || !downloads.length) return undefined;
  const best = downloads.find(d => d.quality === '320kbps') ||
               downloads.find(d => d.quality === '160kbps') ||
               downloads[downloads.length - 1];
  return best?.url;
};

// Helper to decode HTML entities (for JioSaavn titles, artists, etc.)
function decodeHtmlEntities(str: string) {
  if (!str) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [audiusResults, setAudiusResults] = useState<Track[]>([]);
  const [jiosaavnResults, setJiosaavnResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [playlists, setPlaylists] = useState<any[]>([]); // Add playlists state
  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const categories = [
    { name: 'Pop', color: 'bg-pink-500', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center' },
    { name: 'Hip-Hop', color: 'bg-orange-500', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop&crop=center' },
    { name: 'Rock', color: 'bg-red-500', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop&crop=center' },
    { name: 'Electronic', color: 'bg-purple-500', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center' },
    { name: 'R&B', color: 'bg-blue-500', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center' },
    { name: 'Country', color: 'bg-yellow-500', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop&crop=center' },
    { name: 'Jazz', color: 'bg-indigo-500', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop&crop=center' },
    { name: 'Classical', color: 'bg-green-500', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center' },
  ];

  const loadMoreResults = useCallback(async () => {
    if (!searchQuery.trim() || isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      // Fetch from Audius
      const response = await api.search(searchQuery, 'tracks', BATCH_SIZE, offset);
      const newTracks = response.data || [];

      // Fetch from JioSaavn (only on first page)
      let saavnTracks: Track[] = [];
      if (offset === 0) {
        const saavnResponse = await api.jiosaavnSongSearch(searchQuery, 0, BATCH_SIZE);
        saavnTracks = (saavnResponse?.data?.results || []).map((song: any) => ({
          id: song.id,
          title: decodeHtmlEntities(song.name),
          artist: decodeHtmlEntities(song.artists?.primary?.map((a: any) => a.name).join(', ')),
          user: song.artists?.primary?.[0] ? { name: decodeHtmlEntities(song.artists.primary[0].name) } : undefined,
          artwork: { '480x480': getBestImage(song.image) },
          streamUrl: getBestAudio(song.downloadUrl) || song.url,
          url: getBestAudio(song.downloadUrl) || song.url, // ensure url is set
          play_count: song.playCount,
          release_date: song.releaseDate,
          source: "jiosaavn", // ensure source is set
        }));
        setJiosaavnResults(saavnTracks);
      }

      if (offset === 0) {
        setAudiusResults(newTracks);
      } else {
        setAudiusResults(prev => {
          const existingIds = new Set(prev.map(track => track.id));
          const uniqueNewTracks = newTracks.filter(track => !existingIds.has(track.id));
          return [...prev, ...uniqueNewTracks];
        });
      }

      // Infinite scroll logic (Audius only)
      const totalResults = offset + newTracks.length;
      const hasMoreResults = newTracks.length === BATCH_SIZE && totalResults < MAX_RESULTS;
      setHasMore(hasMoreResults);

      if (hasMoreResults) {
        setOffset(prev => prev + BATCH_SIZE);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Failed to fetch search results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, offset, toast, hasMore]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1,
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMoreResults();
      }
    }, options);

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMoreResults]);

  // Handle search query changes
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim()) {
        setOffset(0);
        setHasMore(true);
        loadMoreResults();
      } else {
        setAudiusResults([]);
        setJiosaavnResults([]);
        setHasMore(true);
        setOffset(0);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Fetch playlists on mount
  useEffect(() => {
    const token = localStorage.getItem('echovibe_token');
    if (token) {
      authApi.getPlaylists(token)
        .then(({ playlists }) => setPlaylists(playlists))
        .catch(() => {}); // Optionally handle error
    }
  }, []);

  const handleCategoryClick = (category: string) => {
    setSearchQuery(category);
  };

  return (
    <div className="w-full p-4 sm:p-6 md:p-8 space-y-8 max-w-5xl mx-auto animate-fade-in pb-32">
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-4xl font-bold gradient-text">Search</h1>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 transition-colors"
          />
        </div>
      </div>
      {!searchQuery ? (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Browse all</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div
                key={category.name}
                className={`${category.color} rounded-lg p-4 h-32 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform group`}
                onClick={() => handleCategoryClick(category.name)}
              >
                <h3 className="text-white font-bold text-base sm:text-lg mb-2">{category.name}</h3>
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute -right-4 -bottom-4 w-16 h-16 sm:w-20 sm:h-20 rotate-12 rounded-lg shadow-lg group-hover:rotate-6 transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Spotify Results</h2>
          <div className="space-y-4">
            {jiosaavnResults.map((track, index) => (
              <HorizontalMusicCard
                key={track.id}
                track={track}
                playlist={jiosaavnResults}
                playlists={playlists}
                index={index}
              />
            ))}
            {isLoading && (
              Array(3).fill(0).map((_, i) => (
                <div key={`skeleton-saavn-${i}`} className="bg-white/5 rounded-lg h-24 animate-pulse" />
              ))
            )}
            {jiosaavnResults.length === 0 && !isLoading && (
              <div className="text-gray-400 text-center py-8">
                No Spotify results found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
