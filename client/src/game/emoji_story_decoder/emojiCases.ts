export type TacticId =
  | 'loveBombing'
  | 'isolation'
  | 'secrecy'
  | 'platformSwitch'
  | 'giftBait'
  | 'debtTrap'
  | 'fakeOffer'
  | 'imageRequest'
  | 'pressure'
  | 'sextortion'
  | 'locationGrab'
  | 'documentGrab'
  | 'exploitation'
  | 'criminalExploitation';

export interface Tactic {
  name: string;
  emoji: string;
  description: string;
}

export const TACTICS: Record<TacticId, Tactic> = {
  loveBombing: {
    name: 'Love bombing',
    emoji: '💘',
    description:
      'A flood of compliments and attention that builds trust fast, before you have time to think.',
  },
  isolation: {
    name: 'Isolation',
    emoji: '🧱',
    description:
      'Driving a wedge between you and the people who would notice something is wrong.',
  },
  secrecy: {
    name: 'Secrecy',
    emoji: '🤫',
    description:
      '“Don’t tell anyone.” Secrets keep the adults who could help out of the loop.',
  },
  platformSwitch: {
    name: 'Platform switch',
    emoji: '👻',
    description:
      'Moving you to apps with disappearing messages: no trail, no moderators.',
  },
  giftBait: {
    name: 'Gift bait',
    emoji: '🎁',
    description:
      'Gifts, credits or money that make you feel you owe something back.',
  },
  debtTrap: {
    name: 'Debt trap',
    emoji: '💸',
    description:
      'A gift, trip or favour becomes a debt, to be paid back in ways you never agreed to.',
  },
  fakeOffer: {
    name: 'Too-good offer',
    emoji: '✨',
    description:
      'Modelling, jobs or travel with big money and no requirements. Real offers don’t work like that.',
  },
  imageRequest: {
    name: 'Image request',
    emoji: '📸',
    description:
      'Asking for photos. Every image is leverage that can be used against you later.',
  },
  pressure: {
    name: 'Pressure',
    emoji: '⏳',
    description:
      'Pushing after you said no: “just one”, “I sent mine”, “if you loved me”, “now or never”.',
  },
  sextortion: {
    name: 'Sextortion',
    emoji: '⛓️',
    description:
      'Threatening to share images, real or faked, unless you pay or send more. It is a crime, and never your fault.',
  },
  locationGrab: {
    name: 'Location grab',
    emoji: '📍',
    description:
      'Asking where you are, which bus you take, or to turn on live location.',
  },
  documentGrab: {
    name: 'Document grab',
    emoji: '🛂',
    description:
      'Asking for your ID or passport, or “keeping it safe” so you can’t leave.',
  },
  exploitation: {
    name: 'Exploitation',
    emoji: '🥂',
    description:
      'Asking you to “be nice” to others or “help out” to pay off a debt. This is how sexual exploitation starts.',
  },
  criminalExploitation: {
    name: 'Criminal exploitation',
    emoji: '📦',
    description:
      'Using teens to carry packages, money or drugs. The “easy money” job leaves you holding the risk.',
  },
};

export interface ThreadMessage {
  from: 'them' | 'mary';
  text: string;
  /** Set when the message is a red flag. */
  flag?: TacticId;
  /** Shown after flags are locked in: why it is, or isn't, a red flag. */
  note?: string;
}

export interface ChoiceOption {
  text: string;
  /** Decode: 1 = correct, 0 = wrong. Move: 3 = best, 1 = partly right, 0 = unsafe. */
  score: number;
  feedback: string;
}

export interface EmojiCase {
  id: string;
  title: string;
  contact: { handle: string; clues: string[] };
  setup: string;
  thread: ThreadMessage[];
  decode: { sequence: string; question: string; options: ChoiceOption[] };
  move: { options: ChoiceOption[] };
}

export const DECODE_POINTS = 2;
export const MOVE_POINTS = 3;
export const CASES_PER_RUN = 5;

