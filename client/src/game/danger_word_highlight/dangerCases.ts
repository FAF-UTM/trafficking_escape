export type TacticId =
  | 'secrecy'
  | 'urgency'
  | 'giftBait'
  | 'fakeOffer'
  | 'platformSwitch'
  | 'imageRequest'
  | 'locationGrab'
  | 'isolation'
  | 'documentGrab'
  | 'pressure';

export interface TacticInfo {
  name: string;
  emoji: string;
  description: string;
}

export const TACTICS: Record<TacticId, TacticInfo> = {
  secrecy: {
    name: 'Secrecy',
    emoji: '🤫',
    description: '“Don’t tell anyone” cuts teens off from safe adults.',
  },
  urgency: {
    name: 'Urgency',
    emoji: '⏱️',
    description: 'Rushing a decision so there’s no time to check.',
  },
  giftBait: {
    name: 'Gift bait',
    emoji: '🎁',
    description: 'Free gifts or VIP perks used as a lure.',
  },
  fakeOffer: {
    name: 'Fake offer',
    emoji: '🎭',
    description: 'Jobs, scouting, or money that sound too easy.',
  },
  platformSwitch: {
    name: 'Platform switch',
    emoji: '📲',
    description: 'Moving the chat somewhere adults can’t see it.',
  },
  imageRequest: {
    name: 'Image request',
    emoji: '📸',
    description: 'Pushing for photos that can be used later.',
  },
  locationGrab: {
    name: 'Location grab',
    emoji: '📍',
    description: 'Asking where you are, live pin, or for a ride.',
  },
  isolation: {
    name: 'Isolation',
    emoji: '🚪',
    description: 'Pulling someone away from friends or parents.',
  },
  documentGrab: {
    name: 'Personal data',
    emoji: '🪪',
    description: 'Asking for address, ID, bank details, or phone.',
  },
  pressure: {
    name: 'Pressure',
    emoji: '⚠️',
    description: 'Guilt, threats, or “prove it” after a boundary.',
  },
};

/** A clickable chunk of the message. Flagged chunks are red flags. */
export interface Segment {
  text: string;
  flag?: TacticId;
  /** Shown after reveal for flagged segments. */
  note?: string;
  /** Shown after reveal if this was a false-alarm target (innocent). */
  clearNote?: string;
}

export interface DangerCase {
  id: string;
  title: string;
  handle: string;
  setup: string;
  segments: Segment[];
}

export const CASES_PER_RUN = 4;
export const HIT_POINTS = 2;
export const FALSE_ALARM_COST = 1;

