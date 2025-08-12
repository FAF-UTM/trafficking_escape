import React, { useEffect, useState } from 'react';
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

/** Define a set of scenarios for the game (8 total) */
const allScenarios: TrustScenario[] = [
  {
    id: 1,
    scenarioTitle: 'DM: Compliments + Urgency',
    scenarioText:
      "Mary gets a late-night DM: “You’re amazing ✨ let’s meet tonight, no parents.” They insist it’s safe and urgent.",
    options: [
      {
        id: 1,
        name: 'Say no, block, and tell a trusted adult',
        description: 'Stop contact and get help now.',
        feedback:
          'Correct. Compliment-bombing + urgency + “no parents” are recruitment red flags. Refuse, block, and tell a trusted adult.',
        isSafe: true,
      },
      {
        id: 2,
        name: 'Agree but meet in a public place',
        description: 'Crowds make it safer, right?',
        feedback:
          'Unsafe. Traffickers exploit any meeting. Do not agree to meet at all.',
        isSafe: false,
      },
      {
        id: 3,
        name: 'Ask for their ID and keep chatting',
        description: 'Verify first.',
        feedback:
          'Risky. Continuing the chat increases manipulation risk. Stop and involve adults.',
        isSafe: false,
      },
    ],
  },
  {
    id: 2,
    scenarioTitle: 'Move to Private + “Quick Pic”',
    scenarioText:
      'They ask Mary to move to a private app and send a quick selfie “to prove trust.” They promise to keep it secret.',
    options: [
      {
        id: 1,
        name: 'Refuse, block, and tell a parent/teacher',
        description: 'No private apps, no pictures.',
        feedback:
          'Correct. Moving private + photo requests are grooming tactics used to gain leverage or blackmail.',
        isSafe: true,
      },
      {
        id: 2,
        name: 'Send a harmless selfie',
        description: 'It’s just a face pic.',
        feedback:
          'Unsafe. Any image can be misused. Do not send images to strangers.',
        isSafe: false,
      },
      {
        id: 3,
        name: 'Ask them for a selfie first',
        description: 'Make it fair.',
        feedback:
          'Unsafe. “Trading” images still fuels manipulation. End the conversation.',
        isSafe: false,
      },
    ],
  },
  {
    id: 3,
    scenarioTitle: 'Share Location + Ride Offer',
    scenarioText:
      'They ask for Mary’s live location 📍 and offer to pick her up 🚗 “for a quick trip.”',
    options: [
      {
        id: 1,
        name: 'Refuse, block, and tell a trusted adult',
        description: 'Protect your location.',
        feedback:
          'Correct. Requests for live location and rides are isolation tactics. Never share your pin or accept rides.',
        isSafe: true,
      },
      {
        id: 2,
        name: 'Share a nearby landmark instead',
        description: 'Close, not exact.',
        feedback:
          'Unsafe. Any location sharing can expose where Mary is. Decline and report.',
        isSafe: false,
      },
      {
        id: 3,
        name: 'Meet during the day with a friend',
        description: 'Daytime seems safer.',
        feedback:
          'Unsafe. Do not meet strangers for rides in any setting.',
        isSafe: false,
      },
    ],
  },
  {
    id: 4,
    scenarioTitle: '“Scout” With a Link',
    scenarioText:
      'A “model scout” sends Mary a link to fill out with personal details, saying “no cap” it’s legit and urgent.',
    options: [
      {
        id: 1,
        name: 'Verify with a parent/teacher and report the message',
        description: 'Check safely and report.',
        feedback:
          'Correct. Real opportunities do not pressure minors over DMs. Verification and reporting protect you and others.',
        isSafe: true,
      },
      {
        id: 2,
        name: 'Click and complete the form quickly',
        description: 'Don’t miss the chance!',
        feedback:
          'Unsafe. Links can steal data and pressure tactics indicate a scam/recruitment attempt.',
        isSafe: false,
      },
      {
        id: 3,
        name: 'Ignore silently and keep it to yourself',
        description: 'Avoid drama.',
        feedback:
          'Safer than engaging, but still tell a trusted adult so they can help keep you safe.',
        isSafe: true,
      },
    ],
  },
  {
    id: 5,
    scenarioTitle: 'Secret Party + Free Gifts',
    scenarioText:
      'A group invites Mary to a “secret party” 🎉 at night 🌙 with free gifts 🎁 and insists “no parents.”',
    options: [
      {
        id: 1,
        name: 'Refuse and tell a trusted adult immediately',
        description: 'Major red flags.',
        feedback:
          'Correct. Secrecy + gifts + night parties are classic lures. Refuse and inform adults.',
        isSafe: true,
      },
      {
        id: 2,
        name: 'Go but share live location with a friend',
        description: 'Try to be careful.',
        feedback:
          'Unsafe. Do not attend secret events from strangers. Live location does not remove the risk.',
        isSafe: false,
      },
      {
        id: 3,
        name: 'Ask for more details first',
        description: 'Gather info.',
        feedback:
          'Unsafe. Engaging further increases manipulation risk. End contact and tell adults.',
        isSafe: false,
      },
    ],
  },
  {
    id: 6,
    scenarioTitle: '“We Can Help Your Family”',
    scenarioText:
      'Someone says they can “help with money” if Mary shares bank details 💳 or meets to pick up cash now.',
    options: [
      {
        id: 1,
        name: 'Refuse, report, and tell a parent/teacher',
        description: 'Protect personal info.',
        feedback:
          'Correct. Financial “help” tied to personal data or urgent meetings is exploitation/scam risk. Report it.',
        isSafe: true,
      },
      {
        id: 2,
        name: 'Share a little info to test them',
        description: 'Just a bit.',
        feedback:
          'Unsafe. Any sharing can be abused or used for identity theft.',
        isSafe: false,
      },
      {
        id: 3,
        name: 'Meet in public to collect the gift',
        description: 'It’s free, right?',
        feedback:
          'Unsafe. Do not meet strangers for money or gifts.',
        isSafe: false,
      },
    ],
  },
  {
    id: 7,
    scenarioTitle: '“Just Between Us”',
    scenarioText:
      'They insist Mary keep everything secret 🤫 and delete chats to “avoid drama.”',
    options: [
      {
        id: 1,
        name: 'Refuse secrecy and tell a trusted adult',
        description: 'No secrets from safety adults.',
        feedback:
          'Correct. Secrecy protects predators. Trusted adults help keep you safe.',
        isSafe: true,
      },
      {
        id: 2,
        name: 'Agree to keep it private',
        description: 'It’s not a big deal.',
        feedback:
          'Unsafe. Secrecy allows harm to grow. Do not agree.',
        isSafe: false,
      },
      {
        id: 3,
        name: 'Ask why it must be secret and continue chatting',
        description: 'Understand first.',
        feedback:
          'Unsafe. Continued chatting increases risk. Stop and involve adults.',
        isSafe: false,
      },
    ],
  },
  {
    id: 8,
    scenarioTitle: 'Impersonation Risk',
    scenarioText:
      'An account claims to be a classmate and asks for personal details “to add you to a group.” Something feels off.',
    options: [
      {
        id: 1,
        name: 'Verify via known channels and tell a teacher/parent',
        description: 'Confirm identity safely.',
        feedback:
          'Correct. Impersonation is common. Verify through known contacts and inform adults.',
        isSafe: true,
      },
      {
        id: 2,
        name: 'Share your details to be friendly',
        description: 'It’s just a group.',
        feedback:
          'Unsafe. Do not share personal info with unverified accounts.',
        isSafe: false,
      },
      {
        id: 3,
        name: 'Ignore and keep it to yourself',
        description: 'Avoid drama.',
        feedback:
          'Safer than engaging, but still inform adults, especially if impersonation is suspected.',
        isSafe: true,
      },
    ],
  },
];

