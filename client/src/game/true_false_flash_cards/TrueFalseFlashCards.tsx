import React, { useState } from 'react';
import './TrueFalseFlashCards.css';

interface FlashCard {
  statement: string;
  answer: boolean;
  explanation: string;
}

const flashCards: FlashCard[] = [
  {
    statement:
      'Most human trafficking occurs within national borders rather than across them.',
    answer: true,
    explanation:
      'While cross-border trafficking exists, a large percentage of trafficking happens domestically.',
  },
  {
    statement:
      'Online social networks have no role in modern trafficking operations.',
    answer: false,
    explanation:
      'Traffickers increasingly use social media to recruit and manipulate victims.',
  },
  {
    statement: 'Coercion in trafficking always involves physical violence.',
    answer: false,
    explanation:
      'Traffickers often use psychological manipulation, debt bondage, or threats without overt violence.',
  },
  {
    statement:
      'Raising awareness and educating communities can help reduce trafficking risks.',
    answer: true,
    explanation:
      'Informed communities are better prepared to recognize red flags and protect vulnerable individuals.',
  },
];

interface TrueFalseFlashCardsProps {
  onComplete: () => void;
}

const TrueFalseFlashCards: React.FC<TrueFalseFlashCardsProps> = ({
  onComplete,
}) => {
  // Stage: "intro" → "flashcard" → "end"
  const [stage, setStage] = useState<'intro' | 'flashcard' | 'end'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);

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
      setCurrentIndex(currentIndex + 1);
      setShowFeedback(false);
      setSelectedAnswer(null);
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <div className="flashcards-container">
      {/* Intro Screen */}
      {stage === 'intro' && (
        <div className="intro-screen fade-in">
          <h2 className="intro-title">True or False: Trafficking Facts</h2>
          <p className="intro-text">
            As a fact-checker on the frontlines of awareness, your role is to
            decide whether each statement is true or false. Your choices will
            reveal important insights about trafficking and help spread
            knowledge to protect vulnerable communities.
          </p>
          <button className="intro-button" onClick={handleStart}>
            Start Quiz
          </button>
        </div>
      )}

      {/* Flashcard Screen */}
      {stage === 'flashcard' && (
        <div className="flashcard-screen fade-in">
          <div className="card">
            <p className="card-statement">{currentCard.statement}</p>
          </div>
          {!showFeedback ? (
            <div className="buttons-container">
              <button
                className="choice-button"
                onClick={() => handleAnswer(true)}
              >
                True
              </button>
              <button
                className="choice-button"
                onClick={() => handleAnswer(false)}
              >
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
                Next
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
            Your keen eye for detail has helped clarify some common
            misconceptions about trafficking. Stay informed, keep questioning,
            and share what you’ve learned.
          </p>
          <button className="end-button" onClick={handleFinish}>
            Finish
          </button>
        </div>
      )}
    </div>
  );
};

export default TrueFalseFlashCards;
