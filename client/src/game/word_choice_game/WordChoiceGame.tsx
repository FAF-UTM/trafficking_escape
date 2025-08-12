import React, { useEffect, useState } from 'react';
import './WordChoiceGame.css';

interface WordChoice {
  word: string;
  isCorrect: boolean;
}

interface WordChoiceQuestion {
  id: number;
  sentence: string; // Use a placeholder (________) for the missing word.
  options: WordChoice[];
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

// All 8 levels. We will pick 4 at random each session.
const allQuestions: WordChoiceQuestion[] = [
  {
    id: 1,
    sentence:
      "Mary gets: 'Let's hang out tonight, no parents.' Traffickers use ___________ to separate teens from safe adults.",
    options: [
      { word: 'secrecy', isCorrect: true },
      { word: 'humor', isCorrect: false },
      { word: 'games', isCorrect: false },
    ],
    feedbackCorrect:
      'Correct! Secrecy like “no parents” is used to isolate kids from protection and oversight.',
    feedbackIncorrect:
      'Not quite. “No parents” is about secrecy, which isolates and increases risk.',
  },
  {
    id: 2,
    sentence:
      "A stranger moves the chat to a private app and asks Mary for a 'quick pic' to 'prove trust.' This is ___________.",
    options: [
      { word: 'grooming', isCorrect: true },
      { word: 'flirting', isCorrect: false },
      { word: 'networking', isCorrect: false },
    ],
    feedbackCorrect:
      'Correct! Moving private + asking for pics are grooming behaviors used to gain leverage.',
    feedbackIncorrect:
      'Incorrect. That pattern is grooming, not harmless flirting or “networking.”',
  },
  {
    id: 3,
    sentence:
      'Someone asks for live location and offers a ride. This is an ___________ tactic.',
    options: [
      { word: 'isolation', isCorrect: true },
      { word: 'academic', isCorrect: false },
      { word: 'charity', isCorrect: false },
    ],
    feedbackCorrect:
      'Correct! Location + rides are used to isolate and control movement.',
    feedbackIncorrect:
      'Not quite. That combo is about isolation, not academics or charity.',
  },
  {
    id: 4,
    sentence:
      "An online 'scout' says 'no cap' and pressures Mary to meet tonight. The safest response is to ___________.",
    options: [
      { word: 'refuse', isCorrect: true },
      { word: 'negotiate', isCorrect: false },
      { word: 'delay', isCorrect: false },
    ],
    feedbackCorrect:
      'Correct! Refuse and tell a trusted adult. “No cap” doesn’t make it safe or real.',
    feedbackIncorrect:
      'Incorrect. Do not negotiate or “delay”—refuse and tell a trusted adult.',
  },
  {
    id: 5,
    sentence:
      'A secret party invite with free gifts is a classic ___________ lure.',
    options: [
      { word: 'recruitment', isCorrect: true },
      { word: 'homework', isCorrect: false },
      { word: 'sport', isCorrect: false },
    ],
    feedbackCorrect:
      'Correct! Gifts + secrecy are common recruitment lures used by traffickers.',
    feedbackIncorrect:
      'Not quite. The pattern describes a recruitment lure, not homework or sports.',
  },
  {
    id: 6,
    sentence:
      'Asking for Mary\'s home address to “send a gift” is a ___________ request.',
    options: [
      { word: 'dangerous', isCorrect: true },
      { word: 'helpful', isCorrect: false },
      { word: 'polite', isCorrect: false },
    ],
    feedbackCorrect:
      'Correct! Never share addresses with strangers. It\'s dangerous.',
    feedbackIncorrect:
      'Incorrect. That\'s dangerous, not helpful or polite.',
  },
  {
    id: 7,
    sentence:
      '“Keep this just between us” is a ___________ red flag.',
    options: [
      { word: 'manipulation', isCorrect: true },
      { word: 'celebration', isCorrect: false },
      { word: 'tradition', isCorrect: false },
    ],
    feedbackCorrect:
      'Correct! Secrecy requests are manipulation to avoid adult oversight.',
    feedbackIncorrect:
      'Not quite. That\'s manipulation meant to hide behavior from adults.',
  },
  {
    id: 8,
    sentence:
      '“Trust me fr 💯” after Mary sets a boundary is ___________ pressure.',
    options: [
      { word: 'coercive', isCorrect: true },
      { word: 'academic', isCorrect: false },
      { word: 'harmless', isCorrect: false },
    ],
    feedbackCorrect:
      'Correct! Pushing “trust me fr 💯” after a boundary is coercive pressure.',
    feedbackIncorrect:
      'Incorrect. That\'s coercive pressure, not harmless.',
  },
];

interface WordChoiceGameProps {
  onComplete: () => void;
}

const WordChoiceGame: React.FC<WordChoiceGameProps> = ({ onComplete }) => {
  // Stages: "intro", "question", "feedback", "end"
  const [stage, setStage] = useState<'intro' | 'question' | 'feedback' | 'end'>(
    'intro'
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [questions, setQuestions] = useState<WordChoiceQuestion[]>([]);

  // Pick 4 random questions and shuffle options
  useEffect(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4).map((q) => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5),
    }));
    setQuestions(selected);
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleStart = () => {
    setStage('question');
  };

  const handleOptionClick = (option: WordChoice) => {
    setSelectedOption(option.word);
    setIsCorrect(option.isCorrect);
    setStage('feedback');
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      setStage('end');
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setStage('question');
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  if (questions.length === 0) {
    return <div className="word-choice-container" />;
  }

  return (
    <div className="word-choice-container">
      {/* Intro Modal */}
      {stage === 'intro' && (
        <div className="modal-overlay" onClick={handleStart}>
          <div className="modal-content intro" onClick={(e) => e.stopPropagation()}>
            <h2 className="intro-title">How to play</h2>
            <p className="intro-text">
              Mary is chatting online. Each sentence has a missing word. Choose the
              safest, most accurate word to complete it.
            </p>
            <p className="intro-text">
              These scenarios reflect real grooming and trafficking tactics. Think
              about what protects Mary and what raises risk.
            </p>
            <p className="intro-text">(Click outside to start)</p>
          </div>
        </div>
      )}

      {/* Question Stage */}
      {stage === 'question' && currentQuestion && (
        <div className="question-screen fade-in">
          <h2 className="question-title">Question {currentIndex + 1}</h2>
          <p className="question-sentence">{currentQuestion.sentence}</p>
          <div className="options-container">
            {currentQuestion.options.map((option) => (
              <button
                key={option.word}
                className="option-button"
                onClick={() => handleOptionClick(option)}
              >
                {option.word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Stage */}
      {stage === 'feedback' && currentQuestion && (
        <div className="feedback-screen fade-in">
          {isCorrect ? (
            <h3 className="feedback-title correct">Correct!</h3>
          ) : (
            <h3 className="feedback-title incorrect">Incorrect!</h3>
          )}
          <p className="feedback-text">
            {isCorrect
              ? currentQuestion.feedbackCorrect
              : currentQuestion.feedbackIncorrect}
          </p>
          <button className="next-button" onClick={handleNext}>
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      )}

      {/* End Stage */}
      {stage === 'end' && (
        <div className="end-screen fade-in">
          <h2 className="end-title">Well Done!</h2>
          <p className="end-text">
            You’ve practiced spotting manipulation and trafficking red flags.
            Stay alert and tell a trusted adult if something feels wrong.
          </p>
          <button className="end-button" onClick={handleFinish}>
            Finish
          </button>
        </div>
      )}
    </div>
  );
};

export default WordChoiceGame;
