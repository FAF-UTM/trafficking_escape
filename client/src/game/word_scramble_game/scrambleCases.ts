export type WordKind = 'threat' | 'action';

export interface MoveOption {
  text: string;
  /** 0 = unsafe, 1 = partly, 2 = best */
  score: number;
  feedback: string;
}

export interface ScrambleCase {
  id: string;
  answer: string;
  kind: WordKind;
  /** Short scene Mary is in. */
  context: string;
  /** Clue that does not spell the answer. */
  clue: string;
  /** Extra letters that do not belong in the word. */
  decoys: string;
  fact: string;
  move: {
    question: string;
    options: MoveOption[];
  };
}

export const CASES_PER_RUN = 5;
export const POINTS_SOLVE = 15;
export const POINTS_MOVE_BEST = 10;
export const POINTS_MOVE_PARTLY = 5;
export const HINT_COST = 5;
export const WRONG_COST = 3;

export const CASES: ScrambleCase[] = [
  {
    id: 'secrets',
    answer: 'SECRECY',
    kind: 'threat',
    context: 'A new chat says: “Keep this just between us, okay?”',
    clue: 'Hiding from adults on purpose — not the same as privacy.',
    decoys: 'TX',
    fact: '“Just between us” cuts Mary off from people who could help. That’s secrecy.',
    move: {
      question: 'What should Mary do with that message?',
      options: [
        {
          text: 'Promise to keep it quiet so they trust her',
          score: 0,
          feedback:
            'That plays into the trap. Secrecy protects the other person, not Mary.',
        },
        {
          text: 'Show the chat to a friend or parent she trusts',
          score: 2,
          feedback: 'Breaking the secrecy request is the safest move.',
        },
        {
          text: 'Ask them why first, then decide',
          score: 1,
          feedback:
            'Curiosity is natural, but stalling still keeps the secret. Better to tell someone now.',
        },
      ],
    },
  },
  {
    id: 'groom',
    answer: 'GROOMING',
    kind: 'threat',
    context: 'They switch apps, then ask for a “quick pic” to “prove trust.”',
    clue: 'Trust-building that turns into leverage.',
    decoys: 'Z',
    fact: 'Private chat + photo pressure is a grooming pattern: trust first, control later.',
    move: {
      question: 'Safest response?',
      options: [
        {
          text: 'Send a non-face pic so they stop asking',
          score: 0,
          feedback: 'Any pic can be saved or used later. Don’t send.',
        },
        {
          text: 'Refuse, block, and tell a trusted adult',
          score: 2,
          feedback: 'Clear no, then cut contact and get help.',
        },
        {
          text: 'Stay on the public app but keep chatting',
          score: 1,
          feedback:
            'Staying public is better than switching — but the photo ask means she should stop.',
        },
      ],
    },
  },
  {
    id: 'scout',
    answer: 'SCOUT',
    kind: 'threat',
    context: '“I’m a model scout, no cap. Meet tonight. You’ll be famous.”',
    clue: 'Fake job title used to rush a meet-up.',
    decoys: 'HK',
    fact: 'Real scouts don’t pressure teens over DMs the same night. Urgency is the tell.',
    move: {
      question: 'Mary is flattered. What’s the move?',
      options: [
        {
          text: 'Meet in a public café “just to hear more”',
          score: 0,
          feedback:
            'Even public meetups with strangers from DMs are risky. Don’t go.',
        },
        {
          text: 'Ignore the fame talk, ask a parent/teacher to check it',
          score: 2,
          feedback:
            'Adults can verify offers. Fame pressure is not proof it’s real.',
        },
        {
          text: 'Ask for a company website first',
          score: 1,
          feedback:
            'Websites can be faked. Still bring an adult in before anything else.',
        },
      ],
    },
  },
  {
    id: 'block',
    answer: 'BLOCK',
    kind: 'action',
    context: 'Mary said no. They keep pushing: “come on, trust me fr.”',
    clue: 'Cut the connection when pressure ignores a boundary.',
    decoys: 'UY',
    fact: 'Persistent pressure after a no is a red flag. Blocking stops the channel.',
    move: {
      question: 'She already said no twice. Next?',
      options: [
        {
          text: 'Explain her feelings one more time',
          score: 0,
          feedback: 'They already ignored her. More explaining rarely helps.',
        },
        {
          text: 'Block the account and tell someone she trusts',
          score: 2,
          feedback: 'Boundary + backup. That’s the safe combo.',
        },
        {
          text: 'Mute notifications but leave the chat open',
          score: 1,
          feedback:
            'Quieter, but they can still message. Blocking is stronger.',
        },
      ],
    },
  },
  {
    id: 'report',
    answer: 'REPORT',
    kind: 'action',
    context: 'They ask for live location and offer a ride home.',
    clue: 'Tell the platform (and an adult) when location + control show up.',
    decoys: 'N',
    fact: 'Live location + a stranger’s car is an isolation tactic. Reporting creates a record.',
    move: {
      question: 'What belongs in that report?',
      options: [
        {
          text: 'Nothing — reporting makes them angrier',
          score: 0,
          feedback:
            'Their reaction isn’t her job. Reporting protects her and others.',
        },
        {
          text: 'Screenshots of the ask, username, and what they wanted',
          score: 2,
          feedback: 'Evidence helps. Then tell a trusted adult too.',
        },
        {
          text: 'Only the username, no screenshots',
          score: 1,
          feedback:
            'Username helps, but screenshots show what they actually asked for.',
        },
      ],
    },
  },
  {
    id: 'lures',
    answer: 'LURE',
    kind: 'threat',
    context: '“Free gifts + VIP party if you come tonight. Don’t tell anyone.”',
    clue: 'A bait offer that sounds too good and too urgent.',
    decoys: 'SMX',
    fact: 'Gifts, exclusivity, and secrecy are classic recruitment lures.',
    move: {
      question: 'The gifts sound real. What now?',
      options: [
        {
          text: 'Go with a friend so it’s “safer”',
          score: 0,
          feedback:
            'Bringing a friend doesn’t make a stranger’s secret party safe.',
        },
        {
          text: 'Skip it and show the invite to an adult',
          score: 2,
          feedback: 'Refusing the lure and looping in help is the right call.',
        },
        {
          text: 'Ask what the gifts are first',
          score: 1,
          feedback: 'Details won’t fix secrecy + urgency. Still don’t go.',
        },
      ],
    },
  },
  {
    id: 'isolate',
    answer: 'ISOLATE',
    kind: 'threat',
    context:
      '“Your friends are jealous. Stop hanging with them — you have me.”',
    clue: 'Pulling someone away from their real support.',
    decoys: 'W',
    fact: 'Cutting Mary off from friends makes her easier to control. That’s isolation.',
    move: {
      question: 'How should Mary answer that?',
      options: [
        {
          text: 'Spend less time with friends to keep the chat happy',
          score: 0,
          feedback: 'That’s exactly what isolation wants.',
        },
        {
          text: 'Keep her friends close and tell them what’s going on',
          score: 2,
          feedback:
            'Support network first. Isolation loses power when friends know.',
        },
        {
          text: 'Stay friends but hide the chat from them',
          score: 1,
          feedback:
            'Keeping friends helps — hiding the chat still leaves her alone with the risk.',
        },
      ],
    },
  },
  {
    id: 'debt',
    answer: 'DEBT',
    kind: 'threat',
    context: 'They bought her a game pass, then said “ur gonna owe me one.”',
    clue: 'A “gift” that turns into pressure.',
    decoys: 'QJL',
    fact: 'Favours that create “you owe me” are a debt trap — gifts shouldn’t come with IOUs.',
    move: {
      question: 'She already accepted the pass. Now?',
      options: [
        {
          text: 'Do one small favour so it’s even',
          score: 0,
          feedback: 'That teaches them the trap works. She owes nothing.',
        },
        {
          text: 'Say she doesn’t owe them, then block if they push',
          score: 2,
          feedback: 'Clear refusal. Gifts don’t buy compliance.',
        },
        {
          text: 'Offer to pay them back in money later',
          score: 1,
          feedback:
            'Paying can still keep the tie alive. Better to refuse the debt frame entirely.',
        },
      ],
    },
  },
  {
    id: 'exit',
    answer: 'EXIT',
    kind: 'action',
    context:
      'Mary’s stomach drops. The chat feels wrong and she’s alone online.',
    clue: 'Leave the situation before it gets worse.',
    decoys: 'BMP',
    fact: 'Having an exit — close the chat, leave the place, get to safety — matters more than being polite.',
    move: {
      question: 'What’s a solid exit plan?',
      options: [
        {
          text: 'Keep talking until she’s sure it’s dangerous',
          score: 0,
          feedback:
            'Waiting for certainty costs time. Discomfort is enough reason to leave.',
        },
        {
          text: 'Stop the chat, go somewhere safe, tell an adult',
          score: 2,
          feedback: 'Exit first, explain later. That’s the plan.',
        },
        {
          text: 'Log out but check back in an hour',
          score: 1,
          feedback:
            'Logging out helps — but telling someone beats checking alone later.',
        },
      ],
    },
  },
  {
    id: 'verify',
    answer: 'VERIFY',
    kind: 'action',
    context: 'A “job offer” lands in her DMs with a link and a contract PDF.',
    clue: 'Check if it’s real before sharing anything.',
    decoys: 'OO',
    fact: 'Links and PDFs are easy to fake. Verify through a known adult or official channel — never through the stranger.',
    move: {
      question: 'Where should Mary check the offer?',
      options: [
        {
          text: 'Click the link they sent — it’s faster',
          score: 0,
          feedback: 'Their link can be malware or a phishing page. Don’t.',
        },
        {
          text: 'Ask a teacher/parent and look up the company separately',
          score: 2,
          feedback: 'Independent check + adult help. That’s real verification.',
        },
        {
          text: 'Ask the sender for a phone number',
          score: 1,
          feedback:
            'Numbers can be fake too. Still verify offline with someone she trusts.',
        },
      ],
    },
  },
  {
    id: 'consent',
    answer: 'CONSENT',
    kind: 'action',
    context:
      'They joke “send it anyway” after Mary already said she’s not comfortable.',
    clue: 'A clear yes — pressure after a no doesn’t count.',
    decoys: 'X',
    fact: 'Consent is ongoing and can be withdrawn. Pushing after a no is coercion, not romance.',
    move: {
      question: 'Mary already said no. They keep joking about it.',
      options: [
        {
          text: 'Laugh it off so things don’t get awkward',
          score: 0,
          feedback: 'Awkward is safer than giving in. Her no still stands.',
        },
        {
          text: 'Repeat the no, then leave the chat if they continue',
          score: 2,
          feedback: 'Firm boundary, then exit. That’s consent in action.',
        },
        {
          text: 'Change the subject and hope they forget',
          score: 1,
          feedback:
            'Subject-change can help short-term, but a clear no + exit is stronger.',
        },
      ],
    },
  },
  {
    id: 'pressure',
    answer: 'PRESSURE',
    kind: 'threat',
    context: '“If you delete me you’ll regret it. Everyone will see.”',
    clue: 'Threats used to force a choice.',
    decoys: 'Y',
    fact: 'Threats, guilt, and “everyone will see” are pressure/coercion — often tied to sextortion.',
    move: {
      question: 'They’re threatening her. First move?',
      options: [
        {
          text: 'Pay or send what they want so it stops',
          score: 0,
          feedback: 'Paying usually makes it worse. Don’t send anything.',
        },
        {
          text: 'Stop replying, screenshot, tell an adult / helpline',
          score: 2,
          feedback: 'No reply, evidence, help. That’s the safe sequence.',
        },
        {
          text: 'Argue that they’re wrong',
          score: 1,
          feedback: 'Arguing keeps the chat alive. Silence + help is better.',
        },
      ],
    },
  },
];
