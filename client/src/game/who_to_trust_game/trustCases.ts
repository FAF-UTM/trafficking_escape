export type TrustLevel = 'best' | 'partly' | 'unsafe';

export interface Contact {
  id: string;
  /** Display name on the card. */
  name: string;
  /** Optional @handle for online accounts. */
  handle?: string;
  /** Short label under the name. */
  role: string;
  /** Observable facts — not the answer. */
  clues: string[];
  trust: TrustLevel;
  /** Feedback after this contact is picked. */
  feedback: string;
}

export interface TrustCase {
  id: string;
  title: string;
  /** Short name of the tactic / idea this case teaches. */
  concept: string;
  /** Plain-language explainer for 12–16 year olds. */
  conceptExplain: string;
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
    concept: 'The secrecy trap',
    conceptExplain:
      'When someone says “don’t tell anyone,” they’re often protecting the plan — not you. Real friends and safe plans can survive a parent knowing.',
    situation:
      'Mary gets a DM at 11pm: “Warehouse party tonight. Free gifts at the door. No parents. Keep it between us 🤫.” The account followed her yesterday and has cool party photos.',
    question: 'Who should Mary talk to first?',
    lesson:
      'Secrecy + strangers + “free stuff” is a classic lure. A trusted adult is the first call — not another unknown account.',
    contacts: [
      {
        id: 'mom',
        name: 'Her mom',
        role: 'Parent at home',
        clues: [
          'Knows Mary’s real schedule',
          'Can look at the chat with her',
          'Might ask questions Mary finds awkward',
        ],
        trust: 'best',
        feedback:
          'Best. Awkward questions beat a trap. Show her the DM — “no parents” + free gifts + a brand-new account is exactly what adults are for.',
      },
      {
        id: 'party-acc',
        name: 'Party.VIP',
        handle: 'party.vip.tonight',
        role: 'New account with party pics',
        clues: [
          'Followed Mary yesterday',
          'Posts nonstop party stories',
          'Answers fast and hypes her up',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. This is the account selling the invite. Asking them “is it safe?” is like asking a scammer if the scam is real.',
      },
      {
        id: 'online-friend',
        name: 'Lex',
        handle: 'lex.night.owl',
        role: 'Online friend — never met IRL',
        clues: [
          'Chats with Mary most nights',
          'Says “I’ll meet you there”',
          'Sounds chill and funny',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Feeling close online ≠ knowing someone in real life. Lex pushing her to go is not a safety plan.',
      },
    ],
  },
  {
    id: 'fake-scout',
    title: 'The model scout',
    concept: 'Fake opportunities',
    conceptExplain:
      'Real jobs and agencies don’t rush teens in DMs for their address. Flattery + urgency + “exclusive” is how fake “scouts” get personal info.',
    situation:
      'A DM: “Hey, you have a look. I’m a scout — fill this form tonight with your address for exclusive castings. Don’t overthink it.” Mary feels flattered… and unsure.',
    question: 'Who is safest to trust with checking this?',
    lesson:
      'Cold DMs that want your address “tonight” aren’t opportunities. Verify with someone who has a duty to protect you — not with the sender.',
    contacts: [
      {
        id: 'teacher',
        name: 'Ms. de Vries',
        role: 'School teacher',
        clues: [
          'Has seen sketchy “talent” offers before',
          'Can help report the account',
          'Might tell Mary’s parents too',
        ],
        trust: 'best',
        feedback:
          'Best. Teachers (and parents) can check if an agency is real. The “scout” should never be the person who proves the scout is legit.',
      },
      {
        id: 'cousin',
        name: 'Cousin Ana',
        role: 'Family, 19, lives nearby',
        clues: [
          'Loves fashion TikTok',
          'Says “omg maybe it’s real??”',
          'Wants to help Mary feel special',
        ],
        trust: 'partly',
        feedback:
          'Partly. Ana cares — but excitement isn’t verification. Still loop in a parent or teacher so someone checks it properly.',
      },
      {
        id: 'scout',
        name: 'Elena',
        handle: 'lumen.scout.eu',
        role: 'Says she’s a scout',
        clues: [
          'Account about 2 weeks old',
          'Sends a form link for her address',
          'Calls it “urgent / exclusive”',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Never trust the person making the offer to prove it’s safe. Address + urgency in a cold DM is a hard no.',
      },
    ],
  },
  {
    id: 'live-pin',
    title: 'The ride offer',
    concept: 'Isolation moves',
    conceptExplain:
      'Asking for your live location, offering a private car, and saying “don’t tell your parents” is about getting you alone — not about being helpful.',
    situation:
      'Mary is finishing homework at the library. A DM: “It’s dark — I’ll pick you up. Drop your live location, I’ll be there in 10. Don’t bother your parents, I’ve got you.”',
    question: 'Who should Mary trust for getting home?',
    lesson:
      'Live pin + stranger + car = getting you alone. Help comes from people you already know offline.',
    contacts: [
      {
        id: 'dad',
        name: 'Her dad',
        role: 'Parent — can pick her up',
        clues: [
          'Knows the library',
          'Might take 15–20 minutes',
          'Will probably ask “who DMed you?”',
        ],
        trust: 'best',
        feedback:
          'Best. A slow safe ride beats a fast unknown one. Call or text dad — never send a live pin to someone she doesn’t know.',
      },
      {
        id: 'library-staff',
        name: 'Library desk staff',
        role: 'Adults in the building',
        clues: [
          'Right there until closing',
          'Can wait with her or call home',
          'Don’t know her family well',
        ],
        trust: 'partly',
        feedback:
          'Partly right. Staff can help her reach a parent and keep her in a public place. Still don’t reply to the stranger.',
      },
      {
        id: 'stranger',
        name: 'Mike',
        handle: 'mike.rides.24',
        role: 'Stranger in her DMs',
        clues: [
          'Offers a ride right away',
          'Asks for live location',
          'Sounds worried about her walking alone',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. “Helpful” + live pin + “don’t tell parents” is a classic isolation move — not kindness.',
      },
    ],
  },
  {
    id: 'private-pic',
    title: 'Prove you trust me',
    concept: 'Photo tests',
    conceptExplain:
      'People who care about you don’t need a private photo to “prove trust.” Moving to Snap + “delete it after” + “don’t tell” is pressure, not romance.',
    situation:
      'A follower Mary barely knows: “Add me on Snap. Send a quick pic so I know you’re real. I’ll delete it. Don’t make it weird — and don’t tell anyone.”',
    question: 'Who should Mary trust with this?',
    lesson:
      'Private apps + photo tests are how some people push for more control. Trust people who protect your privacy — not people who demand it.',
    contacts: [
      {
        id: 'parent',
        name: 'A parent / carer',
        role: 'Trusted adult at home',
        clues: [
          'Can help block and report',
          'Might feel embarrassing to tell',
          'Won’t ask Mary for the photo',
        ],
        trust: 'best',
        feedback:
          'Best. Embarrassment is temporary. Show them the chat: no photo, no app switch — adult help first.',
      },
      {
        id: 'bestie',
        name: 'Sophia',
        role: 'Close friend from school',
        clues: [
          'Mary trusts her IRL',
          'Will probably say “ew, block him”',
          'Is also 14 and might not know how to report',
        ],
        trust: 'partly',
        feedback:
          'Partly. Friends are great for support — for photo pressure, also tell a trusted adult so it gets reported properly.',
      },
      {
        id: 'follower',
        name: 'Jaden',
        handle: 'jaden.k__',
        role: 'Followed her yesterday',
        clues: [
          'Compliments her stories a lot',
          'Wants Snap + a “quick pic”',
          'Says he’ll delete it',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. The person asking for a “trust pic” is the risk. “I’ll delete it” is a promise you can’t check.',
      },
    ],
  },
  {
    id: 'fake-classmate',
    title: 'The fake classmate',
    concept: 'Fake identity',
    conceptExplain:
      'Accounts can pretend to be someone from your school. Always check through a way you already know (in person, old chat, teacher) — never by giving the new account what it wants.',
    situation:
      '“Maya from 4B” DMs: “hey add me to the class WhatsApp — send your number?” Mary sits near Maya in class… but this account looks new, and Mary doesn’t remember chatting like this.',
    question: 'What’s the safest way to check this?',
    lesson:
      'Impersonation is common. Verify through people and chats you already trust — never through the suspicious account.',
    contacts: [
      {
        id: 'real-maya',
        name: 'Maya (known chat / at school)',
        role: 'Actual classmate',
        clues: [
          'Mary can ask her tomorrow in class',
          'They already have an old group chat',
          'Takes a little patience',
        ],
        trust: 'best',
        feedback:
          'Best. Ask the real Maya on a channel Mary already uses. If it’s fake, tell a teacher so others don’t get tricked.',
      },
      {
        id: 'ignore',
        name: 'Ignore it and say nothing',
        role: 'Handle it alone',
        clues: [
          'Doesn’t give out her number',
          'Feels low-drama',
          'Nobody else learns the account is fake',
        ],
        trust: 'partly',
        feedback:
          'Partly. Not sharing her number is smart — but telling a teacher/parent helps stop the fake account from targeting the next person.',
      },
      {
        id: 'fake',
        name: 'maya.4b.new',
        handle: 'maya.4b.new',
        role: 'Unverified account',
        clues: [
          'Created last week',
          'Uses Maya’s name and school year',
          'Asks for her number first',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. You don’t “verify” a suspicious account by giving it personal details. That’s the trap.',
      },
    ],
  },
  {
    id: 'owe-me',
    title: 'You owe me',
    concept: 'Gift debt',
    conceptExplain:
      'A free gift that comes with “you owe me” and “don’t tell your parents” isn’t kindness — it’s a hook. You never owe favours for something you didn’t ask to repay.',
    situation:
      'Someone in Mary’s game bought her a battle pass. Then: “lol ur gonna owe me one 😉 just don’t tell your parents ok.” Later they ask her to stay on voice chat late.',
    question: 'Who should Mary trust about this?',
    lesson:
      'Gifts that create secret debt are a trap. Adults help break the “you owe me” story — the giver doesn’t get to set the rules.',
    contacts: [
      {
        id: 'parents',
        name: 'Her parents',
        role: 'Trusted adults',
        clues: [
          'Can say clearly she owes nothing',
          'Might limit game chat for a bit',
          'Care more about her than the battle pass',
        ],
        trust: 'best',
        feedback:
          'Best. Tell them. A gift never means she has to do favours — especially secret ones. Blocking is allowed.',
      },
      {
        id: 'gamer-friend',
        name: 'Theo',
        role: 'Friend from school + the same game',
        clues: [
          'Knows how game gifts work',
          'Will probably say “that’s weird, block”',
          'Can’t change her account settings for her',
        ],
        trust: 'partly',
        feedback:
          'Partly. Theo is good backup — still tell a parent, because the secrecy (“don’t tell”) was part of the pressure.',
      },
      {
        id: 'giver',
        name: 'SquadMate_x',
        handle: 'squad.mate.x',
        role: 'The person who gifted her',
        clues: [
          'Bought her something expensive in-game',
          'Jokes about “owing” them',
          'Wants longer private voice chats',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Negotiating with the person using gift-debt feeds the trap. She doesn’t owe a chat, a pic, or a secret.',
      },
    ],
  },
  {
    id: 'job-abroad',
    title: 'The abroad job',
    concept: 'Too-good travel jobs',
    conceptExplain:
      '“Quick cash abroad, no ID, leave this week, keep it private” is not a normal teen job. Those lines show up in trafficking and scam ads because they skip every safety check.',
    situation:
      'Sophia shows Mary a flashy story: “Earn fast abroad — no ID needed, flights this week, privacy guaranteed 💰✈️.” It looks exciting. Both of them feel curious.',
    question: 'Who should they trust to handle this?',
    lesson:
      'Jobs that skip ID and rush travel are danger signals. School adults and official helplines beat the poster’s “privacy.”',
    contacts: [
      {
        id: 'teacher',
        name: 'Their teacher',
        role: 'School adult',
        clues: [
          'Can report it so others see a warning',
          'Knows official helplines',
          'Might make it a whole-class talk',
        ],
        trust: 'best',
        feedback:
          'Best. Bring the screenshot to a teacher. Checking with a helpline protects more students than a quiet DM ever will.',
      },
      {
        id: 'sophia-plan',
        name: 'Just Sophia — research together',
        role: 'Friend, same age',
        clues: [
          'They can Google the company name',
          'Feels less “scary adult”',
          'Two teens can still miss red flags',
        ],
        trust: 'partly',
        feedback:
          'Partly. Researching together is better than clicking alone — still tell a teacher/parent. Abroad + no ID needs an adult, not just Google.',
      },
      {
        id: 'poster',
        name: 'internships.fast',
        handle: 'internships.fast',
        role: 'Account posting the offer',
        clues: [
          'Promises money and travel fast',
          'Says ID isn’t needed',
          'Replies with more “exclusive” links',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Never ask the poster of a too-good overseas job to “explain” it. That’s how people get pulled in deeper.',
      },
    ],
  },
  {
    id: 'threat',
    title: 'The threat',
    concept: 'Threats after “no”',
    conceptExplain:
      'If someone threatens you after you refuse (photos, money, “everyone will see”), that’s coercion — using fear to control you. You don’t have to handle it alone, and you shouldn’t pay or send more.',
    situation:
      'Mary said no to a photo. The account replies: “Delete me and you’ll regret it. Everyone at school will see.” She’s scared and staring at the screen.',
    question: 'Who should Mary trust for help right now?',
    lesson:
      'Threats after a no are about fear and control. Don’t pay, don’t argue alone — a trusted adult and a helpline first.',
    contacts: [
      {
        id: 'adult-helpline',
        name: 'Trusted adult + helpline',
        role: 'Parent/teacher + Kindertelefoon',
        clues: [
          'Can help screenshot and report',
          'Know not to pay or send more',
          'Mary might cry or feel ashamed — that’s okay',
        ],
        trust: 'best',
        feedback:
          'Best. Stop replying, keep evidence, tell an adult. In the Netherlands: 0800‑0432 (De Kindertelefoon) or helpwanted.nl.',
      },
      {
        id: 'delete-alone',
        name: 'Delete everything alone',
        role: 'Handle it privately',
        clues: [
          'Feels like taking control',
          'Might wipe useful screenshots',
          'Leaves her stuck with the fear',
        ],
        trust: 'partly',
        feedback:
          'Partly. Stopping the chat helps — but screenshot first and tell an adult. Threats feel smaller when you’re not alone with them.',
      },
      {
        id: 'threatener',
        name: 'The account threatening her',
        handle: 'sorry.not.sorry',
        role: 'Using fear for control',
        clues: [
          'Already ignored her “no”',
          'Pushes her to reply fast',
          'Talks about “everyone will see”',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Paying, arguing, or pleading usually makes it worse. Don’t give them more attention or more content.',
      },
    ],
  },
  {
    id: 'jealous-friends',
    title: 'Cut your friends off',
    concept: 'Cutting you off',
    conceptExplain:
      '“Your friends are jealous — you only need me” is how control starts. People who care about you don’t ask you to drop your whole support network.',
    situation:
      'Someone Mary chats with every day says: “Your friends are jealous of us. Stop hanging out with them. You have me — that’s enough.” Lately they get annoyed when she’s with Sophia.',
    question: 'Who should Mary trust?',
    lesson:
      'Isolation often starts soft: “they don’t get us.” Real care never needs you to lose your friends.',
    contacts: [
      {
        id: 'friends',
        name: 'Her real-life friends',
        role: 'People she knows at school',
        clues: [
          'Known offline for years',
          'Might say “that chat sounds controlling”',
          'Don’t ask her to hide from her parents',
        ],
        trust: 'best',
        feedback:
          'Best. Keep her friends — and tell them (and a parent) what this person is saying. Isolation shrinks when it’s spoken out loud.',
      },
      {
        id: 'balance',
        name: 'Stay quiet and “balance both”',
        role: 'Avoid a fight',
        clues: [
          'Keeps her friends for now',
          'Avoids drama in the chat',
          'The pressure stays a secret',
        ],
        trust: 'partly',
        feedback:
          'Partly — keeping friends matters. Still name the behaviour to someone she trusts, so it doesn’t escalate in private.',
      },
      {
        id: 'isolator',
        name: 'The chat partner',
        handle: 'only.us.now',
        role: 'Wants more of her time',
        clues: [
          'Texts all day',
          'Gets cold when she’s with friends',
          'Frames it as “they’re jealous”',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Anyone who needs her to cut friends off is building control — not a healthier relationship.',
      },
    ],
  },
  {
    id: 'safe-study',
    title: 'The study invite',
    concept: 'Not every message is a trap',
    conceptExplain:
      'Safety skills aren’t “trust nobody.” Known classmates, public places, and normal plans can be fine. The skill is spotting pressure, secrecy, and strangers — not freezing your whole life.',
    situation:
      'Maya from biology — Mary sits next to her in class — texts on their usual chat: “Library after school to revise the quiz? I’ll be by the windows. Bring snacks if you want.”',
    question: 'What’s reasonable here?',
    lesson:
      'Known classmates + a public place + no secrecy can be normal. Still tell a parent where you’re going — that’s ordinary safety, not panic.',
    contacts: [
      {
        id: 'maya',
        name: 'Maya',
        role: 'Classmate Mary knows offline',
        clues: [
          'Same class every week',
          'Public library, daytime',
          'No gifts, secrets, or urgency',
        ],
        trust: 'best',
        feedback:
          'Best. This looks like a normal school plan. Still tell a parent where she’s going — that’s everyday safety, not suspicion.',
      },
      {
        id: 'skip-all',
        name: 'Cancel — trust nobody online ever',
        role: 'Total shutdown',
        clues: [
          'Avoids some online risk',
          'Also blocks normal school plans',
          'Treats Maya like a stranger',
        ],
        trust: 'partly',
        feedback:
          'Partly. Caution is smart — but a known classmate and a public study plan aren’t the same as a groomer DM. Panic isn’t the skill; judgment is.',
      },
      {
        id: 'stranger-offer',
        name: 'A random “tutor” DM',
        handle: 'free.tutors.nl',
        role: 'Unknown account',
        clues: [
          'Offers free help the same afternoon',
          'Suggests picking Mary up after',
          'Wants to move off the school chat',
        ],
        trust: 'unsafe',
        feedback:
          'Unsafe. Don’t swap a known classmate plan for a stranger’s “help,” especially if they want a private pickup.',
      },
    ],
  },
];
