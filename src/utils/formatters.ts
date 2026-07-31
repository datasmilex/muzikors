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
  if (ms >= 240000) return 20;  // 4 - 7 mins: 20 credits
  return 10;                    // < 4 mins: 10 credits
}

export function calculateDiscountedPrice(basePrice: number, discountRate: number): number {
  if (!discountRate || discountRate <= 0) return basePrice;
  return Math.round(basePrice - (basePrice * discountRate / 100));
}

export function isHappyHourNow(isActive: boolean, startTime: string | null, endTime: string | null): boolean {
  if (!isActive || !startTime || !endTime) return false;
  
  // Create current time string in HH:MM format for Turkish time (UTC+3)
  const now = new Date();
  const trTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  const hours = trTime.getHours().toString().padStart(2, '0');
  const minutes = trTime.getMinutes().toString().padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;

  const start = startTime.slice(0, 5);
  const end = endTime.slice(0, 5);

  if (start <= end) {
    return currentTime >= start && currentTime <= end;
  } else {
    // Night shift happy hour (e.g., 22:00 to 02:00)
    return currentTime >= start || currentTime <= end;
  }
}
