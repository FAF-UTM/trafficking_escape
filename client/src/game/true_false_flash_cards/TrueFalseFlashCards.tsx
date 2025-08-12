import React, { useEffect, useMemo, useState } from 'react';
import './TrueFalseFlashCards.css';

interface FlashCard {
  statement: string;
  answer: boolean;
  explanation: string;
}

const allFlashCards: FlashCard[] = [
  // Practical rules (teen-friendly)
  {
    statement: "Real friends don’t ask you to keep chats secret from parents or teachers.",
    answer: true,
    explanation: "Secrecy protects predators. If someone says ‘don’t tell,’ that’s a red flag—talk to a trusted adult.",
  },
  {
    statement: "Sharing a ‘harmless’ selfie with a stranger is fine if you’re fully clothed.",
    answer: false,
    explanation: "Any image can be saved, edited, or used to pressure you later. Don’t send photos to strangers.",
  },
  {
    statement: "If a chat feels off, you can block without explaining anything.",
    answer: true,
    explanation: "You don’t owe strangers a response. Trust your instincts; blocking protects your time and safety.",
  },
  {
    statement: "Moving to ‘private apps’ or ‘vanish mode’ is a common grooming move.",
    answer: true,
    explanation: "Predators try to isolate conversations where messages disappear. Stay on safer, reportable channels.",
  },
  {
    statement: "Asking for your live location or offering you a ride is not a big deal.",
    answer: false,
    explanation: "Location + rides help isolate you. Never share live location or take rides from strangers.",
  },
  {
    statement: "Traffickers often start by acting like a boyfriend/girlfriend or cool mentor.",
    answer: true,
    explanation: "They build trust with compliments, gifts, and attention before pushing boundaries.",
  },
  {
    statement: "If someone sends gifts or money first, it means they can be trusted.",
    answer: false,
    explanation: "Gifts can be a hook to create debt or pressure. You don’t owe anything—refuse and tell an adult.",
  },
  {
    statement: "You can talk to a teacher, counselor, or parent even if you ‘promised’ to keep it secret.",
    answer: true,
    explanation: "Your safety comes first. It’s okay to break a ‘secret’ to get help from trusted adults.",
  },
  {
    statement: "You must send proof (pic/video) to join a ‘friends-only’ group.",
    answer: false,
    explanation: "No legit group requires private pics or videos. That’s coercion—block and report.",
  },
  {
    statement: "Screenshots and report features can help protect you and other users.",
    answer: true,
    explanation: "Screenshots preserve evidence. Reporting suspicious accounts helps platforms and adults intervene.",
  },

  // General facts (light statistics & venues)
  {
    statement: "Human trafficking includes both forced labor and sexual exploitation.",
    answer: true,
    explanation: "It’s not only sexual exploitation—forced labor happens in many industries, often hidden in plain sight.",
  },
  {
    statement: "Most trafficking happens only across international borders.",
    answer: false,
    explanation: "Many cases occur within a victim’s own country. Trafficking can be local as well as cross‑border.",
  },
  {
    statement: "Traffickers rarely use social media or messaging apps today.",
    answer: false,
    explanation: "Recruiters frequently use DMs, groups, and private chat features to contact and groom victims.",
  },
  {
    statement: "‘Easy money’ or ‘no experience’ job offers that sound too good to be true can be traps.",
    answer: true,
    explanation: "Scammers and traffickers use fake jobs to lure people. Be cautious and verify with trusted adults.",
  },
  {
    statement: "Labor trafficking often involves domestic work, restaurants/food service, agriculture, or construction.",
    answer: true,
    explanation: "Multiple reports identify these sectors as frequent sites of labor exploitation and coercion.",
  },

  // Light stats (kept minimal and understandable)
  {
    statement: "Tens of millions of people worldwide are affected by human trafficking.",
    answer: true,
    explanation: "Global estimates place victims in the tens of millions across forced labor and sexual exploitation.",
  },
  {
    statement: "Human trafficking generates only a tiny amount of criminal profit worldwide.",
    answer: false,
    explanation: "It generates massive illicit profits—one of the world’s most lucrative crimes.",
  },
  {
    statement: "Many victims don’t report because of fear, language barriers, or distrust of authorities.",
    answer: true,
    explanation: "These barriers make it harder to seek help and contribute to underreporting.",
  },
  {
    statement: "Prevention, protection, and prosecution all matter—but prevention sometimes lags behind.",
    answer: true,
    explanation: "Education and early intervention need as much focus as catching and punishing traffickers.",
  },
  {
    statement: "Teens can’t help; only adults can stop trafficking.",
    answer: false,
    explanation: "Teens help by learning red flags, protecting their privacy, supporting friends, and asking trusted adults for help.",
  },
];

interface TrueFalseFlashCardsProps {
  onComplete: () => void;
}

const TrueFalseFlashCards: React.FC<TrueFalseFlashCardsProps> = ({ onComplete }) => {
  // Stage: "intro" → "flashcard" → "end"
  const [stage, setStage] = useState<'intro' | 'flashcard' | 'end'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);

  // Select 5 random cards per run
  const flashCards = useMemo(() => {
    return [...allFlashCards].sort(() => Math.random() - 0.5).slice(0, 5);
  }, []);

  const currentCard = flashCards[currentIndex];

  const handleStart = () => {
    setStage('flashcard');
  };

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex === flashCards.length - 1) {
      setStage('end');
    } else {
      setCurrentIndex((i) => i + 1);
      setShowFeedback(false);
      setSelectedAnswer(null);
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  if (!flashCards.length) return <div className="flashcards-container" />;

  return (
    <div className="flashcards-container">
      {/* How to play modal */}
      {stage === 'intro' && (
        <div className="modal-overlay" onClick={handleStart}>
          <div className="modal-content intro" onClick={(e) => e.stopPropagation()}>
            <h2 className="intro-title">How to play</h2>
            <p className="intro-text">
              Decide if each statement is true or false. You’ll get a mix of smart safety rules,
              real‑world facts, and a few light stats.
            </p>
            <p className="intro-text">
              Watch for secrecy, private apps, location/ride requests, gifts, and pressure. (Click outside to start)
            </p>
          </div>
        </div>
      )}

      {/* Flashcard Screen */}
      {stage === 'flashcard' && (
        <div className="flashcard-screen fade-in">
          <div className="card large">
            <p className="card-statement">{currentCard.statement}</p>
          </div>
          {!showFeedback ? (
            <div className="buttons-container">
              <button className="choice-button" onClick={() => handleAnswer(true)}>
                True
              </button>
              <button className="choice-button" onClick={() => handleAnswer(false)}>
                False
              </button>
            </div>
          ) : (
            <div className="feedback-container">
              {selectedAnswer === currentCard.answer ? (
                <h3 className="feedback-title correct">Correct!</h3>
              ) : (
                <h3 className="feedback-title incorrect">Incorrect!</h3>
              )}
              <p className="feedback-text">{currentCard.explanation}</p>
              <button className="next-button" onClick={handleNext}>
                {currentIndex === flashCards.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* End Screen */}
      {stage === 'end' && (
        <div className="end-screen fade-in">
          <h2 className="end-title">Well Done!</h2>
          <p className="end-text">
            Keep these ideas in mind, trust your instincts, and reach out to trusted adults when something feels off.
          </p>
          <button className="end-button" onClick={handleFinish}>Finish</button>
        </div>
      )}
    </div>
  );
};

export default TrueFalseFlashCards;
