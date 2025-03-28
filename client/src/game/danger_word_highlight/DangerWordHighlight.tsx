import React, { useState } from 'react';
import './DangerWordHighlight.css';

interface DangerWordHighlightProps {
  onComplete: () => void;
}

const DangerWordHighlight: React.FC<DangerWordHighlightProps> = ({
  onComplete,
}) => {
  // The fake job ad text to display
  const text =
    'Attention! We are offering a once-in-a-lifetime opportunity to earn quick cash. No ID needed! Join our exclusive team and secure your future. Limited spots available and privacy guaranteed. Apply now!';
  // List of red flag words (in lowercase, stripped of punctuation)
  const dangerWords = [
    'quick',
    'cash',
    'no',
    'id',
    'needed',
    'exclusive',
    'limited',
    'privacy',
    'guaranteed',
  ];

  // Split the text into words (keeping punctuation)
  const words = text.split(' ');

  // State for selected word indices and whether submission has occurred
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set()
  );
  const [submitted, setSubmitted] = useState(false);

  // Toggle selection for a word when clicked (if submission hasn't occurred)
  const toggleWord = (index: number) => {
    if (submitted) return;
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  // Helper: Normalize word by removing punctuation and converting to lowercase
  const normalizeWord = (word: string) => {
    return word.replace(/[^a-zA-Z]/g, '').toLowerCase();
  };

  // Determine which word indices are considered danger words
  const correctIndices = new Set<number>();
  words.forEach((word, index) => {
    if (dangerWords.includes(normalizeWord(word))) {
      correctIndices.add(index);
    }
  });

  // Handler for submitting selections
  const handleSubmit = () => {
    setSubmitted(true);
  };

  // Check if the selection is exactly correct
  const isSelectionCorrect = () => {
    if (selectedIndices.size !== correctIndices.size) return false;
    for (let index of correctIndices) {
      if (!selectedIndices.has(index)) return false;
    }
    return true;
  };

  // Compute lists of missed danger words and extra selections
  const missedWords = Array.from(correctIndices)
    .filter((i) => !selectedIndices.has(i))
    .map((i) => words[i]);
  const extraWords = Array.from(selectedIndices)
    .filter((i) => !correctIndices.has(i))
    .map((i) => words[i]);

  return (
    <div className="danger-highlight-container">
      {!submitted ? (
        <>
          <h2 className="title">Danger Word Highlight</h2>
          <p className="instruction">
            Click on the words that indicate red flags in this job ad.
          </p>
          <div className="text-block">
            {words.map((word, index) => (
              <span
                key={index}
                className={`word ${selectedIndices.has(index) ? 'selected' : ''}`}
                onClick={() => toggleWord(index)}
              >
                {word}{' '}
              </span>
            ))}
          </div>
          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
        </>
      ) : (
        <div className="feedback-screen">
          {isSelectionCorrect() ? (
            <h3 className="feedback correct">
              Excellent job! You correctly identified all red flag words.
            </h3>
          ) : (
            <div className="feedback incorrect">
              <h3>Some selections were incorrect.</h3>
              {missedWords.length > 0 && (
                <p>Missing red flag words: {missedWords.join(', ')}</p>
              )}
              {extraWords.length > 0 && (
                <p>Incorrect selections: {extraWords.join(', ')}</p>
              )}
            </div>
          )}
          <button className="finish-button" onClick={onComplete}>
            Finish
          </button>
        </div>
      )}
    </div>
  );
};

export default DangerWordHighlight;
