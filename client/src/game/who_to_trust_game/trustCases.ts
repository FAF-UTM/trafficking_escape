export type TrustLevel = 'best' | 'partly' | 'unsafe';

export interface Contact {
  id: string;
  /** Display name on the card. */
  name: string;
  /** Optional @handle for online accounts. */
  handle?: string;
  /** Short label under the name. */
  role: string;
  /** Profile / behaviour clues the player can read. */
  clues: string[];
  trust: TrustLevel;
  /** Feedback after this contact is picked. */
  feedback: string;
}

export interface TrustCase {
  id: string;
  title: string;
  /** What just happened to Mary. */
  situation: string;
  /** The decision prompt. */
  question: string;
  contacts: Contact[];
  /** One-line takeaway shown in the end report. */
  lesson: string;
}

export const CASES_PER_RUN = 5;
export const POINTS_BEST = 15;
export const POINTS_PARTLY = 6;

export const CASES: TrustCase[] = [
  {
    id: 'secret-party',
    title: 'The secret party',
    situation:
      'Mary gets a DM at 11pm: “Secret warehouse party tonight. Free gifts. No parents. Keep it between us.” The account followed her yesterday.',
    question: 'Who should Mary turn to right now?',
    lesson:
      'Secret parties from strangers are recruitment lures. A trusted adult beats “careful” plans with unknown accounts.',
    contacts: [
      {
        id: 'mom',
        name: 'Her mom',
        role: 'Parent at home',
        clues: [
          'Knows Mary’s real life',
          'Can help without judgment',
          'Not asking her to hide anything',
        ],
        trust: 'best',
        feedback:
          'Best. Show her the messages. Secrecy + gifts + “no parents” is exactly what adults need to see.',
      },
      {
        id: 'party-acc',
        name: 'Party.VIP',
        handle: 'party.vip.tonight',
        role: 'Account made yesterday',
        clues: [
          '0 mutual friends',
          'Pushes free gifts',
          'Says “don’t tell anyone”',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. This account is the lure. Talking to them keeps the trap open.',
      },
      {
        id: 'online-friend',
        name: 'Lex',
        handle: 'lex.night.owl',
        role: 'Online friend, never met',
        clues: [
          'Says “just go, it’ll be fun”',
          'Offers to meet her there',
          'Still a stranger in real life',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. An online-only friend who pushes the party is not a safety net.',
      },
    ],
  },
  {
    id: 'fake-scout',
    title: 'The model scout',
    situation:
      'Someone DMs: “I’m a scout, no cap. Fill this urgent form with your address. Exclusive team.” Mary is flattered and unsure.',
    question: 'Who is safest to trust with this?',
    lesson:
      'Real opportunities don’t pressure teens over cold DMs. Verify with someone who has duty of care — not the sender.',
    contacts: [
      {
        id: 'teacher',
        name: 'Ms. de Vries',
        role: 'School teacher',
        clues: [
          'Can check if the “agency” is real',
          'Won’t ask Mary to hide it',
          'Can report the account with her',
        ],
        trust: 'best',
        feedback:
          'Best. Teachers and parents can verify offers safely. The scout should not be her fact-checker.',
      },
      {
        id: 'scout',
        name: 'Elena',
        handle: 'lumen.scout.eu',
        role: 'Claims to be a scout',
        clues: [
          'Account 2 weeks old',
          'Wants address before any meeting',
          'Uses urgency (“tonight / urgent”)',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Trusting the person making the offer is how scams work.',
      },
      {
        id: 'cousin',
        name: 'Her cousin Ana',
        role: 'Family, lives nearby',
        clues: [
          'Cares about Mary',
          'Not a professional verifier',
          'Still better than the scout',
        ],
        trust: 'partly',
        feedback:
          'Partly right. Family help is good — also loop in a parent or teacher so it gets checked properly.',
      },
    ],
  },
  {
    id: 'live-pin',
    title: 'The ride offer',
    situation:
      'A stranger asks for Mary’s live location and offers a car ride home “so she doesn’t walk alone.” She’s still at the library.',
    question: 'Who should Mary trust for getting home safely?',
    lesson:
      'Live location + a stranger’s car is isolation. Real help comes from people she already knows offline.',
    contacts: [
      {
        id: 'dad',
        name: 'Her dad',
        role: 'Parent — can pick her up',
        clues: [
          'Knows where the library is',
          'Doesn’t need her live pin from a stranger',
          'Safe ride she already trusts',
        ],
        trust: 'best',
        feedback:
          'Best. Call or text dad (or another known adult). Never send a live pin to someone she doesn’t know.',
      },
      {
        id: 'stranger',
        name: 'Mike',
        handle: 'mike.rides.24',
        role: 'Stranger in her DMs',
        clues: [
          'Wants live location',
          'Offers a car immediately',
          'Says “don’t tell your parents”',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. That combination is a classic isolation move — not help.',
      },
      {
        id: 'library-staff',
        name: 'Library desk staff',
        role: 'Adults on site',
        clues: [
          'Present in the building',
          'Can wait with her or call home',
          'Not connected to the DM',
        ],
        trust: 'partly',
        feedback:
          'Partly right — staff can help her reach a parent. Still don’t engage the stranger.',
      },
    ],
  },
  {
    id: 'private-pic',
    title: 'Prove trust',
    situation:
      'A follower Mary barely knows says: “Add me on Snap. Send a quick pic to prove trust. I’ll delete it. Don’t tell anyone.”',
    question: 'Who should Mary trust with this situation?',
    lesson:
      'Private apps + photo tests are grooming. Trust people who protect her privacy — not people who demand it.',
    contacts: [
      {
        id: 'parent',
        name: 'A parent / carer',
        role: 'Trusted adult at home',
        clues: [
          'Can help her block and report',
          'Won’t ask for the photo',
          'Sees the pattern clearly',
        ],
        trust: 'best',
        feedback:
          'Best. Show them the chat. No photo, no app switch — adult help first.',
      },
      {
        id: 'follower',
        name: 'Jaden',
        handle: 'jaden.k__',
        role: 'Followed her yesterday',
        clues: [
          'Stock-looking profile pic',
          'Wants Snap + a photo',
          'Asks for secrecy',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. The person demanding a “trust pic” is the risk, not the solution.',
      },
      {
        id: 'bestie',
        name: 'Sophia',
        role: 'Close friend from school',
        clues: [
          'Mary knows her in real life',
          'Can support her emotionally',
          'Still should loop in an adult for this',
        ],
        trust: 'partly',
        feedback:
          'Partly right. Friends help — for photo pressure, also tell a trusted adult so it gets reported.',
      },
    ],
  },
  {
    id: 'fake-classmate',
    title: 'The fake classmate',
    situation:
      'An account named “Maya from 4B” asks for Mary’s number “to add her to the class group.” Mary doesn’t remember messaging Maya before. Something feels off.',
    question: 'Who can Mary safely trust to check this?',
    lesson:
      'Impersonation is common. Verify identity through people and channels she already knows — never through the suspicious account.',
    contacts: [
      {
        id: 'real-maya',
        name: 'Maya (in person / known chat)',
        role: 'Actual classmate',
        clues: [
          'Mary can ask her at school or on a known thread',
          'Won’t need Mary’s number via a new account',
          'Can confirm if she sent anything',
        ],
        trust: 'best',
        feedback:
          'Best. Verify with the real Maya through a channel Mary already trusts, then tell a teacher if it’s fake.',
      },
      {
        id: 'fake',
        name: 'maya.4b.new',
        handle: 'maya.4b.new',
        role: 'Unverified account',
        clues: [
          'Account made last week',
          '0 mutual friends',
          'Asks for personal details first',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Never “verify” by giving the suspicious account what it wants.',
      },
      {
        id: 'ignore',
        name: 'Nobody — ignore it alone',
        role: 'Keep it private',
        clues: [
          'Avoids giving data',
          'Leaves Mary without support',
          'Fake accounts can try again',
        ],
        trust: 'partly',
        feedback:
          'Partly right to not share info — still tell a teacher/parent so the impersonation can be flagged.',
      },
    ],
  },
  {
    id: 'owe-me',
    title: 'You owe me',
    situation:
      'Someone from Mary’s game bought her a battle pass, then said “ur gonna owe me one” and asked her not to tell her parents.',
    question: 'Who should Mary trust about this?',
    lesson:
      'Gifts that create debt are a trap. Adults help break the “you owe me” frame — the giver doesn’t get to set the rules.',
    contacts: [
      {
        id: 'parents',
        name: 'Her parents',
        role: 'Trusted adults',
        clues: [
          'Can say clearly she owes nothing',
          'Can help block the account',
          'Should know about online pressure',
        ],
        trust: 'best',
        feedback:
          'Best. Tell them. A gift never means she has to do favours — especially secret ones.',
      },
      {
        id: 'giver',
        name: 'SquadMate_x',
        handle: 'squad.mate.x',
        role: 'The person who “gifted” her',
        clues: [
          'Created the debt on purpose',
          'Wants secrecy from parents',
          'May ask for more next',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Negotiating with the person using the debt trap feeds it.',
      },
      {
        id: 'gamer-friend',
        name: 'Her gaming friend Theo',
        role: 'Friend she knows from school + game',
        clues: [
          'Knows the game culture',
          'Can support her saying no',
          'Not a substitute for parents here',
        ],
        trust: 'partly',
        feedback:
          'Partly right for support — also tell a parent, because secrecy was part of the pressure.',
      },
    ],
  },
  {
    id: 'job-abroad',
    title: 'The abroad job',
    situation:
      'A flyer-style message offers “quick cash abroad, no ID needed, leave this week, privacy guaranteed.” Sophia and Mary both saw it.',
    question: 'Who should they trust to handle this?',
    lesson:
      'Too-good jobs that skip ID and rush travel are trafficking risk signals. Official adults + hotlines beat the poster’s “privacy.”',
    contacts: [
      {
        id: 'teacher',
        name: 'Their teacher',
        role: 'School adult',
        clues: [
          'Can call a safety hotline',
          'Can remove or report the flyer',
          'Protects more students too',
        ],
        trust: 'best',
        feedback:
          'Best. Bring it to a teacher. Checking with a hotline protects the whole school, not just them.',
      },
      {
        id: 'poster',
        name: 'internships.fast',
        handle: 'internships.fast',
        role: 'The account behind the offer',
        clues: [
          'No ID needed (red flag)',
          'Travel this week',
          '“Privacy guaranteed” = hide from adults',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Never trust the poster of a too-good overseas job to “explain” it.',
      },
      {
        id: 'internet',
        name: 'A random forum commenter',
        role: 'Stranger online',
        clues: [
          'Might guess it’s a scam',
          'No duty of care',
          'Could be wrong or harmful',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Random internet advice isn’t verification. Use school adults and official helplines.',
      },
    ],
  },
  {
    id: 'threat',
    title: 'The threat',
    situation:
      'After Mary refused a photo, the account wrote: “If you delete me you’ll regret it. Everyone will see.” She’s scared and frozen.',
    question: 'Who should Mary trust for help right now?',
    lesson:
      'Threats after a no are coercion (often sextortion). Don’t pay, don’t argue alone — trusted adults and helplines first.',
    contacts: [
      {
        id: 'adult-helpline',
        name: 'A trusted adult + helpline',
        role: 'Parent/teacher and De Kindertelefoon',
        clues: [
          'Can help her screenshot and report',
          'Know not to pay or send more',
          'She doesn’t have to handle fear alone',
        ],
        trust: 'best',
        feedback:
          'Best. Stop replying, keep evidence, tell an adult. In the NL: 0800‑0432 (Kindertelefoon) or helpwanted.nl.',
      },
      {
        id: 'threatener',
        name: 'The account threatening her',
        handle: 'sorry.not.sorry',
        role: 'Using fear for control',
        clues: [
          'Already ignored her boundary',
          'Uses threats',
          'Wants her to reply or pay',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Engaging — paying, arguing, or pleading — usually makes it worse.',
      },
      {
        id: 'delete-alone',
        name: 'Nobody — delete everything alone',
        role: 'Handle it privately',
        clues: [
          'Stops some contact',
          'Loses evidence',
          'Leaves her without support',
        ],
        trust: 'partly',
        feedback:
          'Partly right to stop talking — but screenshot first and tell an adult. Don’t face threats alone.',
      },
    ],
  },
  {
    id: 'jealous-friends',
    title: 'Cut your friends off',
    situation:
      'Someone Mary chats with daily says: “Your friends are jealous of us. Stop hanging out with them. You have me.”',
    question: 'Who should Mary trust?',
    lesson:
      'Isolation starts with “your friends don’t get us.” Real care never asks her to drop her support network.',
    contacts: [
      {
        id: 'friends',
        name: 'Her real-life friends',
        role: 'People she knows at school',
        clues: [
          'Known offline',
          'Don’t demand secrecy from family',
          'Being “jealous” is a manipulation line',
        ],
        trust: 'best',
        feedback:
          'Best. Keep her friends — and tell them (and a parent) what this person is saying.',
      },
      {
        id: 'isolator',
        name: 'The chat partner',
        handle: 'only.us.now',
        role: 'Pushing isolation',
        clues: [
          'Wants her away from friends',
          'Makes her choose “us or them”',
          'Increases control',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Anyone asking her to cut friends off is not looking out for her.',
      },
      {
        id: 'balance',
        name: 'Stay quiet and “balance both”',
        role: 'Avoid conflict',
        clues: [
          'Keeps friends for now',
          'Leaves the isolation attempt unchallenged',
          'Secret pressure can grow',
        ],
        trust: 'partly',
        feedback:
          'Partly — keeping friends matters. Still name the behaviour to someone she trusts so it doesn’t escalate in private.',
      },
    ],
  },
  {
    id: 'safe-study',
    title: 'The study invite',
    situation:
      'Maya from biology — someone Mary sits next to in class — texts on a known chat: “Library after school to revise the quiz? I’ll be by the windows.”',
    question: 'Who is reasonable to trust here?',
    lesson:
      'Not every message is a trap. Known classmates + public places + normal plans can be fine — still keep boundaries.',
    contacts: [
      {
        id: 'maya',
        name: 'Maya',
        role: 'Classmate Mary knows offline',
        clues: [
          'Known from class',
          'Public place (library)',
          'No secrecy, gifts, or pressure',
        ],
        trust: 'best',
        feedback:
          'Best. This looks like a normal school plan with someone she already knows. Still tell a parent where she’s going.',
      },
      {
        id: 'stranger-offer',
        name: 'A random tutor DM',
        handle: 'free.tutors.nl',
        role: 'Unknown account offering “free help”',
        clues: [
          'Mary never met them',
          'Offers to “pick her up after”',
          'Wants to move off the school app',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Don’t swap a known classmate plan for a stranger’s “help.”',
      },
      {
        id: 'skip-all',
        name: 'Trust nobody ever online',
        role: 'Total shutdown',
        clues: [
          'Avoids some risk',
          'Also blocks normal school life',
          'Over-reacts to a safe invite',
        ],
        trust: 'partly',
        feedback:
          'Partly — caution is good, but known classmates and public study plans aren’t the same as groomer DMs.',
      },
    ],
  },
];
