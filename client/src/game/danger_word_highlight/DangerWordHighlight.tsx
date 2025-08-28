import React, { useMemo, useState } from 'react';
import './DangerWordHighlight.css';

interface DangerWordHighlightProps {
  onComplete: () => void;
}

interface DangerScenario {
  id: number;
  title: string;
  text: string;
  dangerWords: string[]; // lowercase, punctuation-free tokens to flag
}

type Stage = 'intro' | 'scenario' | 'feedback' | 'end';

const allScenarios: DangerScenario[] = [
  {
    id: 1,
    title: 'Secret Party Invite',
    text: 'Hey! Secret party tonight at a private location. No parents allowed. Limited spots and free gifts if you come now. Keep it between us.',
    dangerWords: [
      'secret',
      'private',
      'no',
      'parents',
      'limited',
      'free',
      'gifts',
      'now',
      'keep',
    ],
  },
  {
    id: 2,
    title: 'Model Scout DM',
    text: "You have the perfect look. I'm a real scout, no cap. Fill this urgent form with your address and phone to join our exclusive team.",
    dangerWords: [
      'real',
      'no',
      'cap',
      'urgent',
      'address',
      'phone',
      'exclusive',
    ],
  },
  {
    id: 3,
    title: 'Move to Private App',
    text: "Let's switch to a private app and send a quick pic to prove trust. No need to tell anyone. I'll delete messages after.",
    dangerWords: [
      'private',
      'quick',
      'pic',
      'prove',
      'trust',
      'tell',
      'delete',
    ],
  },
  {
    id: 4,
    title: 'Ride + Location Request',
    text: 'Share your live location and I will pick you up in my car. It is safe, promise. No need to ask your parents first.',
    dangerWords: [
      'live',
      'location',
      'pick',
      'car',
      'safe',
      'promise',
      'no',
      'parents',
    ],
  },
  {
    id: 5,
    title: 'Money Help Offer',
    text: 'I can help your family with easy money today if you send bank details or meet me now to collect cash. Do not tell anyone.',
    dangerWords: [
      'easy',
      'money',
      'bank',
      'details',
      'meet',
      'now',
      'cash',
      'not',
      'tell',
    ],
  },
  {
    id: 6,
    title: 'Job Ad Red Flags',
    text: 'Attention! Earn quick cash with no ID needed. Travel abroad fast, privacy guaranteed. Limited places. Apply instantly.',
    dangerWords: [
      'quick',
      'cash',
      'no',
      'id',
      'travel',
      'privacy',
      'guaranteed',
      'limited',
      'instantly',
    ],
  },
];

const normalizeWord = (word: string) =>
  word.replace(/[^a-zA-Z]/g, '').toLowerCase();

const DangerWordHighlight: React.FC<DangerWordHighlightProps> = ({
  onComplete,
}) => {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set()
  );
  const [submitted, setSubmitted] = useState(false);

  // Pick 3 random scenarios for this run
  const scenarios = useMemo(() => {
    return [...allScenarios].sort(() => Math.random() - 0.5).slice(0, 3);
  }, []);

  const current = scenarios[currentIndex];
  const words = useMemo(() => current.text.split(' '), [current]);

  const correctIndices = useMemo(() => {
    const set = new Set<number>();
    words.forEach((w, i) => {
      if (current.dangerWords.includes(normalizeWord(w))) set.add(i);
    });
    return set;
  }, [words, current]);

  const toggleWord = (index: number) => {
    if (submitted) return;
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleSubmit = () => setSubmitted(true);

  const isSelectionCorrect = () => {
    if (selectedIndices.size !== correctIndices.size) return false;
    for (const idx of correctIndices)
      if (!selectedIndices.has(idx)) return false;
    return true;
  };

  const missedWords = useMemo(
    () =>
      Array.from(correctIndices)
        .filter((i) => !selectedIndices.has(i))
        .map((i) => words[i]),
    [correctIndices, selectedIndices, words]
  );
  const extraWords = useMemo(
    () =>
      Array.from(selectedIndices)
        .filter((i) => !correctIndices.has(i))
        .map((i) => words[i]),
    [correctIndices, selectedIndices, words]
  );

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedIndices(new Set());
      setSubmitted(false);
      setStage('scenario');
    } else {
      setStage('end');
    }
  };

  const handleStart = () => setStage('scenario');
  const handleFinish = () => onComplete();

  return (
    <div className="danger-highlight-container">
      {stage === 'intro' && (
        <div className="modal-overlay" onClick={handleStart}>
          <div
            className="modal-content intro"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="intro-title">How to play</h2>
            <p className="intro-text">
              Mary is browsing messages and offers. Highlight all words that are
              red flags.
            </p>
            <p className="intro-text">
              Look for secrecy, urgency, money/gifts, private app moves,
              location/ride requests, and fake guarantees.
            </p>
            <p className="intro-text">(Click outside to start)</p>
          </div>
        </div>
      )}

      {stage === 'scenario' && (
        <>
          <h2 className="title">{current.title}</h2>
          <p className="instruction">
            Tap the red‑flag words in this text (hint: secrecy, urgency, money,
            private, location/rides, guarantees):
          </p>
          <div className="text-block">
            {words.map((word, index) => (
              <span
                key={index}
                className={`word ${selectedIndices.has(index) ? 'selected' : ''}`}
                onClick={() => toggleWord(index)}
              >
                {word + ' '}
              </span>
            ))}
          </div>
          {!submitted && (
            <button className="submit-button" onClick={handleSubmit}>
              Submit
            </button>
          )}
        </>
      )}

      {stage === 'scenario' && submitted && (
        <div className="feedback-screen">
          {isSelectionCorrect() ? (
            <h3 className="feedback correct">
              Great! You found all the key red‑flag words.
            </h3>
          ) : (
            <div className="feedback advice">
              <h3>Try these red‑flag words next time:</h3>
              {missedWords.length > 0 && (
                <p className="advice-words">{missedWords.join(', ')}</p>
              )}
              {extraWords.length > 0 && (
                <p className="advice-note">
                  Some picks are neutral. Focus on secrecy, urgency,
                  money/gifts, private, location/rides, guarantees.
                </p>
              )}
            </div>
          )}
          <button className="finish-button" onClick={handleNext}>
            {currentIndex === scenarios.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      )}

      {stage === 'end' && (
        <div className="feedback-screen">
          <h3 className="feedback">
            Well done! You practiced spotting red‑flag words. Stay alert and
            tell a trusted adult.
          </h3>
          <button className="finish-button" onClick={handleFinish}>
            Finish
          </button>
        </div>
      )}
    </div>
  );
};

export default DangerWordHighlight;
