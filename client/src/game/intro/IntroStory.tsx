import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dialogues } from './dialogues';
import './IntroStory.css';
import {useAudio} from '../../context/AudioContext.tsx';

const IntroStory: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingIntervalRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { changeMusic, playMusic } = useAudio();

  const currentDialogue = dialogues[currentIndex];

  const startTyping = useCallback((fullText: string) => {
    setDisplayedText('');
    setIsTyping(true);
    let charIndex = -1;

    const step = () => {
      if (charIndex < fullText.length - 1) {
        setDisplayedText((prev) => prev + fullText[charIndex]);
        charIndex++;
        typingIntervalRef.current = window.setTimeout(step, 30);
      } else {
        setIsTyping(false);
      }
    };
    step();
  }, []);

  useEffect(() => {
    changeMusic(6);
    playMusic();
  }, []);


  useEffect(() => {
    if (currentDialogue) {
      startTyping(currentDialogue.DialogueText);
    }
    return () => {
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current);
      }
    };
  }, [currentDialogue, startTyping]);

  const handleClick = () => {
    if (isTyping) {
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current);
      }
      setDisplayedText(currentDialogue.DialogueText);
      setIsTyping(false);
    } else {
      const nextIndex = currentIndex + 1;
      if (nextIndex < dialogues.length) {
        setCurrentIndex(nextIndex);
      } else {
        navigate('/chat');
      }
    }
  };

  let leftSpriteStyle: React.CSSProperties = {
    opacity: 0,
    visibility: 'hidden',
  };
  let rightSpriteStyle: React.CSSProperties = {
    opacity: 0,
    visibility: 'hidden',
  };

  let showNameBox = false;
  let nameBoxPosition: 'left' | 'right' = 'left';

  if (currentDialogue) {
    const cs = currentDialogue.CharacterSettings;

    switch (cs) {
      case 'LeftSpriteSpeaking':
        leftSpriteStyle = { opacity: 1, visibility: 'visible' };
        rightSpriteStyle = { opacity: 0.8, visibility: 'visible' };
        showNameBox = true;
        nameBoxPosition = 'left';
        break;
      case 'RightSpriteSpeaking':
        leftSpriteStyle = { opacity: 0.8, visibility: 'visible' };
        rightSpriteStyle = { opacity: 1, visibility: 'visible' };
        showNameBox = true;
        nameBoxPosition = 'right';
        break;
      case 'LeftSpriteNotSpeaking':
        rightSpriteStyle = { opacity: 1, visibility: 'visible' };
        break;
      case 'RightSpriteNotSpeaking':
        leftSpriteStyle = { opacity: 1, visibility: 'visible' };
        break;
      case 'NoSpritesSpeaking':
        break;
    }
  }

  const containerClass =
    currentDialogue?.VisualFX === 'CamShakeEffect'
      ? 'intro-container shake'
      : 'intro-container';

  return (
    <div
      className={containerClass}
      onClick={handleClick}
      style={{ backgroundImage: `url(${currentDialogue?.BgImage})` }}
    >
      <div
        className="skip-intro"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/chat');
        }}
      >
        Skip Intro
      </div>
      <div className="sprites-container">
        {currentDialogue?.LeftSpriteImage && (
          <img
            src={currentDialogue.LeftSpriteImage}
            alt="Left Character"
            className="left-sprite"
            style={leftSpriteStyle}
          />
        )}
        {currentDialogue?.RightSpriteImage && (
          <img
            src={currentDialogue.RightSpriteImage}
            alt="Right Character"
            className="right-sprite"
            style={rightSpriteStyle}
          />
        )}
      </div>

      <div className="dialogue-container">
        {showNameBox && (
          <div className={`name-box ${nameBoxPosition}`}>
            {currentDialogue?.CharacterName}
          </div>
        )}
        <div className="dialogue-box">{displayedText}</div>
      </div>
    </div>
  );
};

export default IntroStory;
