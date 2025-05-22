import React, { useState } from 'react';
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

const questions: WordChoiceQuestion[] = [
  {
    id: 1,
    sentence: 'Traffickers often use ___________ to manipulate victims.',
    options: [
      { word: 'kindness', isCorrect: false },
      { word: 'violence', isCorrect: true },
      { word: 'money', isCorrect: false },
    ],
    feedbackCorrect:
      'Correct! Violence is a common method used by traffickers to instill fear and control.',
    feedbackIncorrect:
      'Not quite. While kindness or money may be used in other contexts, violence is often used to manipulate and control victims.',
  },
  {
    id: 2,
    sentence:
      'Online platforms can be used to spread ___________ and misinformation.',
    options: [
      { word: 'knowledge', isCorrect: false },
      { word: 'propaganda', isCorrect: true },
      { word: 'entertainment', isCorrect: false },
    ],
    feedbackCorrect:
      'Correct! Propaganda can be a tool to mislead and exploit vulnerable individuals.',
    feedbackIncorrect:
      'That’s not right. In this context, propaganda is used to mislead people rather than share knowledge or provide entertainment.',
  },
  {
    id: 3,
    sentence:
      'Raising awareness helps communities to identify ___________ signals in risky interactions.',
    options: [
      { word: 'subtle', isCorrect: true },
      { word: 'loud', isCorrect: false },
      { word: 'random', isCorrect: false },
    ],
    feedbackCorrect:
      'Correct! Being alert to subtle signals can be key in recognizing potential trafficking risks.',
    feedbackIncorrect:
      'Incorrect. In the realm of trafficking, subtle signals are often the warning signs, not loud or random cues.',
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

  return (
    <div className="word-choice-container">
      {/* Intro Stage */}
      {stage === 'intro' && (
        <div className="intro-screen fade-in">
          <h2 className="intro-title">
            Fill in the Blank: Trafficking Awareness
          </h2>
          <p className="intro-text">
            In this quiz, complete each sentence by choosing the most
            appropriate word. Your choices will reveal important facts about how
            traffickers manipulate and control.
          </p>
          <button className="intro-button" onClick={handleStart}>
            Start Quiz
          </button>
        </div>
      )}

      {/* Question Stage */}
      {stage === 'question' && (
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
      {stage === 'feedback' && (
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
            You’ve completed the quiz and learned key facts about trafficking
            manipulation. Stay informed and share your knowledge to help protect
            others.
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