interface WhoToTrustGameProps {
  onComplete: () => void;
}

/**
 * A short decision-making game with randomized scenarios.
 */
const WhoToTrustGame: React.FC<WhoToTrustGameProps> = ({ onComplete }) => {
  // Stage can be "intro", "scenario", "feedback", "end"
  const [stage, setStage] = useState<'intro' | 'scenario' | 'feedback' | 'end'>('intro');
  // Selected (random) scenarios
  const [scenarios, setScenarios] = useState<TrustScenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chosenOption, setChosenOption] = useState<TrustOption | null>(null);

  useEffect(() => {
    const shuffled = [...allScenarios].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4).map((s) => ({
      ...s,
      options: [...s.options].sort(() => Math.random() - 0.5),
    }));
    setScenarios(selected);
  }, []);

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
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex((i) => i + 1);
      setChosenOption(null);
      setStage('scenario');
    } else {
      setStage('end');
    }
  };

  /** After final reflection, call onComplete to proceed */
  const handleFinish = () => {
    onComplete();
  };

  return (
    <div className="who-to-trust-container">
      {/* Intro modal */}
      {stage === 'intro' && (
        <div className="modal-overlay" onClick={handleStart}>
          <div className="modal-content intro" onClick={(e) => e.stopPropagation()}>
            <h2 className="intro-title">How to play</h2>
            <p className="intro-text">
              Mary is chatting online. Each scenario shows a choice. Pick the safest
              option that protects Mary and avoids manipulation.
            </p>
            <p className="intro-text">
              Look for red flags: secrecy, urgency, gifts, location requests, rides,
              and moving to private apps. (Click outside to start)
            </p>
          </div>
        </div>
      )}

      {/* Scenario stage */}
      {stage === 'scenario' && currentScenario && (
        <div className="scenario-screen fade-in">
          <h2 className="scenario-title">{currentScenario.scenarioTitle}</h2>
          <p className="scenario-text">{currentScenario.scenarioText}</p>
          <div className="options-container">
            {currentScenario.options.map((opt) => (
              <div key={opt.id} className="option-card" onClick={() => handleOptionSelect(opt)}>
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
          <h2 className="feedback-title">{chosenOption.isSafe ? 'Safer Choice' : 'Risky Move?'}</h2>
          <p className="feedback-text">{chosenOption.feedback}</p>
          <button className="next-button" onClick={handleNextScenario}>Continue</button>
        </div>
      )}

      {/* End stage */}
      {stage === 'end' && (
        <div className="end-screen fade-in">
          <h2 className="end-title">Reflection</h2>
          <p className="end-text">
            You’ve practiced weighing trust. If something feels off, protect your
            privacy, stop, and tell a trusted adult. Awareness keeps you safer.
          </p>
          <button className="end-button" onClick={handleFinish}>Finish</button>
        </div>
      )}
    </div>
  );
};

export default WhoToTrustGame;