export const CASES: EmojiCase[] = [
  {
    id: 'scout',
    title: 'The model scout',
    contact: {
      handle: 'lumen.models.agency',
      clues: ['Account 2 weeks old', '4 posts', '0 mutual friends'],
    },
    setup:
      'Mary posted dance-team photos last week. Today an “agency” slides into her DMs.',
    thread: [
      {
        from: 'them',
        text: 'heyy saw ur pics on the dance team page 📸 u have such a rare look ✨✨',
        flag: 'loveBombing',
        note: 'Over-the-top praise from a stranger is the hook.',
      },
      { from: 'mary', text: 'omg thanks?? who is this' },
      {
        from: 'them',
        text: 'I scout for an agency in Milan 🇮🇹 casting new faces for a summer shoot, u’d be perfect',
        flag: 'fakeOffer',
        note: 'Real agencies don’t recruit 15-year-olds through random DMs.',
      },
      {
        from: 'them',
        text: 'what’s ur fav brand btw? 👗',
        note: 'Small talk on its own isn’t a red flag.',
      },
      {
        from: 'them',
        text: 'we cover ✈️ 🏨 everything up front. u just pay us back from ur first jobs 💸',
        flag: 'debtTrap',
        note: '“Pay us back later” turns a free trip into a debt they control.',
      },
      { from: 'mary', text: 'i’d have to ask my mom' },
      {
        from: 'them',
        text: 'ofc!! tho parents always freak before they see the contract 😅 show her after u sign? 🤫',
        flag: 'secrecy',
        note: 'Signing first and telling her mom later cuts out the adult who would check.',
      },
    ],
    decode: {
      sequence: '✈️ 🏨 → 💸',
      question: 'What is the real deal behind these emojis?',
      options: [
        {
          text: 'They pay up front, then Mary owes them money, a debt they can use to control her abroad.',
          score: 1,
          feedback:
            'Exactly. Paying back travel “from your first jobs” is a classic debt trap used in trafficking.',
        },
        {
          text: 'A free trip, the agency invests in new talent.',
          score: 0,
          feedback: 'Look at the 💸: nothing here is free. It is a loan.',
        },
        {
          text: 'A normal travel refund after the shoot.',
          score: 0,
          feedback:
            'A refund means Mary gets money back. Here she owes them, before earning anything.',
        },
        {
          text: 'A model scholarship that covers her costs.',
          score: 0,
          feedback: 'Scholarships don’t need paying back from “first jobs”.',
        },
      ],
    },
    move: {
      options: [
        {
          text: 'Don’t sign or send anything. Screenshot the chat, show her mom, and report the account.',
          score: 3,
          feedback:
            'Best move. Evidence plus a trusted adult, and the platform can stop the account reaching others.',
        },
        {
          text: 'Ask the scout for the agency’s website and phone number first.',
          score: 1,
          feedback:
            'Checking is smart, but fake agencies have fake websites. An adult should verify, not the scout.',
        },
        {
          text: 'Say yes, but bring a friend to Milan for safety.',
          score: 0,
          feedback:
            'Unsafe. A friend doesn’t cancel a debt or protect you abroad. Now two people are at risk.',
        },
        {
          text: 'Sign now. She can always cancel later.',
          score: 0,
          feedback:
            'Unsafe. Once the debt exists, “cancelling” is exactly what they won’t allow.',
        },
      ],
    },
  },
  {
    id: 'gamer',
    title: 'The squad mate',
    contact: {
      handle: 'nxght_wolf',
      clues: ['Met in an online game', 'Says he’s 16', 'Never video called'],
    },
    setup:
      'Mary has played in the same squad as this guy for three months. Tonight he messages after a match.',
    thread: [
      {
        from: 'them',
        text: 'gg tonight 🔥 ur actually cracked at this',
        note: 'Normal gaming talk. Not a red flag by itself.',
      },
      {
        from: 'them',
        text: 'fr ur the only one who gets me. everyone else is so fake 🙄',
        flag: 'loveBombing',
        note: '“Only you understand me” builds an intense bond fast.',
      },
      {
        from: 'them',
        text: 'ur parents still on u about screen time? they don’t get u like i do 😔',
        flag: 'isolation',
        note: 'Turning Mary against her parents removes her safety net.',
      },
      {
        from: 'them',
        text: 'got u the battle pass 🎁 don’t tell them lol',
        flag: 'giftBait',
        note: 'A gift plus “don’t tell” is grooming, not generosity.',
      },
      { from: 'mary', text: 'wait fr?? thank u' },
      {
        from: 'them',
        text: 'np 😊 ur gonna owe me one tho 😏',
        flag: 'debtTrap',
        note: 'The gift was never free. Now he can cash it in.',
      },
      {
        from: 'them',
        text: 'let’s move to 👻 the voice here is laggy',
        flag: 'platformSwitch',
        note: 'Disappearing messages mean no evidence.',
      },
    ],
    decode: {
      sequence: '🎁 + “ur gonna owe me one 😏”',
      question: 'What does the gift really mean here?',
      options: [
        {
          text: 'The gift creates a debt he can use later to pressure her into something.',
          score: 1,
          feedback:
            'Right. Gifts followed by “you owe me” are how groomers create obligation.',
        },
        {
          text: 'He’s being a good friend and joking around.',
          score: 0,
          feedback:
            'The 😏 and the secrecy say otherwise. Friends don’t keep score in secret.',
        },
        {
          text: 'He wants her to buy him a battle pass back.',
          score: 0,
          feedback:
            'That would be fair, but it isn’t what “owe me one 😏” is pointing to.',
        },
        {
          text: 'He wants her to play more ranked matches with him.',
          score: 0,
          feedback:
            'Look at the whole thread: isolation, secrecy, then a private app.',
        },
      ],
    },
    move: {
      options: [
        {
          text: 'Refuse the app switch, screenshot the chat, and tell a parent or trusted adult, even about the gift.',
          score: 3,
          feedback:
            'Best move. The gift is exactly what he’s counting on to keep her quiet. Telling breaks that.',
        },
        {
          text: 'Pay him back for the battle pass so she owes nothing, and keep gaming with him.',
          score: 1,
          feedback:
            'Clears the debt, but the isolation and the push to a private app are still happening.',
        },
        {
          text: 'Move to 👻 but never send photos there.',
          score: 0,
          feedback:
            'Unsafe. The private app is where pressure escalates, with no trail and no one watching.',
        },
        {
          text: 'Keep it secret so her parents don’t take her console.',
          score: 0,
          feedback:
            'Unsafe. That fear is exactly the leverage he built. A trusted adult won’t punish her for this.',
        },
      ],
    },
  },
  {
    id: 'sextortion',
    title: 'The threat',
    contact: {
      handle: 'jaden.k__',
      clues: ['Followed Mary yesterday', 'Profile pic is a stock photo'],
    },
    setup:
      'A new follower starts chatting. Mary says no to sending a photo. Then the tone changes.',
    thread: [
      {
        from: 'them',
        text: 'heyy saw u at the concert last week 🎶',
        note: 'Could be true, so on its own not a red flag.',
      },
      {
        from: 'them',
        text: 'u looked so good, send a pic of ur fit? 📸😏',
        flag: 'imageRequest',
        note: 'A photo request from someone she doesn’t know.',
      },
      { from: 'mary', text: 'nah im good' },
      {
        from: 'them',
        text: 'come on just 1 🥺 i sent u mine',
        flag: 'pressure',
        note: 'Ignoring her “no” and guilt-tripping.',
      },
      {
        from: 'them',
        text: 'fine. i already made pics of u 🔞 with ur face. €200 in 💳 gift cards in 24h ⏳ or ur whole school sees',
        flag: 'sextortion',
        note: 'Faked images plus a demand and a deadline is sextortion.',
      },
      {
        from: 'them',
        text: 'tell anyone and i post them instantly 🤫',
        flag: 'secrecy',
        note: 'Threats to keep her silent. Telling is exactly what stops it.',
      },
    ],
    decode: {
      sequence: '💳 ⏳ 📤',
      question: 'What is he demanding?',
      options: [
        {
          text: 'Pay in gift cards before a deadline, or he shares the images.',
          score: 1,
          feedback:
            'Yes. Untraceable payment plus a countdown is the sextortion script.',
        },
        {
          text: 'He wants to send her a gift card as an apology.',
          score: 0,
          feedback: 'The ⏳ and 📤 are a threat, not an apology.',
        },
        {
          text: 'He’s asking her to share his post before it expires.',
          score: 0,
          feedback: 'Read it with the thread: payment, deadline, exposure.',
        },
        {
          text: 'He’s joking, there are no real pictures.',
          score: 0,
          feedback:
            'Even if the images are fake, the threat is real and serious. It still needs action.',
        },
      ],
    },
    move: {
      options: [
        {
          text: 'Don’t pay or reply. Screenshot everything, block, report, and tell a trusted adult or a helpline.',
          score: 3,
          feedback:
            'Best move. It is not her fault. Evidence lets platforms and police act, and helplines can get images taken down.',
        },
        {
          text: 'Block him and delete the whole chat so it all goes away.',
          score: 1,
          feedback:
            'Blocking is right, but deleting destroys the evidence needed to report him.',
        },
        {
          text: 'Pay once so he deletes them.',
          score: 0,
          feedback:
            'Unsafe. Paying shows it works. Demands almost always come back bigger.',
        },
        {
          text: 'Beg him to delete them and promise not to tell.',
          score: 0,
          feedback:
            'Unsafe. Promising silence gives him more control. Telling someone is what ends it.',
        },
      ],
    },
  },
  {
    id: 'courier',
    title: 'The easy money job',
    contact: {
      handle: 'cashflow.jobs.nl',
      clues: ['Posts only money emojis', 'Comments turned off'],
    },
    setup:
      'An account Mary doesn’t follow sends a job offer to her and a few classmates.',
    thread: [
      {
        from: 'them',
        text: '💼 hiring 15+ 💸 €500/week, no experience, no CV',
        flag: 'fakeOffer',
        note: '€500 a week for teens with no experience isn’t a real job.',
      },
      { from: 'mary', text: 'what’s the job' },
      {
        from: 'them',
        text: 'just pick up a 📦 and drop it at an address 🚲 easy',
        flag: 'criminalExploitation',
        note: 'Moving unknown packages is how teens get used as drug or money couriers.',
      },
      { from: 'mary', text: 'what’s in the package' },
      {
        from: 'them',
        text: 'don’t ask questions 😂 that’s the job',
        flag: 'secrecy',
        note: 'If she can’t know what she’s carrying, she’s the one taking the risk.',
      },
      {
        from: 'them',
        text: 'we pay every friday 💶',
        note: 'Payment details on their own aren’t a red flag. The job is.',
      },
      {
        from: 'them',
        text: 'send a pic of ur ID 🪪 for payroll',
        flag: 'documentGrab',
        note: 'Her ID tells them who she is and where she lives, which is leverage if she wants out.',
      },
    ],
    decode: {
      sequence: '📦 🚲 💸 🤐',
      question: 'What is this “job” really?',
      options: [
        {
          text: 'Carrying something illegal for criminals, with Mary taking the risk if she’s caught.',
          score: 1,
          feedback:
            'Right. Criminal exploitation targets teens because they’re cheaper and easier to control.',
        },
        {
          text: 'A normal delivery job, like a food courier.',
          score: 0,
          feedback:
            'Delivery jobs tell you what you’re carrying and don’t pay €500 for a bike ride.',
        },
        {
          text: 'A secret-santa style surprise delivery.',
          score: 0,
          feedback: 'The 🤐 and the money say otherwise.',
        },
        {
          text: 'Reselling sneakers online.',
          score: 0,
          feedback: 'There’s nothing in the thread about reselling.',
        },
      ],
    },
    move: {
      options: [
        {
          text: 'Don’t reply or send her ID. Report the account and warn a trusted adult, since classmates got it too.',
          score: 3,
          feedback:
            'Best move. Recruiters message whole groups, so telling an adult can protect her classmates too.',
        },
        {
          text: 'Do one delivery to see if it’s legit, then quit.',
          score: 0,
          feedback:
            'Unsafe. The first job is the hook. After that they know who she is and “quitting” gets threatened.',
        },
        {
          text: 'Ignore it and say nothing.',
          score: 1,
          feedback:
            'She stays safe, but the account keeps targeting others. Reporting matters.',
        },
        {
          text: 'Ask what’s in the box first, then decide.',
          score: 0,
          feedback:
            'Unsafe. They already refused to say. Keep the conversation closed.',
        },
      ],
    },
  },
  {
    id: 'loverboy',
    title: 'The boyfriend',
    contact: {
      handle: 'milan_04',
      clues: ['19 years old', 'Dating Mary for 2 months', 'Mary is 15'],
    },
    setup:
      'Mary’s older boyfriend has been sweet for weeks. Lately things feel different.',
    thread: [
      {
        from: 'them',
        text: 'good morning beautiful ☀️💕',
        note: 'Affection alone isn’t a red flag. The pattern around it is.',
      },
      {
        from: 'them',
        text: 'ur friends are just jealous of us, that’s why they talk bad about me 🙄',
        flag: 'isolation',
        note: 'Discrediting her friends removes the people warning her.',
      },
      {
        from: 'them',
        text: 'got u these 👟 bc u deserve the best 💸',
        flag: 'giftBait',
        note: 'Expensive gifts early on build a feeling of owing him.',
      },
      {
        from: 'them',
        text: 'im in trouble rn 😰 i owe some guys money',
        flag: 'debtTrap',
        note: 'His “debt” becomes her problem to solve.',
      },
      {
        from: 'them',
        text: 'my friend has a party sat 🥂 just be nice to him and we’re good',
        flag: 'exploitation',
        note: '“Be nice to my friend” to pay off a debt is how loverboys start sexual exploitation.',
      },
      { from: 'mary', text: 'what do u mean be nice' },
      {
        from: 'them',
        text: 'if u loved me u wouldn’t ask ❤️‍🩹',
        flag: 'pressure',
        note: 'Using her love as a weapon to stop her asking questions.',
      },
    ],
    decode: {
      sequence: '🥂 + “just be nice to him”',
      question: 'What is he asking Mary to do?',
      options: [
        {
          text: 'To do things with his “friend” so his debt gets paid. This is the loverboy method.',
          score: 1,
          feedback:
            'Right. Romance, gifts, a sudden debt, then “help me out”: a known pattern of sexual exploitation.',
        },
        {
          text: 'To be polite at a party and make a good impression.',
          score: 0,
          feedback:
            'Then why connect it to his debt, and why can’t she ask what he means?',
        },
        {
          text: 'To help organise the party.',
          score: 0,
          feedback: 'Nothing in the thread is about organising.',
        },
        {
          text: 'To meet his family for the first time.',
          score: 0,
          feedback: 'He said his friend, the one he owes, not family.',
        },
      ],
    },
    move: {
      options: [
        {
          text: 'Don’t go. Save the messages and tell a trusted adult or a helpline. This is not her fault.',
          score: 3,
          feedback:
            'Best move. Loverboys rely on shame and love to keep victims quiet. Telling someone breaks that grip.',
        },
        {
          text: 'Break up with him, but keep it to herself because she feels embarrassed.',
          score: 1,
          feedback:
            'Leaving is right, but loverboys often don’t let go easily. She shouldn’t handle that alone.',
        },
        {
          text: 'Go to the party, but only if he stays with her.',
          score: 0,
          feedback:
            'Unsafe. He is the one setting this up. His presence doesn’t protect her.',
        },
        {
          text: 'Help pay his debt with her savings instead.',
          score: 0,
          feedback:
            'Unsafe. The debt is a tool. Paying it teaches him she can be pressured.',
        },
      ],
    },
  },
  {
    id: 'location',
    title: 'The “classmate”',
    contact: {
      handle: 'sam.vdb_',
      clues: ['Says he goes to Mary’s school', '0 mutual friends'],
    },
    setup:
      'Someone claiming to be from Mary’s school starts asking about her day.',
    thread: [
      {
        from: 'them',
        text: 'yo ur in 4B right? 🏫 i think we have gym together',
        note: 'Claiming a shared school isn’t a red flag yet, but check it: 0 mutual friends.',
      },
      {
        from: 'them',
        text: 'which bus do u take home 🚌',
        flag: 'locationGrab',
        note: 'Her daily route tells him where and when to find her.',
      },
      { from: 'mary', text: 'why' },
      {
        from: 'them',
        text: 'turn on ur 📍 live location, wanna surprise u at the mall sat',
        flag: 'locationGrab',
        note: 'Live location means he always knows where she is.',
      },
      {
        from: 'them',
        text: 'don’t tell ur friends, it’s a surprise 🤫',
        flag: 'secrecy',
        note: 'Secrecy means no one would know where she went.',
      },
      {
        from: 'them',
        text: 'my cousin can drive us after 🚗',
        flag: 'isolation',
        note: 'Getting her into a car with strangers removes every way out.',
      },
    ],
    decode: {
      sequence: '📍 + 🤫 + 🚗',
      question: 'Put together, what is this plan?',
      options: [
        {
          text: 'Know exactly where she is, make sure nobody else knows, and get her into a car.',
          score: 1,
          feedback:
            'Yes. Location, secrecy and transport together are how someone is isolated and moved.',
        },
        {
          text: 'A cute surprise date with a lift home.',
          score: 0,
          feedback:
            'A real classmate would have mutual friends and wouldn’t need her hidden from them.',
        },
        {
          text: 'He wants to share his own location with her.',
          score: 0,
          feedback: 'He asked for hers, not the other way around.',
        },
        {
          text: 'A school group outing.',
          score: 0,
          feedback: 'A group outing wouldn’t need to be kept from her friends.',
        },
      ],
    },
    move: {
      options: [
        {
          text: 'Keep location off, don’t say which bus. Screenshot, block, and tell a trusted adult or a teacher.',
          score: 3,
          feedback:
            'Best move. A teacher can also check whether this “classmate” exists.',
        },
        {
          text: 'Share her location only for Saturday, then turn it off.',
          score: 0,
          feedback: 'Unsafe. One afternoon is all it takes.',
        },
        {
          text: 'Go to the mall but bring her friends without telling him.',
          score: 1,
          feedback:
            'Friends help, but the plan still ends in a stranger’s car. Better not to go at all.',
        },
        {
          text: 'Ask him to prove he goes to her school.',
          score: 0,
          feedback:
            'Anyone can fake proof. She shouldn’t have to investigate him herself.',
        },
      ],
    },
  },
  {
    id: 'aupair',
    title: 'The dream job abroad',
    contact: {
      handle: 'euro.aupair.connect',
      clues: ['No company website linked', 'Messages only at night'],
    },
    setup:
      'Mary’s cousin Lina (17) shows her a DM about an au pair job. Mary reads it with her.',
    thread: [
      {
        from: 'them',
        text: 'Au pair job in London 🇬🇧 €2000/month 💶 no experience needed',
        flag: 'fakeOffer',
        note: 'Huge pay, no requirements, and Lina is under 18, too young for a legal au pair job.',
      },
      {
        from: 'them',
        text: 'do u like kids? 👶',
        note: 'A normal job question. Not a red flag by itself.',
      },
      {
        from: 'them',
        text: 'send a photo of ur passport 🛂 so we can book ur flight',
        flag: 'documentGrab',
        note: 'Passport details in a stranger’s hands can be misused.',
      },
      {
        from: 'them',
        text: 'when u land the family keeps ur passport safe 🔐',
        flag: 'documentGrab',
        note: 'Taking your passport is a key sign of trafficking. Without it you can’t leave.',
      },
      {
        from: 'them',
        text: 'u can call home once ur settled 📵',
        flag: 'isolation',
        note: 'Cutting contact with family is how victims lose their support.',
      },
      {
        from: 'them',
        text: 'only 2 spots left, decide tonight ⏳',
        flag: 'pressure',
        note: 'A fake deadline stops her from checking with anyone.',
      },
    ],
    decode: {
      sequence: '🛂 🔐 📵',
      question: 'What would happen to Lina in London?',
      options: [
        {
          text: 'Her passport is taken and contact with home is cut, so she can’t leave.',
          score: 1,
          feedback:
            'Right. Document control plus isolation are core signs of human trafficking.',
        },
        {
          text: 'The family is just being careful with important papers.',
          score: 0,
          feedback:
            'Nobody needs to hold your passport for you. Keeping it is control, not care.',
        },
        {
          text: 'She has to get a UK phone first.',
          score: 0,
          feedback: '📵 here means no calls home, not a new SIM card.',
        },
        {
          text: 'Her passport is checked at the airport.',
          score: 0,
          feedback: 'Passport control gives it back. They said they’d keep it.',
        },
      ],
    },
    move: {
      options: [
        {
          text: 'Tell Lina not to send anything, screenshot the offer, and bring it to a parent together.',
          score: 3,
          feedback:
            'Best move. Mary noticed a friend in danger. Bringing it to an adult together is exactly right.',
        },
        {
          text: 'Tell Lina to ask for a video call with the family first.',
          score: 1,
          feedback:
            'A call can be faked. Keeping the passport is already a dealbreaker on its own.',
        },
        {
          text: 'Let Lina decide. It’s her life, and Mary shouldn’t interfere.',
          score: 0,
          feedback:
            'Unsafe. Spotting signs and speaking up is how friends protect each other.',
        },
        {
          text: 'Tell Lina to go, but keep a copy of her passport.',
          score: 0,
          feedback:
            'Unsafe. A copy doesn’t get her home. The setup itself is the problem.',
        },
      ],
    },
  },
  {
    id: 'safe',
    title: 'The study group',
    contact: {
      handle: 'lotte.vd',
      clues: [
        'Mary’s classmate since year 1',
        '38 mutual friends',
        'They’ve met in person',
      ],
    },
    setup:
      'Mary’s friend from class messages about Saturday. Is anything here a red flag?',
    thread: [
      {
        from: 'them',
        text: 'can u send the bio notes 📚 i was sick tuesday 🤒',
        note: 'Ordinary request between classmates.',
      },
      { from: 'mary', text: 'yeah sending now' },
      {
        from: 'them',
        text: 'we’re doing a study group sat 2pm at the library 📖 u in?',
        note: 'A public place, a daytime plan, with people Mary knows.',
      },
      {
        from: 'them',
        text: 'my mom can drive us 🚗 she said she’ll text ur mom',
        note: 'A known parent, with Mary’s parents in the loop. The opposite of secrecy.',
      },
      { from: 'mary', text: 'perfect 🙌' },
      {
        from: 'them',
        text: 'bring snacks pls 🍪😂',
        note: 'Just snacks.',
      },
    ],
    decode: {
      sequence: '📖 🚗 📲 👩',
      question: 'How is this plan different from the risky ones?',
      options: [
        {
          text: 'Everything is open: a known friend, a public place, and parents know.',
          score: 1,
          feedback:
            'Exactly. Openness is the sign of a safe plan. Danger hides, safety doesn’t.',
        },
        {
          text: 'It isn’t. Every car ride is a red flag.',
          score: 0,
          feedback:
            'Context matters. A friend’s parent who texts Mary’s mom is not the same as a stranger’s cousin.',
        },
        {
          text: 'It’s risky because they’re meeting on a weekend.',
          score: 0,
          feedback: 'The day of the week isn’t what makes something risky.',
        },
        {
          text: 'The snacks emoji is code for something else.',
          score: 0,
          feedback:
            'Sometimes a cookie is just a cookie. Overthinking can make you miss real warning signs.',
        },
      ],
    },
    move: {
      options: [
        {
          text: 'Go, and let her own parents know the plan too.',
          score: 3,
          feedback:
            'Best move. Spotting danger also means recognising when something is safe.',
        },
        {
          text: 'Block Lotte just in case.',
          score: 0,
          feedback:
            'Nothing here was a red flag. Being suspicious of everyone isolates you too.',
        },
        {
          text: 'Go, but don’t tell her parents. It’s only the library.',
          score: 1,
          feedback:
            'Probably fine, but telling your parents where you’ll be is a good habit, even for safe plans.',
        },
        {
          text: 'Ask Lotte to prove her mom will really drive.',
          score: 0,
          feedback:
            'She’s a friend Mary knows offline, and the parents are already talking.',
        },
      ],
    },
  },
];