export const CASES: DangerCase[] = [
  {
    id: 'secret-party',
    title: 'Secret party invite',
    handle: 'party.vip.tonight',
    setup: 'A new account DMs Mary about a party she never mentioned.',
    segments: [
      { text: 'Hey! ', clearNote: 'A normal greeting.' },
      {
        text: 'Secret party tonight',
        flag: 'secrecy',
        note: 'Hidden from adults on purpose.',
      },
      { text: ' at a warehouse. ' },
      {
        text: 'No parents allowed',
        flag: 'isolation',
        note: 'Cuts Mary off from safe adults.',
      },
      { text: '. ' },
      {
        text: 'Free gifts if you come now',
        flag: 'giftBait',
        note: 'Gifts + rush = classic lure.',
      },
      { text: '. ' },
      {
        text: 'Keep it between us',
        flag: 'secrecy',
        note: 'Secrecy request so nobody can warn her.',
      },
      { text: '.', clearNote: 'End of the message.' },
    ],
  },
  {
    id: 'model-scout',
    title: 'Model scout DM',
    handle: 'lumen.scout.eu',
    setup: 'Someone claims they found Mary on a school dance page.',
    segments: [
      { text: 'Saw your pics — you could model. ' },
      {
        text: "I'm a real scout, no cap",
        flag: 'fakeOffer',
        note: 'Self-proving “trust me” is not verification.',
      },
      { text: '. Fill this ' },
      {
        text: 'urgent form',
        flag: 'urgency',
        note: 'Rushing her before she can check.',
      },
      { text: ' with your ' },
      {
        text: 'home address and phone',
        flag: 'documentGrab',
        note: 'Personal data strangers should not get.',
      },
      { text: ' to join our ' },
      {
        text: 'exclusive team',
        flag: 'fakeOffer',
        note: 'Exclusivity is used to make the trap feel special.',
      },
      { text: '.' },
    ],
  },
  {
    id: 'private-app',
    title: 'Move to a private app',
    handle: 'jaden.k__',
    setup: 'A follower Mary barely knows wants the chat somewhere quieter.',
    segments: [
      { text: 'This app is weird. ' },
      {
        text: "Let's switch to Snap",
        flag: 'platformSwitch',
        note: 'Moving off a safer app hides the chat.',
      },
      { text: ' and send a ' },
      {
        text: 'quick pic to prove trust',
        flag: 'imageRequest',
        note: 'Photos as a “test” are grooming leverage.',
      },
      { text: '. ' },
      {
        text: 'No need to tell anyone',
        flag: 'secrecy',
        note: 'Blocking adult help on purpose.',
      },
      { text: ". I'll " },
      {
        text: 'delete the messages after',
        flag: 'secrecy',
        note: 'Erasing evidence is a red flag, not kindness.',
      },
      { text: '.' },
    ],
  },
  {
    id: 'ride-location',
    title: 'Ride + location',
    handle: 'mike.rides.24',
    setup: 'Mary is walking home. A stranger offers help in the chat.',
    segments: [
      { text: 'You still at school? ' },
      {
        text: 'Share your live location',
        flag: 'locationGrab',
        note: 'Live pin tells a stranger exactly where she is.',
      },
      { text: ' and ' },
      {
        text: "I'll pick you up in my car",
        flag: 'isolation',
        note: 'A stranger’s car isolates her from safe places.',
      },
      { text: ". It's fine, " },
      {
        text: 'I promise you are safe',
        flag: 'pressure',
        note: 'Reassurance without proof is pressure, not safety.',
      },
      { text: '. ' },
      {
        text: "Don't ask your parents first",
        flag: 'secrecy',
        note: 'Keeping parents out is the point.',
      },
      { text: '.' },
    ],
  },
  {
    id: 'easy-money',
    title: 'Easy money offer',
    handle: 'cashhelp.today',
    setup: 'An account Mary doesn’t know offers to “help her family.”',
    segments: [
      { text: 'I saw your story. ' },
      {
        text: 'Easy money today',
        flag: 'fakeOffer',
        note: 'Fast cash promises are common bait.',
      },
      { text: ' if you send ' },
      {
        text: 'bank details',
        flag: 'documentGrab',
        note: 'Financial data should never go to a stranger.',
      },
      { text: ' or ' },
      {
        text: 'meet me now to collect cash',
        flag: 'urgency',
        note: 'Meet + now = rushed contact.',
      },
      { text: '. ' },
      {
        text: 'Do not tell anyone',
        flag: 'secrecy',
        note: 'Secrecy protects the scammer.',
      },
      { text: '.' },
    ],
  },
  {
    id: 'job-flyer',
    title: 'Too-good job ad',
    handle: 'internships.fast',
    setup: 'A flyer-style message about a “student job abroad.”',
    segments: [
      { text: 'Student job: ' },
      {
        text: 'earn quick cash',
        flag: 'fakeOffer',
        note: 'Big pay, low detail — treat as bait.',
      },
      { text: ' with ' },
      {
        text: 'no ID needed',
        flag: 'documentGrab',
        note: 'Skipping ID is not a perk; real jobs check papers.',
      },
      { text: '. ' },
      {
        text: 'Travel abroad this week',
        flag: 'urgency',
        note: 'Sudden travel pressure is a trafficking risk signal.',
      },
      { text: ', ' },
      {
        text: 'privacy guaranteed',
        flag: 'secrecy',
        note: '“Privacy” here means hide it from adults.',
      },
      { text: '. ' },
      {
        text: 'Limited places — apply instantly',
        flag: 'urgency',
        note: 'Scarcity + instantly = no time to verify.',
      },
      { text: '.' },
    ],
  },
  {
    id: 'owe-me',
    title: 'Gift with a catch',
    handle: 'squad.mate.x',
    setup: 'Someone from Mary’s game bought her a pass, then the tone changed.',
    segments: [
      { text: 'Got you the battle pass, hope you like it. ' },
      {
        text: "You're gonna owe me one tho",
        flag: 'pressure',
        note: 'Gifts that create debt are a trap.',
      },
      { text: '. ' },
      {
        text: "Don't tell your parents",
        flag: 'secrecy',
        note: 'Hiding the favour keeps the pressure private.',
      },
      { text: '. Also add me on ' },
      {
        text: 'Discord so teachers can’t see',
        flag: 'platformSwitch',
        note: 'Switching platforms to avoid oversight.',
      },
      { text: '.' },
    ],
  },
  {
    id: 'safe-study',
    title: 'Study group chat',
    handle: 'maya.from.biology',
    setup:
      'A classmate Mary knows from school — this one should have no red flags.',
    segments: [
      {
        text: 'Hey, are you free after school to review the biology quiz?',
        clearNote: 'Normal school plan with someone she knows.',
      },
      { text: ' We can meet at the library. ' },
      {
        text: 'Bring your notes if you want',
        clearNote: 'A normal request between classmates.',
      },
      { text: ". I'll be by the big windows." },
    ],
  },
];
