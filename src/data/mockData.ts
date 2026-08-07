import { Track, Venue } from '../types';

// Clean slate: no demo venues registered by default
export const MOCK_VENUES: Record<string, Venue> = {};

// Clean slate: no now playing track initially
export const CURRENTLY_PLAYING: Track | null = null;

// Clean slate: empty upcoming queue
export const UP_NEXT_QUEUE: Track[] = [];

