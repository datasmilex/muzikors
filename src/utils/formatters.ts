export function formatDuration(msOrSec: number): string {
  if (!msOrSec || isNaN(msOrSec) || msOrSec <= 0) return '0:00';
  const ms = msOrSec > 10000 ? msOrSec : msOrSec * 1000;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export function formatUserDisplayName(username?: string | null, fullName?: string | null): string {
  if (username && typeof username === 'string' && username.trim() !== '') {
    const cleanUsername = username.trim().replace(/^@/, '');
    if (cleanUsername !== '' && !cleanUsername.startsWith('kullanici_')) {
      return `@${cleanUsername}`;
    }
  }
  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    return 'Anonim Müşteri';
  }
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length > 1) {
    const lastName = parts.pop()!;
    return `${parts.join(' ')} ${lastName.charAt(0).toUpperCase()}.***`;
  }
  return `${trimmed.charAt(0).toUpperCase()}.***`;
}

export function isVenueOrBackgroundRequester(name?: string | null, userId?: string | null): boolean {
  if (!name && !userId) return false;
  const n = (name || '').toLowerCase();
  const u = (userId || '').toLowerCase();
  return (
    n.includes('mekan') ||
    n.includes('kafe') ||
    n.includes('fon müz') ||
    n.includes('fon muz') ||
    n.includes('fon_müz') ||
    u === 'cafe_owner' ||
    u === 'venue' ||
    u === 'admin'
  );
}

export function isBackgroundMusicRequester(name?: string | null): boolean {
  if (!name) return false;
  const n = name.toLowerCase();
  return n.includes('fon') || n.includes('liste') || n.includes('background') || n.includes('spotify-bg');
}
