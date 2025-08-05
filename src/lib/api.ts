const API_BASE_URL = import.meta.env.VITE_API_URL;
const JIOSAAVN_API_URL = 'https://saavn.dev/api';
const RECENTLY_PLAYED_API_URL = import.meta.env.VITE_RECENTLY_PLAYED_API_URL;

export const api = {
  // Search
  search: async (query: string, type: string = 'tracks', limit: number = 50, offset: number = 0) => {
    const url = new URL(`${API_BASE_URL}/search`);
    url.searchParams.append('query', encodeURIComponent(query));
    url.searchParams.append('type', type);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());
    const response = await fetch(url.toString());
    return response.json();
  },

  // Tracks
  getTrack: async (trackId: string) => {
    const response = await fetch(`${API_BASE_URL}/tracks/${trackId}`);
    return response.json();
  },

  getStreamUrl: async (trackId: string) => {
    const response = await fetch(`${API_BASE_URL}/tracks/${trackId}/stream`);
    return response.json();
  },

  // Users
  getUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    return response.json();
  },

  getUserTracks: async (userId: string, limit: number = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/tracks?limit=${limit}`
    );
    return response.json();
  },

  // Trending
  getTrending: async (time: string = 'week', limit: number = 10) => {
    const url = new URL(`${API_BASE_URL}/trending`);
    url.searchParams.append('limit', limit.toString());
    if (time) url.searchParams.append('time', time);
    const response = await fetch(url.toString());
    return response.json();
  },

  getTrendingArtists: async (limit: number = 10) => {
    const url = new URL(`${API_BASE_URL}/trending-artists`);
    url.searchParams.append('limit', limit.toString());
    const response = await fetch(url.toString());
    return response.json();
  },

  getTrendingPlaylists: async (limit: number = 10) => {
    const url = new URL(`${API_BASE_URL}/trending-playlists`);
    url.searchParams.append('limit', limit.toString());
    const response = await fetch(url.toString());
    return response.json();
  },

  // Popular
  getPopular: async (limit: number = 10) => {
    const url = new URL(`${API_BASE_URL}/popular`);
    url.searchParams.append('limit', limit.toString());
    const response = await fetch(url.toString());
    return response.json();
  },

  getRecentTracks: async (limit: number = 10) => {
    const url = new URL(`${API_BASE_URL}/recent`);
    url.searchParams.append('limit', limit.toString());
    const response = await fetch(url.toString());
    return response.json();
  },

  // Recent
  getRecent: async (limit: number = 10) => {
    const url = new URL(`${API_BASE_URL}/recent`);
    url.searchParams.append('limit', limit.toString());
    const response = await fetch(url.toString());
    return response.json();
  },

  // Playlists
  getPlaylist: async (playlistId: string) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`);
    return response.json();
  },

  jiosaavnSongSearch: async (query: string, page: number = 0, limit: number = 100) => {
    const url = `${JIOSAAVN_API_URL}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    const response = await fetch(url);
    return response.json();
  },

  getRecentlyPlayed: async (token: string) => {
    const response = await fetch(`${RECENTLY_PLAYED_API_URL}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
};

export const jioSaavnApi = {
  // Trending Modules (for tracks, playlists, etc.)
  getTrendingModules: async (language = 'english') => {
    const url = `${JIOSAAVN_API_URL}/modules?language=${encodeURIComponent(language)}`;
    const response = await fetch(url);
    return response.json();
  },
  // Trending Artists
  getTrendingArtists: async (page = 1, count = 10) => {
    const url = `${JIOSAAVN_API_URL}/artists?sortBy=popularity&sortOrder=desc&page=${page}&songCount=${count}&albumCount=${count}`;
    const response = await fetch(url);
    return response.json();
  },
  getSongsByIds: async (ids: string[], link?: string) => {
    const idsParam = ids.join(',');
    let url = `${JIOSAAVN_API_URL}/songs?ids=${encodeURIComponent(idsParam)}`;
    if (link) url += `&link=${encodeURIComponent(link)}`;
    const response = await fetch(url);
    return response.json();
  },
}; 
