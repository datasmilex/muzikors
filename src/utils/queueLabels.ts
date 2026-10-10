import { Track } from '../types';
import { formatUserDisplayName, isBackgroundMusicRequester, isVenueOrBackgroundRequester } from './formatters';

export const isAnonymousTrack = (track: Partial<Track> & { requestedBy?: string }) =>
  track.isAnonymous === true ||
  track.is_anonymous === true ||
  track.requestedBy?.trim().toLowerCase() === 'anonim' ||
  Boolean(track.requestedBy?.startsWith('Anonim'));

/** Şarkıyı kimin istediğini kısa ve okunur biçimde döndürür */
export function getRequesterLabel(track: Track, currentUserId?: string | null): string {
  const isAnon = isAnonymousTrack(track);
  if (currentUserId && track.requestedByUserId === currentUserId && !isAnon) return 'Sen';
  if (isAnon) return 'Anonim';
  if (isVenueOrBackgroundRequester(track.requestedBy, track.requestedByUserId)) {
    return isBackgroundMusicRequester(track.requestedBy) ? 'Fon listesi' : 'Mekân';
  }
  if (!track.requestedBy) return 'Misafir';
  const name = track.requestedBy.replace(' VIP', '');
  if (name.startsWith('@') || name.includes('.***')) return name;
  return formatUserDisplayName(null, name);
}

/** Sıradaki şarkılar: çalan şarkı ve tekrarlar ayıklanır */
export function getUpcomingTracks(queue: Track[], nowPlaying: Track | null): Track[] {
  return queue.filter((track) => {
    if (track.isPlaying) return false;
    if ((track as any).status === 'playing') return false;
    if (nowPlaying) {
      if (track.id === nowPlaying.id) return false;
      if (track.spotifyUri && track.spotifyUri === nowPlaying.spotifyUri) return false;
    }
    return true;
  });
}

export const trackCover = (track: Partial<Track>) => track.albumCover || track.coverUrl || track.album_art || '/logo.png';
