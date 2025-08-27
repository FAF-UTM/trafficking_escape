import React, { useState, useEffect, useMemo, useRef } from 'react';
import Chat from './Chat.tsx';
import TimelinePuzzle from '../game/timeline/TimelinePuzzle.tsx';
import CombinationLock from '../game/combination_lock/CombinationLock.tsx';
import DangerWordHighlight from '../game/danger_word_highlight/DangerWordHighlight.tsx';
import EmojiStoryDecoder from '../game/emoji_story_decoder/EmojiStoryDecoder.tsx';
import SafetyChecklistBuilder from '../game/safety_checklist_builder/SafetyChecklistBuilder.tsx';
import TrueFalseFlashCards from '../game/true_false_flash_cards/TrueFalseFlashCards.tsx';
import WhoToTrustGame from '../game/who_to_trust_game/WhoToTrustGame.tsx';
import WordChoiceGame from '../game/word_choice_game/WordChoiceGame.tsx';
import WordScrambleGame from '../game/word_scramble_game/WordScrambleGame.tsx';
import styles from './chat.module.css';
import transition from './ScreenTransition.module.css';
import { useAudio } from '../context/AudioContext';
import '../index.css';
import ClickPlayGame from '../game/click-play/ClickPlayGame.tsx';

const games = [
  TimelinePuzzle,
  ClickPlayGame,
  CombinationLock,
  DangerWordHighlight,
  EmojiStoryDecoder,
  SafetyChecklistBuilder,
  TrueFalseFlashCards,
  WhoToTrustGame,
  WordChoiceGame,
  WordScrambleGame,
];

const DEFAULT_INTERVAL = 5; // minutes

const ChatWithMinigames: React.FC = () => {
  const { playClick, changeMusic } = useAudio();
  const [currentGame, setCurrentGame] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [transitionClass, setTransitionClass] = useState<string>('');
  const gameStartRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [intervalMinutes] = useState(() => {
    const stored = localStorage.getItem('minigameInterval');
    return stored ? parseFloat(stored) : DEFAULT_INTERVAL;
  });

  useEffect(() => {
    const id = setTimeout(
      () => {
        setTransitionClass(transition.close);
        playClick(9);
        setTimeout(() => {
          changeMusic(1);
          setShowGame(true);
          setTransitionClass('');
          gameStartRef.current = Date.now();
        }, 600);
      },
      intervalMinutes * 60 * 1000
    );
    return () => clearTimeout(id);
  }, [currentGame, intervalMinutes, playClick, changeMusic]);

  const postSession = (name: string, seconds: number) => {
    const base =
      import.meta.env.VITE_BACKEND ||
      `${window.location.protocol}//${window.location.hostname}:8080`;
    const url = `${base}/api/v1/gameplay`;
    const payload = { gameName: name, totalSeconds: Math.max(0, Math.round(seconds)) };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (!navigator.sendBeacon || !navigator.sendBeacon(url, blob)) {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  };

  const gameNames = [
    'TimelinePuzzle',
    'ClickPuzzle',
    'CombinationLock',
    'DangerWordHighlight',
    'EmojiStoryDecoder',
    'SafetyChecklistBuilder',
    'TrueFalseFlashCards',
    'WhoToTrust',
    'WordChoice',
    'WordScramble',
  ];

  const handleComplete = () => {
    playClick(9);
    setTransitionClass(transition.close);
    setTimeout(() => {
      changeMusic(2);
      if (gameStartRef.current) {
        const seconds = (Date.now() - gameStartRef.current) / 1000;
        postSession(gameNames[currentGame], seconds);
        gameStartRef.current = null;
      }
      setShowGame(false);
      setCurrentGame((prev) => (prev + 1) % games.length);
      setTransitionClass(transition.open);
      setTimeout(() => setTransitionClass(''), 600);
    }, 600);
  };

  const GameComponent = useMemo(() => games[currentGame], [currentGame]);

  return (
    <div className={styles.chat_wrap}>
      {transitionClass && (
        <div className={`${transition.screen} ${transitionClass}`}></div>
      )}
      {!showGame && <Chat />}
      {showGame && <GameComponent onComplete={handleComplete} />}
    </div>
  );
};

export default ChatWithMinigames;
