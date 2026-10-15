export type TacticId =
  | 'secrecy'
  | 'grooming'
  | 'isolation'
  | 'refuse'
  | 'recruitment'
  | 'locationGrab'
  | 'manipulation'
  | 'coercion'
  | 'loveBombing'
  | 'debtTrap'
  | 'imageRequest'
  | 'platformSwitch';

export interface TacticInfo {
  name: string;
  emoji: string;
  description: string;
}

export const TACTICS: Record<TacticId, TacticInfo> = {
  secrecy: {
    name: 'Secrecy',
    emoji: '🤫',
    description:
      '“Don’t tell anyone” cuts teens off from adults who could help.',
  },
  grooming: {
    name: 'Grooming',
    emoji: '🎣',
    description:
      'Building trust, then pushing for private chats, pics, or secrets.',
  },
  isolation: {
    name: 'Isolation',
    emoji: '🚪',
    description: 'Pulling someone away from friends, school, or safe places.',
  },
  refuse: {
    name: 'Safe refusal',
    emoji: '🛑',
    description: 'Saying no clearly, then telling a trusted adult.',
  },
  recruitment: {
    name: 'Recruitment lure',
    emoji: '🎁',
    description: 'Jobs, parties, or gifts used to pull someone into a trap.',
  },
  locationGrab: {
    name: 'Location grab',
    emoji: '📍',
    description: 'Asking where you are, live location, or your address.',
  },
  manipulation: {
    name: 'Manipulation',
    emoji: '🎭',
    description: 'Twisting guilt, loyalty, or “trust” to get what they want.',
  },
  coercion: {
    name: 'Coercion',
    emoji: '⚠️',
    description: 'Pressure after a boundary: threats, guilt, or “prove it”.',
  },
  loveBombing: {
    name: 'Love bombing',
    emoji: '✨',
    description: 'Over-the-top praise early on to rush trust and dependency.',
  },
  debtTrap: {
    name: 'Debt trap',
    emoji: '💸',
    description: 'Gifts or favours that turn into “you owe me”.',
  },
  imageRequest: {
    name: 'Image request',
    emoji: '📸',
    description: 'Pushing for photos that can later be used for blackmail.',
  },
  platformSwitch: {
    name: 'Platform switch',
    emoji: '📲',
    description: 'Moving the chat off a safer app so adults can’t see it.',
  },
};

export interface WordOption {
  word: string;
  correct: boolean;
  /** Shown after this option is picked. */
  feedback: string;
}

export interface WordCase {
  id: string;
  tactic: TacticId;
  /** Short scene-setting line above the sentence. */
  context: string;
  /** Use ___ where the missing word goes. */
  sentence: string;
  options: WordOption[];
}

export const QUESTIONS_PER_RUN = 6;
export const POINTS_CORRECT = 10;

