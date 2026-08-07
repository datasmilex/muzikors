export function formatDuration(msOrSec: number): string {
  if (!msOrSec || isNaN(msOrSec) || msOrSec <= 0) return '0:00';
  const ms = msOrSec > 10000 ? msOrSec : msOrSec * 1000;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
