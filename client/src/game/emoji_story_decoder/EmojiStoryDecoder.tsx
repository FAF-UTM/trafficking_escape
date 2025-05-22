import React, { useState } from 'react';
import './EmojiStoryDecoder.css';

interface EmojiOption {
  text: string;
  isCorrect: boolean;
  feedback: string;
}

interface EmojiQuestion {
  id: number;
  emojiStory: string; // The emoji sequence that tells the story
  prompt: string; // The question prompt asking the player to decode the message
  options: EmojiOption[];
}

const questions: EmojiQuestion[] = [
  {
    id: 1,
    emojiStory: '📱💬❓➡️🚪',
    prompt: 'What does this emoji story suggest?',
    options: [
      {
        text: 'Respond immediately to every online message.',
        isCorrect: false,
        feedback:
          'Not all messages are safe. Quick responses can lead you into dangerous situations.',
      },
      {
        text: 'Be cautious of unexpected online messages.',
        isCorrect: true,
        feedback:
          'Correct! Always verify unknown contacts before engaging further.',
      },
      {
        text: 'Ignore all online communications.',
        isCorrect: false,
        feedback:
          'Overreacting by ignoring every message isn’t practical—but caution is key.',
      },
    ],
  },
  {
    id: 2,
    emojiStory: '👥🤝🔒🚫',
    prompt: 'What is the message behind these emojis?',
    options: [
      {
        text: 'Everyone you meet is trustworthy.',
        isCorrect: false,
        feedback: 'Unfortunately, not everyone is who they seem to be.',
      },
      {
        text: 'Trust only verified friends.',
        isCorrect: false,
        feedback: 'Verifying is important—but the message here is deeper.',
      },
      {
        text: 'Some people may hide dangerous intentions behind friendship.',
        isCorrect: true,
        feedback:
          'Correct! Be aware that some individuals use trust to manipulate others.',
      },
    ],
  },
  {
    id: 3,
    emojiStory: '🏫📚👀💡',
    prompt: 'What does this emoji story convey?',
    options: [
      {
        text: 'Ignore warnings from trusted sources.',
        isCorrect: false,
        feedback: 'That’s not a safe approach; warnings exist for a reason.',
      },
      {
        text: 'Learn and stay alert to potential risks.',
        isCorrect: true,
        feedback:
          'Correct! Education and awareness are essential for staying safe.',
      },
      {
        text: 'Stay isolated and uninformed.',
        isCorrect: false,
        feedback:
          'Isolation can increase vulnerability; knowledge is your strongest shield.',
      },
    ],
  },
];

interface EmojiStoryDecoderProps {
  onComplete: () => void;
}

const EmojiStoryDecoder: React.FC<EmojiStoryDecoderProps> = ({
  onComplete,
}) => {
  // Stage: "intro" → "question" → "feedback" → "end"
  const [stage, setStage] = useState<'intro' | 'question' | 'feedback' | 'end'>(
    'intro'
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<EmojiOption | null>(
    null
  );

  const currentQuestion = questions[currentIndex];

  const handleStart = () => {
    setStage('question');
  };

  const handleOptionClick = (option: EmojiOption) => {
    setSelectedOption(option);
    setStage('feedback');
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      setStage('end');
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setStage('question');
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <div className="emoji-decoder-container">
      {/* Intro Stage */}
      {stage === 'intro' && (
        <div className="intro-screen fade-in">
          <h2 className="intro-title">Emoji Story Decoder</h2>
          <p className="intro-text">
            Decode the message conveyed through emojis. Each story hints at a
            safety tip to help you stay aware and avoid risky situations. Choose
            the best interpretation!
          </p>
          <button className="intro-button" onClick={handleStart}>
            Start
          </button>
        </div>
      )}

      {/* Question Stage */}
      {stage === 'question' && (
        <div className="question-screen fade-in">
          <div className="emoji-story">{currentQuestion.emojiStory}</div>
          <p className="prompt-text">{currentQuestion.prompt}</p>
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className="option-button"
                onClick={() => handleOptionClick(option)}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Stage */}
      {stage === 'feedback' && selectedOption && (
        <div className="feedback-screen fade-in">
          <h3 className="feedback-title">
            {selectedOption.isCorrect ? 'Correct!' : 'Incorrect!'}
          </h3>
          <p className="feedback-text">{selectedOption.feedback}</p>
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
            You've decoded the emoji stories and learned valuable safety tips.
            Stay alert, share your knowledge, and always trust your instincts!
          </p>
          <button className="end-button" onClick={handleFinish}>
            Finish
          </button>
        </div>
      )}
    </div>
  );
};

export default EmojiStoryDecoder;
