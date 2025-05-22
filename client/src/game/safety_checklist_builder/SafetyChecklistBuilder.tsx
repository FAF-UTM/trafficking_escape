import React, { useState } from 'react';
import './SafetyChecklistBuilder.css';

interface SafetyItem {
  id: number;
  name: string;
  image: string;
  isEssential: boolean;
}

const availableItems: SafetyItem[] = [
  { id: 1, name: 'ID', image: '/assets/id.png', isEssential: true },
  {
    id: 2,
    name: 'Emergency Contact',
    image: '/assets/emergency_contact.png',
    isEssential: true,
  },
  { id: 3, name: 'Contract', image: '/assets/contract.png', isEssential: true },
  {
    id: 4,
    name: 'Blindfold',
    image: '/assets/blindfold.png',
    isEssential: false,
  },
  // Additional items can be added here if desired.
  {
    id: 5,
    name: 'Smartphone',
    image: '/assets/smartphone.png',
    isEssential: true,
  },
  { id: 6, name: 'Money', image: '/assets/money.png', isEssential: true },
];

type Stage = 'intro' | 'selection' | 'feedback' | 'end';

interface SafetyChecklistBuilderProps {
  onComplete: () => void;
}

const SafetyChecklistBuilder: React.FC<SafetyChecklistBuilderProps> = ({
  onComplete,
}) => {
  const [stage, setStage] = useState<Stage>('intro');
  const [selectedItems, setSelectedItems] = useState<SafetyItem[]>([]);

  const toggleItem = (item: SafetyItem) => {
    if (selectedItems.find((si) => si.id === item.id)) {
      setSelectedItems(selectedItems.filter((si) => si.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSubmit = () => {
    setStage('feedback');
  };

  // Compute which essential items are missing and which non-essential items were mistakenly selected
  const essentialItems = availableItems.filter((item) => item.isEssential);
  const missingEssentials = essentialItems.filter(
    (item) => !selectedItems.find((si) => si.id === item.id)
  );
  const wrongSelections = selectedItems.filter((item) => !item.isEssential);

  return (
    <div className="safety-checklist-container">
      {/* Intro Stage */}
      {stage === 'intro' && (
        <div className="intro-screen fade-in">
          <h2 className="intro-title">Safety Checklist Builder</h2>
          <p className="intro-text">
            Before you begin your escape, assemble your safety pack. Choose
            wisely—the right items can protect you, while distractions might
            cost you dearly.
          </p>
          <button
            className="intro-button"
            onClick={() => setStage('selection')}
          >
            Begin Building
          </button>
        </div>
      )}

      {/* Selection Stage */}
      {stage === 'selection' && (
        <div className="selection-screen fade-in">
          <h2 className="selection-title">Select Your Items</h2>
          <div className="items-container">
            {availableItems.map((item) => (
              <div
                key={item.id}
                className={`item-card ${selectedItems.find((si) => si.id === item.id) ? 'selected' : ''}`}
                onClick={() => toggleItem(item)}
              >
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-name">{item.name}</div>
              </div>
            ))}
          </div>
          <button className="submit-button" onClick={handleSubmit}>
            Submit Checklist
          </button>
        </div>
      )}

      {/* Feedback Stage */}
      {stage === 'feedback' && (
        <div className="feedback-screen fade-in">
          <h2 className="feedback-title">Your Safety Pack Evaluation</h2>
          <div className="feedback-details">
            {missingEssentials.length === 0 && wrongSelections.length === 0 ? (
              <p className="feedback-text">
                Excellent! You've selected all the essential items.
              </p>
            ) : (
              <>
                {missingEssentials.length > 0 && (
                  <p className="feedback-text">
                    Missing essential items:{' '}
                    {missingEssentials.map((item) => item.name).join(', ')}.
                  </p>
                )}
                {wrongSelections.length > 0 && (
                  <p className="feedback-text">
                    Items not recommended:{' '}
                    {wrongSelections.map((item) => item.name).join(', ')}.
                  </p>
                )}
              </>
            )}
          </div>
          <button className="next-button" onClick={() => setStage('end')}>
            Continue
          </button>
        </div>
      )}

      {/* End Stage */}
      {stage === 'end' && (
        <div className="end-screen fade-in">
          <h2 className="end-title">Checklist Complete</h2>
          <p className="end-text">
            Your safety pack is ready. Remember, careful preparation is key to
            staying safe.
          </p>
          <button className="end-button" onClick={onComplete}>
            Finish
          </button>
        </div>
      )}
    </div>
  );
};

export default SafetyChecklistBuilder;
