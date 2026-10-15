import type { InvItem, ItemId, LevelId } from './types';

export const START_SCORE = 1000;
export const HINT_COST = 80;
export const WRONG_CODE_COST = 35;
export const LEVEL_CLEAR_BONUS = 150;
/** Max time-bonus points if the full escape finishes within TIME_BONUS_FULL_SEC. */
export const TIME_BONUS_MAX = 200;
/** Seconds under which the player still earns the full time bonus. */
export const TIME_BONUS_FULL_SEC = 360;
/** Seconds at/after which the time bonus is zero. */
export const TIME_BONUS_ZERO_SEC = 900;

/** Points awarded for finishing under the clock (linear decay after FULL). */
export const timeBonusForSeconds = (elapsedSec: number): number => {
  if (elapsedSec <= TIME_BONUS_FULL_SEC) return TIME_BONUS_MAX;
  if (elapsedSec >= TIME_BONUS_ZERO_SEC) return 0;
  const span = TIME_BONUS_ZERO_SEC - TIME_BONUS_FULL_SEC;
  return Math.round(
    TIME_BONUS_MAX * (1 - (elapsedSec - TIME_BONUS_FULL_SEC) / span)
  );
};

export const ITEM_META: Record<ItemId, InvItem> = {
  drawerKey: { id: 'drawerKey', icon: '/assets/click-play/item-drawer-key.png' },
  stickyNote: {
    id: 'stickyNote',
    icon: '/assets/click-play/item-sticky-note.png',
  },
  phoneCase: { id: 'phoneCase', icon: '/assets/click-play/item-phone-case.png' },
  screwdriver: {
    id: 'screwdriver',
    icon: '/assets/click-play/item-screwdriver.png',
  },
  cipherSheet: {
    id: 'cipherSheet',
    icon: '/assets/click-play/item-cipher-sheet.png',
  },
  crowbar: { id: 'crowbar', icon: '/assets/click-play/item-crowbar.png' },
  boltCutters: {
    id: 'boltCutters',
    icon: '/assets/click-play/item-bolt-cutters.png',
  },
  gateRemote: {
    id: 'gateRemote',
    icon: '/assets/click-play/item-gate-remote.png',
  },
};

export const LEVEL_ORDER: LevelId[] = ['bedroom', 'hallway', 'bay'];

export const LEVEL_BG: Record<LevelId, string> = {
  bedroom: '/assets/click-play/bg-bedroom.png',
  hallway: '/assets/click-play/bg-hallway.png',
  bay: '/assets/click-play/bg-loading-bay.png',
};

/** Ordered hints — each request costs HINT_COST and reveals the next line. */
export const HINTS: Record<LevelId, string[]> = {
  bedroom: [
    'hint_bedroom_1',
    'hint_bedroom_2',
    'hint_bedroom_3',
    'hint_bedroom_4',
  ],
  hallway: [
    'hint_hallway_1',
    'hint_hallway_2',
    'hint_hallway_3',
    'hint_hallway_4',
  ],
  bay: ['hint_bay_1', 'hint_bay_2', 'hint_bay_3', 'hint_bay_4'],
};
