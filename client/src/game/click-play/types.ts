export type ItemId =
  | 'drawerKey'
  | 'stickyNote'
  | 'phoneCase'
  | 'screwdriver'
  | 'cipherSheet'
  | 'crowbar'
  | 'boltCutters'
  | 'gateRemote';

export type LevelId = 'bedroom' | 'hallway' | 'bay';

export interface InvItem {
  id: ItemId;
  /** Path under /assets/click-play/ */
  icon: string;
}

export interface HotspotDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CodePuzzle {
  id: string;
  length: number;
  answer: string;
}
