import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './EmojiStoryDecoder.css';

interface EmojiOption {
  text: string;
  isCorrect: boolean;
  feedback: string;
}

interface EmojiQuestion {
  id: number;
  emojiStory: string; // can be pure emojis or message+emojis
  context: string; // scenario framing tied to Mary's story
  prompt: string; // must ask both meaning + action
  options: EmojiOption[]; // options combine meaning + safest action
}

// 8 levels. 2 are pure emoji decoding.
const allQuestions: EmojiQuestion[] = [
  {
    id: 1,
    emojiStory: '“You’re stunning ✨ low-key model vibes. Let’s link up tonight, no 🧢.”',
    context:
      "Mary receives a late-night DM from someone she doesn't know who floods her with compliments and pushes to meet.",
    prompt: 'What does this mean, and what should Mary do?',
    options: [
      {
        text: 'It’s grooming with flattery and pressure to meet; Mary should refuse, block, and tell a trusted adult.',
        isCorrect: true,
        feedback:
          'Correct. Excessive praise + “link up” + “no cap” are manipulation/red-flag signals. Refuse, block, and report to a trusted adult.',
      },
      {
        text: 'It’s just a nice compliment; Mary should say thanks and meet in public with a friend.',
        isCorrect: false,
        feedback:
          'Unsafe. Compliment-bombing plus urgency to meet is a common grooming tactic. Do not meet, even in public.',
      },
      {
        text: 'It’s probably a classmate; Mary should ask for proof and keep chatting to learn more.',
        isCorrect: false,
        feedback:
          'Unsafe. Continuing the chat increases risk and gives the person leverage. Stop and tell a trusted adult.',
      },
    ],
  },
  {
    id: 2,
    emojiStory: '“Add me on 👻 and send a quick 📸 — we’ll keep it 🔒.”',
    context:
      'The same account tries to move the chat to a private app and asks Mary for a picture.',
    prompt: 'What does this mean, and what should Mary do?',
    options: [
      {
        text: 'They want to move private and collect images; Mary should refuse, block, and report to a trusted adult.',
        isCorrect: true,
        feedback:
          'Correct. Moving to private channels and asking for photos is a major red flag used to isolate and exploit.',
      },
      {
        text: 'They prefer privacy; Mary should send a harmless selfie to be polite.',
        isCorrect: false,
        feedback:
          'Unsafe. Never send images to strangers. This can lead to coercion or blackmail.',
      },
      {
        text: 'It’s normal among teens; Mary should ask for their selfie first.',
        isCorrect: false,
        feedback:
          'Unsafe. Trading photos with strangers is risky and fuels manipulation. Do not engage.',
      },
    ],
  },
  {
    id: 3,
    emojiStory: '“Drop ur pin 📍 I’ll swing by 🚗, quick trip, promise 💯😉”',
    context:
      'They ask Mary to share her live location and offer a ride with “trust me” emojis.',
    prompt: 'What does this mean, and what should Mary do?',
    options: [
      {
        text: 'They are trying to get her location to isolate her; Mary should not share it, block, and tell a trusted adult immediately.',
        isCorrect: true,
        feedback:
          'Correct. Requests for precise location and rides are isolation tactics. Never share your pin or accept rides.',
      },
      {
        text: 'They just want to help; Mary should share a nearby landmark instead of her address.',
        isCorrect: false,
        feedback:
          'Unsafe. Any location sharing can reveal where Mary is. Decline and report.',
      },
      {
        text: 'It sounds safe if it’s daytime; Mary should go with a friend.',
        isCorrect: false,
        feedback:
          'Unsafe. Do not accept rides from strangers at any time. Refuse and report.',
      },
    ],
  },
  {
    id: 4,
    emojiStory: '“Secret party 🎉 tonight, no parents 🚫. I’ll pick you up 🚗. Keep it 🤫.”',
    context:
      'The account invites Mary to a secret party and insists she keeps it a secret from adults.',
    prompt: 'What does this mean, and what should Mary do?',
    options: [
      {
        text: 'It’s an isolation setup; Mary should refuse, tell a parent/teacher, and block the account.',
        isCorrect: true,
        feedback:
          'Correct. Secrecy + ride offers are classic recruitment tactics. Refuse and inform trusted adults.',
      },
      {
        text: 'It might be legit; Mary should go if she shares her location with a friend.',
        isCorrect: false,
        feedback:
          'Unsafe. “No parents” and secrecy are major red flags. Do not go.',
      },
      {
        text: 'Mary should ask for more details first.',
        isCorrect: false,
        feedback:
          'Unsafe. Do not continue the conversation. Refuse and report.',
      },
    ],
  },
  // Decoding-only (no text). Player must decode meaning + action.
  {
    id: 5,
    emojiStory: '👻 🔒 📸 ⏳',
    context:
      'Decode the emoji sequence. What is likely happening, and what should Mary do?',
    prompt: 'What does this mean, and what should Mary do?',
    options: [
      {
        text: 'Move to private app, send pics, later pressure/blackmail; Mary should refuse, block, and tell a trusted adult.',
        isCorrect: true,
        feedback:
          'Correct. This sequence represents isolation to a private app, image collection, then time-based pressure. Refuse and report.',
      },
      {
        text: 'Make new friends safely; Mary should send only funny filters.',
        isCorrect: false,
        feedback:
          'Unsafe. Private channels and photo requests are not safe with strangers.',
      },
      {
        text: 'It means the chat is boring; Mary should ignore them.',
        isCorrect: false,
        feedback:
          'Partly avoiding them helps, but the safest action is blocking and telling a trusted adult.',
      },
    ],
  },
  {
    id: 6,
    emojiStory: '📍 🏠 🚗 🌙 🎉',
    context:
      'Decode the emoji sequence. What is likely happening, and what should Mary do?',
    prompt: 'What does this mean, and what should Mary do?',
    options: [
      {
        text: 'Share home location, get picked up at night for a party; Mary should refuse, not share, block, and tell a trusted adult.',
        isCorrect: true,
        feedback:
          'Correct. Location + pickup at night + party is high-risk isolation. Refuse and report.',
      },
      {
        text: 'Harmless directions; Mary should share a nearby street corner.',
        isCorrect: false,
        feedback:
          'Unsafe. Any location sharing can expose her home. Do not share location.',
      },
      {
        text: 'A surprise from friends; Mary should go with a friend.',
        isCorrect: false,
        feedback:
          'Unsafe. Strangers, nighttime, and parties are not safe. Decline and inform adults.',
      },
    ],
  },
  {
    id: 7,
    emojiStory: '“Trust me fr 💯 just between us 🤫”',
    context:
      'They push “for real/trust me” and ask Mary to keep secrets from adults.',
    prompt: 'What does this mean, and what should Mary do?',
    options: [
      {
        text: 'It’s an isolation tactic; Mary should stop, block, and tell a trusted adult now.',
        isCorrect: true,
        feedback:
          'Correct. “Trust me fr 💯” + secrecy is a classic manipulation pattern. Stop and report.',
      },
      {
        text: 'It’s normal teen talk; Mary should keep it private to avoid drama.',
        isCorrect: false,
        feedback:
          'Unsafe. Secrecy with strangers is a strong red flag. Do not keep it private.',
      },
      {
        text: 'Mary should ask for proof they are safe.',
        isCorrect: false,
        feedback:
          'Unsafe. Do not vet strangers yourself. Stop and involve trusted adults.',
      },
    ],
  },
  {
    id: 8,
    emojiStory: '“Free gift 🎁📱 if you meet now”',
    context:
      'They offer gifts in exchange for meeting quickly.',
    prompt: 'What does this mean, and what should Mary do?',
    options: [
      {
        text: 'It’s bait to lure her; Mary should refuse, block, and tell a trusted adult.',
        isCorrect: true,
        feedback:
          'Correct. Surprise gifts and urgency are recruitment lures. Refuse and report.',
      },
      {
        text: 'It’s generous; Mary should meet in a busy place.',
        isCorrect: false,
        feedback:
          'Unsafe. Do not meet strangers for gifts in any setting.',
      },
      {
        text: 'Mary should ask for delivery instead.',
        isCorrect: false,
        feedback:
          'Unsafe. Any continued contact increases risk. End the conversation and tell an adult.',
      },
    ],
  },
];

