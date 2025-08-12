import React, { useMemo, useState } from 'react';
import './SafetyChecklistBuilder.css';

interface SafetyItem {
  id: number;
  name: string;
  image: string;
  isEssential: boolean;
}

type Stage = 'intro' | 'selection' | 'feedback' | 'end';

interface SafetyChecklistBuilderProps {
  onComplete: () => void;
}

const allItems: SafetyItem[] = [
  { id: 1, name: 'ID', image: '/assets/id.png', isEssential: true },
  { id: 2, name: 'Emergency Contact', image: '/assets/emergency_contact.png', isEssential: true },
  { id: 3, name: 'Charged Phone', image: '/assets/smartphone.png', isEssential: true },
  { id: 4, name: 'Emergency Numbers', image: '/assets/file.png', isEssential: true },
  { id: 5, name: 'Screenshots of Chat', image: '/assets/note.png', isEssential: true },
  { id: 6, name: 'Safe Meeting Plan', image: '/assets/contract.png', isEssential: true },
  // Decoys / not recommended
  { id: 7, name: 'Secret Party Flyer', image: '/assets/file.png', isEssential: false },
  { id: 8, name: 'Unknown Ride Offer', image: '/assets/wirecutter.png', isEssential: false },
  { id: 9, name: 'Random Gift Card', image: '/assets/money.png', isEssential: false },
  { id: 10, name: 'Private App Invite', image: '/assets/file.png', isEssential: false },
  { id: 11, name: 'Blindfold', image: '/assets/blindfold.png', isEssential: false },
  { id: 12, name: 'Cash Stash Only', image: '/assets/money.png', isEssential: false },
];

const SafetyChecklistBuilder: React.FC<SafetyChecklistBuilderProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<Stage>('intro');
  const [selectedItems, setSelectedItems] = useState<SafetyItem[]>([]);

  // Random subset each run (e.g., 8 items)
  const availableItems = useMemo(() => {
    return [...allItems].sort(() => Math.random() - 0.5).slice(0, 8);
  }, []);

  const toggleItem = (item: SafetyItem) => {
    setSelectedItems((prev) => {
      if (prev.find((si) => si.id === item.id)) {
        return prev.filter((si) => si.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const handleSubmit = () => setStage('feedback');

  const essentialItems = availableItems.filter((item) => item.isEssential);
  const missingEssentials = essentialItems.filter((item) => !selectedItems.find((si) => si.id === item.id));
  const wrongSelections = selectedItems.filter((item) => !item.isEssential);

  return (
    <div className="safety-checklist-container">
      {/* How to play modal */}
      {stage === 'intro' && (
        <div className="modal-overlay" onClick={() => setStage('selection')}>
          <div className="modal-content intro" onClick={(e) => e.stopPropagation()}>
            <h2 className="intro-title">How to play</h2>
            <p className="intro-text">
              Build Mary’s safety checklist. Choose items that actually protect her (ID, contacts, plans) and avoid traps
              (secret parties, unknown rides, private app invites).
            </p>
            <p className="intro-text">Pick what helps in a risky chat or meeting situation. (Click outside to start)</p>
          </div>
        </div>
      )}

      {/* Selection Stage */}
      {stage === 'selection' && (
        <div className="selection-screen fade-in">
          <h2 className="selection-title">Select Your Items</h2>
          <div className="items-container">
            {availableItems.map((item) => {
              const selected = !!selectedItems.find((si) => si.id === item.id);
              return (
                <div
                  key={item.id}
                  className={`item-card ${selected ? 'selected' : ''}`}
                  onClick={() => toggleItem(item)}
                >
                  <div className="item-name">{item.name}</div>
                </div>
              );
            })}
          </div>
          <button className="submit-button" onClick={handleSubmit}>Submit Checklist</button>
        </div>
      )}

      {/* Feedback Stage */}
      {stage === 'feedback' && (
        <div className="feedback-screen fade-in">
          <h2 className="feedback-title">Your Safety Pack Evaluation</h2>
          <div className="feedback-details">
            {missingEssentials.length === 0 && wrongSelections.length === 0 ? (
              <p className="feedback-text">Excellent! You picked the essentials and avoided the traps.</p>
            ) : (
              <>
                {missingEssentials.length > 0 && (
                  <p className="feedback-text advice">Consider adding: {missingEssentials.map((i) => i.name).join(', ')}.</p>
                )}
                {wrongSelections.length > 0 && (
                  <p className="feedback-text advice-note">Not recommended: {wrongSelections.map((i) => i.name).join(', ')}.</p>
                )}
              </>
            )}
          </div>
          <button className="next-button" onClick={() => setStage('end')}>Continue</button>
        </div>
      )}

      {/* End Stage */}
      {stage === 'end' && (
        <div className="end-screen fade-in">
          <h2 className="end-title">Checklist Complete</h2>
          <p className="end-text">Preparation matters. Keep IDs and contacts ready, save screenshots, and make a safety plan.</p>
          <button className="end-button" onClick={onComplete}>Finish</button>
        </div>
      )}
    </div>
  );
};

export default SafetyChecklistBuilder;
