export function formatDuration(msOrSec: number): string {
  if (!msOrSec || isNaN(msOrSec) || msOrSec <= 0) return '0:00';
  const ms = msOrSec > 10000 ? msOrSec : msOrSec * 1000;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export function getSongCreditCost(durationMsOrSec: number): number | null {
  if (!durationMsOrSec || isNaN(durationMsOrSec)) return 10;
  const ms = durationMsOrSec > 10000 ? durationMsOrSec : durationMsOrSec * 1000;
  if (ms > 420000) return null; // > 7 mins: Blocked
  if (ms >= 330000) return 25;   // 5.5 - 7 mins: 25 credits
  if (ms >= 240000) return 15;   // 4 - 5.5 mins: 15 credits
  return 10;                     // < 4 mins: 10 credits
}
