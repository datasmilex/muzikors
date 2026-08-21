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
