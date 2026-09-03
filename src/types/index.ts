export type DrawStatus = 'ready' | 'spinning' | 'revealing' | 'complete';

export interface DrawConfig {
  eventTitle: string;
  subtitle: string;
  startNumber: number;
  endNumber: number;
  winnerCount: number;
  excludedNumbers: number[];
  soundEnabled: boolean;
}

export interface DrawState extends DrawConfig {
  winners: number[];
  status: DrawStatus;
  revealedCount: number;
  isLiveMode: boolean;
  drawTimestamp: number | null;
}

export const DEFAULT_CONFIG: DrawConfig = {
  eventTitle: 'ABC Inauguration',
  subtitle: 'Lucky Coupon Draw',
  startNumber: 1,
  endNumber: 500,
  winnerCount: 50,
  excludedNumbers: [],
  soundEnabled: false,
};

export const DEFAULT_STATE: DrawState = {
  ...DEFAULT_CONFIG,
  winners: [],
  status: 'ready',
  revealedCount: 0,
  isLiveMode: false,
  drawTimestamp: null,
};

export const STORAGE_KEY = 'lucky-coupon-draw-state';