interface EmojiStoryDecoderProps {
  onComplete: () => void;
}

const EmojiStoryDecoder: React.FC<EmojiStoryDecoderProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [stage, setStage] = useState<'intro' | 'question' | 'feedback' | 'end'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<EmojiOption | null>(null);
  const [questions, setQuestions] = useState<EmojiQuestion[]>([]);

  // Randomly select 4 questions and shuffle answer options on mount
  useEffect(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4).map((q) => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5),
    }));
    setQuestions(selected);
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleStart = () => setStage('question');

  const handleOptionClick = (option: EmojiOption) => {
    setSelectedOption(option);
    setStage('feedback');
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) setStage('end');
    else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setStage('question');
    }
  };

  const handleFinish = () => onComplete();

  if (questions.length === 0) return <div>Loading...</div>;

  return (
    <div className="emoji-decoder-container">
      {stage === 'intro' && (
        <div className="modal-overlay" onClick={handleStart}>
          <div className="modal-content intro" onClick={(e) => e.stopPropagation()}>
            <h2 className="intro-title">{t('emojiDecoder.introTitle')}</h2>
            <p className="intro-text">{t('emojiDecoder.introText')}</p>
            <p className="intro-text">{t('emojiDecoder.howToPlay')}</p>
            <p className="intro-text">{t('emojiDecoder.objective')}</p>
            <p className="intro-text">{t('emojiDecoder.tapStart')}</p>
          </div>
        </div>
      )}

      {stage === 'question' && currentQuestion && (
        <div className="question-screen fade-in">
          <div className="context-card">
            <div className="context-text">{currentQuestion.context}</div>
            <div className="emoji-story">{currentQuestion.emojiStory}</div>
          </div>
          <p className="prompt-text">{currentQuestion.prompt}</p>
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button key={index} className="option-button" onClick={() => handleOptionClick(option)}>
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === 'feedback' && selectedOption && (
        <div className="feedback-screen fade-in">
          <h3 className="feedback-title">
            {selectedOption.isCorrect ? t('emojiDecoder.correct') : t('emojiDecoder.incorrect')}
          </h3>
          <p className="feedback-text">{selectedOption.feedback}</p>
          <button className="next-button" onClick={handleNext}>
            {currentIndex === questions.length - 1 ? t('emojiDecoder.finish') : t('emojiDecoder.next')}
          </button>
        </div>
      )}

      {stage === 'end' && (
        <div className="end-screen fade-in">
          <h2 className="end-title">{t('emojiDecoder.completed')}</h2>
          <p className="end-text">{t('emojiDecoder.completionMessage')}</p>
          <button className="end-button" onClick={handleFinish}>
            {t('emojiDecoder.continue')}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmojiStoryDecoder;

