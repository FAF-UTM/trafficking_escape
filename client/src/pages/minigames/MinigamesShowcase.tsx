import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MinigamesShowcase.css';
import { useAudio } from '../../context/AudioContext.tsx';

interface Minigame {
  name: string;
  route: string;
  description: string;
}

const minigames: Minigame[] = [
  {
    name: 'Click Puzzle',
    route: '/click-play',
    description: 'Solve puzzles by discovering and using inventory items.',
  },
  {
    name: 'Timeline Puzzle',
    route: '/timeline-puzzle',
    description:
      'Arrange key events in the correct sequence to progress the story.',
  },
  {
    name: 'Emoji Story',
    route: '/emoji-story',
    description: 'Decode emoji stories and pick the right meaning.',
  },
  {
    name: 'Who to Trust',
    route: '/who-to-trust',
    description:
      'Decide whom to trust in tricky situations and learn about red flags.',
  },
  {
    name: 'Danger Words',
    route: '/danger-highlight',
    description: 'Spot red flag phrases in risky DMs.',
  },
  {
    name: 'Word Choice',
    route: '/word-choice',
    description: 'Complete sentences by choosing the correct word.',
  },
  {
    name: 'Word Scramble',
    route: '/word-scramble',
    description: 'Build safety words from letter tiles, then pick Mary’s move.',
  },
  {
    name: 'Flash Cards',
    route: '/true-false',
    description: 'Test your knowledge with quick fact-checking flashcards.',
  },
];

const MinigamesShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { playClick } = useAudio();

  return (
    <div className="minigames-container">
      <h1 className="minigames-title">Minigames Showcase</h1>
      <div className="minigames-list">
        {minigames.map((game, index) => (
          <div key={index} className="minigame-card">
            <h2 className="minigame-name">{game.name}</h2>
            <p className="minigame-description">{game.description}</p>
            <button
              className="play-button"
              onClick={() => {
                playClick(3);
                navigate(game.route);
              }}
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MinigamesShowcase;
