import { UserProfile } from '../types';

// Returns true if claimed today in Turkey time (Europe/Istanbul)
export const isClaimedTodayTR = (lastClaimedIsoOrDate: string | null): boolean => {
  if (!lastClaimedIsoOrDate) return false;

  const todayTR = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  const claimTR = lastClaimedIsoOrDate.length === 10
    ? lastClaimedIsoOrDate
    : new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Istanbul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date(lastClaimedIsoOrDate));

  return todayTR === claimTR;
};

// Returns remaining seconds until next TR Midnight (00:00:00)
export const getSecondsUntilTRMidnight = (): number => {
  const now = new Date();
  const trNow = new Date(now.getTime() + (3 * 60 + now.getTimezoneOffset()) * 60000);

  const trNextMidnight = new Date(trNow);
  trNextMidnight.setDate(trNextMidnight.getDate() + 1);
  trNextMidnight.setHours(0, 0, 0, 0);

  const diffMs = trNextMidnight.getTime() - trNow.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
};

// Returns calculated daily song rights and formatted string
export const getUserDailySongRights = (user: UserProfile | null) => {
  if (!user) {
    return {
      remainingSongs: 0,
      baseMaxDailySongs: 2,
      effectiveMaxSongs: 2,
      usedSongs: 0,
      extraCredits: 0,
      isBonusActive: false,
      display: '0/2 Hak'
    };
  }

  const baseMaxDailySongs = user.isPremium ? 5 : 2;
  const usedSongs = user.daily_songs_count || 0;
  const extraCredits = Math.max(0, user.extra_song_credits || 0);

  // Remaining free daily songs
  const remainingDaily = Math.max(0, baseMaxDailySongs - usedSongs);
  // Total remaining songs = remaining daily songs + permanent extra credits
  const remainingSongs = remainingDaily + extraCredits;
  const isBonusActive = extraCredits > 0;

  return {
    remainingSongs,
    baseMaxDailySongs,
    effectiveMaxSongs: baseMaxDailySongs + extraCredits,
    usedSongs,
    extraCredits,
    isBonusActive,
    display: `${remainingSongs}/${baseMaxDailySongs} Hak`
  };
};
