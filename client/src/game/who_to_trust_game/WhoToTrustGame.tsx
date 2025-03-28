import React, { useState } from 'react';
import './WhoToTrustGame.css';

/** Data structures for scenarios */
interface TrustOption {
  id: number;
  name: string;
  description: string;
  feedback: string; // Explanation of consequences or lessons
  isSafe: boolean; // Whether this choice is relatively safer or more risky
}

interface TrustScenario {
  id: number;
  scenarioTitle: string;
  scenarioText: string;
  options: TrustOption[];
}

/** Define a set of scenarios for the game */
const scenarios: TrustScenario[] = [
  {
    id: 1,
    scenarioTitle: 'Stranger at the Cafe',
    scenarioText: `You’re waiting for a friend at a quiet cafe. A friendly stranger offers to buy you a drink 
      and starts asking personal questions about where you live and who you’re with. 
      Meanwhile, the barista also notices you seem uncomfortable and casually checks if everything is okay.`,
    options: [
      {
        id: 1,
        name: 'Agree to chat with the stranger',
        description: 'They might just be being friendly, right?',
        feedback: `Though the stranger might be harmless, sharing personal details 
          too quickly can be risky. Traffickers often use charm to gather info. 
          It’s safer to stay polite but guarded.`,
        isSafe: false,
      },
      {
        id: 2,
        name: 'Politely decline and ask the barista for help',
        description: 'The barista might be more trustworthy.',
        feedback: `Seeking assistance from a staff member in a public place is generally a safer option. 
          You protect your privacy while also having someone watch out for you.`,
        isSafe: true,
      },
    ],
  },
  {
    id: 2,
    scenarioTitle: 'Online Modeling Offer',
    scenarioText: `You receive an unexpected message from someone claiming to be a “talent scout.” 
      They promise big opportunities if you share more photos and personal info. 
      Meanwhile, your friend who had a similar experience warns you to be cautious.`,
    options: [
      {
        id: 1,
        name: 'Trust the scout and send personal details',
        description: 'Maybe it’s a legit big break?',
        feedback: `Legitimate agencies rarely cold-message minors or ask for personal info without formal processes. 
          This could be a red flag for trafficking or exploitation.`,
        isSafe: false,
      },
      {
        id: 2,
        name: 'Ask your friend for advice and verify the agency',
        description: 'Double-check the legitimacy before responding.',
        feedback: `Consulting someone you trust and verifying the agency’s credentials is the safer choice. 
          If they’re legit, they’ll understand your caution.`,
        isSafe: true,
      },
      {
        id: 3,
        name: 'Ignore all messages and block the scout',
        description: 'Better safe than sorry.',
        feedback: `Blocking suspicious contacts can protect you from scams. 
          However, verifying info and reporting suspicious behavior can also help others avoid the same scam.`,
        isSafe: true,
      },
    ],
  },
  {
    id: 3,
    scenarioTitle: 'Unexpected Family Friend',
    scenarioText: `A distant relative of a family friend appears at your doorstep, claiming they can offer you 
      a “great job abroad” with minimal paperwork. They seem to know your parents, but you’ve never met them. 
      Your neighbor, an older teacher, advises you to check official channels before leaving.`,
    options: [
      {
        id: 1,
        name: 'Trust the family friend’s contact',
        description: 'They’re family, sort of—why doubt them?',
        feedback: `Traffickers can exploit family or friend connections to gain trust. 
          Always verify with official resources or a recognized agency before committing.`,
        isSafe: false,
      },
      {
        id: 2,
        name: 'Speak to your neighbor and research official job listings',
        description: 'Listen to the teacher’s advice.',
        feedback: `Double-checking with official channels can prevent dangerous situations. 
          Even if they’re genuine, it’s smart to confirm details thoroughly.`,
        isSafe: true,
      },
    ],
  },
];

interface WhoToTrustGameProps {
  onComplete: () => void;
}

/**
 * A short decision-making game that presents multiple scenarios
 * about whom to trust. After each choice, the user sees feedback
 * and eventually completes all scenarios.
 */
const WhoToTrustGame: React.FC<WhoToTrustGameProps> = ({ onComplete }) => {
  // Index of the current scenario
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track whether the user has chosen an option in the current scenario
  const [chosenOption, setChosenOption] = useState<TrustOption | null>(null);

  // Stage can be "intro", "scenario", "feedback", "end"
  const [stage, setStage] = useState<'intro' | 'scenario' | 'feedback' | 'end'>(
    'intro'
  );

  // Retrieve the current scenario data
  const currentScenario = scenarios[currentIndex];

  /** Move to the scenario stage from intro */
  const handleStart = () => {
    setStage('scenario');
  };

  /** When the user picks an option, move to feedback stage */
  const handleOptionSelect = (option: TrustOption) => {
    setChosenOption(option);
    setStage('feedback');
  };

  /** Move to next scenario or end if done */
  const handleNextScenario = () => {
    // If there's another scenario
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setChosenOption(null);
      setStage('scenario');
    } else {
      // No more scenarios left
      setStage('end');
    }
  };

  /** After final reflection, call onComplete to proceed */
  const handleFinish = () => {
    onComplete();
  };

  return (
    <div className="who-to-trust-container">
      {/* Intro stage */}
      {stage === 'intro' && (
        <div className="intro-screen fade-in">
          <h2 className="intro-title">Who to Trust?</h2>
          <p className="intro-text">
            In a world where manipulation can lurk behind friendly faces,
            deciding who to trust can be critical. You’ll face a series of
            scenarios that test your instincts. Choose carefully!
          </p>
          <button className="intro-button" onClick={handleStart}>
            Start
          </button>
        </div>
      )}

      {/* Scenario stage */}
      {stage === 'scenario' && currentScenario && (
        <div className="scenario-screen fade-in">
          <h2 className="scenario-title">{currentScenario.scenarioTitle}</h2>
          <p className="scenario-text">{currentScenario.scenarioText}</p>
          <div className="options-container">
            {currentScenario.options.map((opt) => (
              <div
                key={opt.id}
                className="option-card"
                onClick={() => handleOptionSelect(opt)}
              >
                <h3 className="option-name">{opt.name}</h3>
                <p className="option-description">{opt.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback stage */}
      {stage === 'feedback' && chosenOption && (
        <div className="feedback-screen fade-in">
          <h2 className="feedback-title">
            {chosenOption.isSafe ? 'Safer Choice' : 'Risky Move?'}
          </h2>
          <p className="feedback-text">{chosenOption.feedback}</p>
          <button className="next-button" onClick={handleNextScenario}>
            Continue
          </button>
        </div>
      )}

      {/* End stage */}
      {stage === 'end' && (
        <div className="end-screen fade-in">
          <h2 className="end-title">Reflection</h2>
          <p className="end-text">
            You’ve navigated through different trust scenarios. Sometimes a
            friendly face can hide a dangerous motive. At other times, a
            cautious approach can reveal genuine allies. Always weigh your
            instincts and confirm facts—awareness can be your strongest shield.
          </p>
          <button className="end-button" onClick={handleFinish}>
            Finish
          </button>
        </div>
      )}
    </div>
  );
};

export default WhoToTrustGame;