export const CASES: WordCase[] = [
  {
    id: 'no-parents',
    tactic: 'secrecy',
    context: 'A new DM. Mary doesn’t know this person.',
    sentence:
      'They write: “Let’s hang tonight, no parents.” Traffickers use ___ to keep teens away from safe adults.',
    options: [
      {
        word: 'secrecy',
        correct: true,
        feedback:
          '“No parents” is secrecy. It isolates Mary from the people who could protect her.',
      },
      {
        word: 'privacy',
        correct: false,
        feedback:
          'Privacy is choosing what you share. Secrecy is hiding from adults on purpose — that’s the red flag.',
      },
      {
        word: 'independence',
        correct: false,
        feedback:
          'Independence isn’t the same as being told to hide. “No parents” is a secrecy move.',
      },
    ],
  },
  {
    id: 'quick-pic',
    tactic: 'grooming',
    context: 'Someone Mary barely knows moves the chat private.',
    sentence:
      'They switch apps and ask for a “quick pic” to “prove trust.” That pattern is ___.',
    options: [
      {
        word: 'grooming',
        correct: true,
        feedback:
          'Private chat + photo “to prove trust” is classic grooming: trust first, leverage later.',
      },
      {
        word: 'flirting',
        correct: false,
        feedback:
          'Flirting doesn’t need a private app and a proof photo. That pressure is grooming.',
      },
      {
        word: 'networking',
        correct: false,
        feedback:
          'Networking doesn’t demand private pics. Moving off-platform and pushing photos is grooming.',
      },
    ],
  },
  {
    id: 'live-location',
    tactic: 'isolation',
    context: 'Mary is walking home from school.',
    sentence:
      'Someone asks for her live location and offers a ride. That’s an ___ tactic.',
    options: [
      {
        word: 'isolation',
        correct: true,
        feedback:
          'Location + a ride can pull Mary into a place where nobody else is watching. That’s isolation.',
      },
      {
        word: 'kindness',
        correct: false,
        feedback:
          'A stranger asking for live location isn’t kindness. It’s a way to control where she is.',
      },
      {
        word: 'friendship',
        correct: false,
        feedback:
          'Real friends don’t need your live pin and a car. That combo is about isolation.',
      },
    ],
  },
  {
    id: 'meet-tonight',
    tactic: 'refuse',
    context: 'An online “scout” is rushing Mary.',
    sentence: 'They say “no cap, meet me tonight.” The safest move is to ___.',
    options: [
      {
        word: 'refuse',
        correct: true,
        feedback:
          'Refuse clearly, block if needed, and tell a trusted adult. Urgency is part of the trap.',
      },
      {
        word: 'negotiate',
        correct: false,
        feedback:
          'Negotiating keeps the conversation open. Safer: refuse and tell an adult.',
      },
      {
        word: 'delay',
        correct: false,
        feedback:
          '“Maybe later” still leaves the door open. Refuse, then get help from someone you trust.',
      },
    ],
  },
  {
    id: 'secret-party',
    tactic: 'recruitment',
    context: 'An invite pops up from an account Mary doesn’t recognise.',
    sentence:
      'A secret party with free gifts and “only cool kids” is a classic ___ lure.',
    options: [
      {
        word: 'recruitment',
        correct: true,
        feedback:
          'Gifts + secrecy + exclusivity are common recruitment lures used to pull teens in.',
      },
      {
        word: 'celebration',
        correct: false,
        feedback:
          'A real celebration doesn’t need secrecy and strangers’ gifts. That’s a recruitment lure.',
      },
      {
        word: 'opportunity',
        correct: false,
        feedback:
          '“Opportunity” is how it gets sold. The pattern — secret + gifts — is recruitment.',
      },
    ],
  },
  {
    id: 'send-gift',
    tactic: 'locationGrab',
    context: 'Mary wins a “giveaway” she never entered.',
    sentence:
      'They ask for her home address to “send a prize.” That request is ___.',
    options: [
      {
        word: 'dangerous',
        correct: true,
        feedback:
          'Never share your address with strangers online. It tells them where you live.',
      },
      {
        word: 'generous',
        correct: false,
        feedback:
          'Real prizes don’t come from random DMs needing your home address. It’s dangerous.',
      },
      {
        word: 'normal',
        correct: false,
        feedback:
          'It can look normal, but giving your address to a stranger is dangerous.',
      },
    ],
  },
  {
    id: 'between-us',
    tactic: 'manipulation',
    context: 'Mary told them she’s uncomfortable.',
    sentence: '“Keep this just between us” is a ___ red flag.',
    options: [
      {
        word: 'manipulation',
        correct: true,
        feedback:
          'Secrecy requests are manipulation: they try to block adult help before anything worse happens.',
      },
      {
        word: 'loyalty',
        correct: false,
        feedback:
          'Loyalty isn’t proven by hiding things. “Just between us” is manipulation.',
      },
      {
        word: 'respect',
        correct: false,
        feedback:
          'Respect means accepting a boundary. Asking Mary to hide it is manipulation.',
      },
    ],
  },
  {
    id: 'trust-me',
    tactic: 'coercion',
    context: 'Mary already said no to sending a photo.',
    sentence:
      'They reply “trust me fr 💯” and keep pushing. That’s ___ pressure.',
    options: [
      {
        word: 'coercive',
        correct: true,
        feedback:
          'Pushing after a clear no isn’t care — it’s coercive pressure to break her boundary.',
      },
      {
        word: 'confident',
        correct: false,
        feedback:
          'Confidence doesn’t ignore a no. Keeping pressure on after a boundary is coercion.',
      },
      {
        word: 'romantic',
        correct: false,
        feedback:
          'Romance doesn’t mean overriding consent. This is coercive pressure.',
      },
    ],
  },
  {
    id: 'famous-overnight',
    tactic: 'loveBombing',
    context: 'Someone found Mary on a school dance page.',
    sentence:
      '“Prettiest girl I’ve seen, you’ll be famous” in the first chat is ___.',
    options: [
      {
        word: 'love bombing',
        correct: true,
        feedback:
          'Huge praise this fast is love bombing: it rushes trust so the next ask feels harder to refuse.',
      },
      {
        word: 'complimenting',
        correct: false,
        feedback:
          'One nice comment is a compliment. Fame talk + over-the-top praise this early is love bombing.',
      },
      {
        word: 'talent scouting',
        correct: false,
        feedback:
          'Real scouts don’t explode with fame talk in a cold DM. That’s love bombing.',
      },
    ],
  },
  {
    id: 'owe-me',
    tactic: 'debtTrap',
    context: 'Someone bought Mary a game pass “as a gift.”',
    sentence:
      'Then they say “ur gonna owe me one.” That gift just became a ___.',
    options: [
      {
        word: 'debt trap',
        correct: true,
        feedback:
          'Free gifts that create “you owe me” are debt traps. Favours shouldn’t come with pressure.',
      },
      {
        word: 'friendship',
        correct: false,
        feedback:
          'Friends don’t keep score like that. “You owe me” after a gift is a debt trap.',
      },
      {
        word: 'joke',
        correct: false,
        feedback:
          'Even if they laugh it off, tying a gift to an IOU is a debt-trap pattern.',
      },
    ],
  },
  {
    id: 'pjs-pic',
    tactic: 'imageRequest',
    context: 'The chat was joking around, then the tone shifted.',
    sentence:
      '“Send a pic in your pj’s 😏” after Mary said she’s tired is an unsafe ___.',
    options: [
      {
        word: 'image request',
        correct: true,
        feedback:
          'Pushing for a personal photo — especially after a soft no — is an image request that can lead to blackmail.',
      },
      {
        word: 'dare',
        correct: false,
        feedback:
          'Calling it a dare doesn’t make it safe. It’s still an image request she can refuse.',
      },
      {
        word: 'check-in',
        correct: false,
        feedback:
          'A check-in asks if she’s okay. Asking for a pajama pic is an image request.',
      },
    ],
  },
  {
    id: 'move-to-snap',
    tactic: 'platformSwitch',
    context: 'Mary has been chatting on a school-safe app.',
    sentence:
      'They say “add me on Snap, teachers can’t see it.” Moving the chat is a ___.',
    options: [
      {
        word: 'platform switch',
        correct: true,
        feedback:
          'Switching to an app with disappearing messages hides the chat from adults. That’s a platform switch.',
      },
      {
        word: 'privacy tip',
        correct: false,
        feedback:
          'Hiding from teachers isn’t a privacy tip — it’s a platform switch to avoid oversight.',
      },
      {
        word: 'tech upgrade',
        correct: false,
        feedback:
          'The goal isn’t better tech. It’s getting Mary somewhere adults can’t check. Platform switch.',
      },
    ],
  },
];
