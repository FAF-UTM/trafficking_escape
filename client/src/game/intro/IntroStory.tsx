import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dialogues as rawDialogues, RawDialogue } from './dialogues';
import './IntroStory.css';
import { useAudio } from '../../context/AudioContext';

type Dialogue = Omit<RawDialogue, 'CharacterName'> & {
  CharacterName: string;
  DialogueText: string;
};

const IntroStory: React.FC = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingIntervalRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { changeMusic, playMusic } = useAudio();

  const dialogues: Dialogue[] = useMemo(
    () =>
      rawDialogues.map((d) => ({
        ...d,
        CharacterName: d.CharacterName
          ? t(`dialogues.${d.DialogueNumber}.CharacterName`)
          : '',
        DialogueText: t(`dialogues.${d.DialogueNumber}.DialogueText`),
      })),
    [t]
  );

  const currentDialogue = dialogues[currentIndex];

  const startTyping = useCallback((fullText: string) => {
    setDisplayedText('');
    setIsTyping(true);
    let charIndex = 0;
    const step = () => {
      if (charIndex < fullText.length) {
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
    changeMusic(5);
    playMusic();
  }, [changeMusic, playMusic]);

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
      const next = currentIndex + 1;
      if (next < dialogues.length) {
        setCurrentIndex(next);
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
    switch (currentDialogue.CharacterSettings) {
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
      default:
        break;
    }
  }

  const containerClass =
    currentDialogue.VisualFX === 'CamShakeEffect'
      ? 'intro-container shake'
      : 'intro-container';

  return (
    <div
      className={containerClass}
      onClick={handleClick}
      style={{ backgroundImage: `url(${currentDialogue.BgImage})` }}
    >
      <div
        className="skip-intro"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/chat');
        }}
      >
        {t('intro.skip')}
      </div>

      <div className="sprites-container">
        {currentDialogue.LeftSpriteImage && (
          <img
            src={currentDialogue.LeftSpriteImage}
            alt="Left Character"
            className="left-sprite"
            style={leftSpriteStyle}
          />
        )}
        {currentDialogue.RightSpriteImage && (
          <img
            src={currentDialogue.RightSpriteImage}
            alt="Right Character"
            className="right-sprite"
            style={rightSpriteStyle}
          />
        )}
      </div>

      <div className="dialogue-container">
        {showNameBox && currentDialogue.CharacterName && (
          <div className={`name-box ${nameBoxPosition}`}>
            {currentDialogue.CharacterName}
          </div>
        )}
        <div className="dialogue-box">{displayedText}</div>
      </div>
    </div>
  );
};

export default IntroStory;
