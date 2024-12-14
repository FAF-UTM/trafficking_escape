import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dialogues } from './dialogues';
import './IntroStory.css';

const IntroStory: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const typingIntervalRef = useRef<number | null>(null);
    const navigate = useNavigate();

    const currentDialogue = dialogues[currentIndex];

    const startTyping = useCallback((fullText: string) => {
        setDisplayedText("");
        setIsTyping(true);
        let charIndex = -1;

        const step = () => {
            if (charIndex < fullText.length-1) {
                setDisplayedText(prev => prev + fullText[charIndex]);
                charIndex++;
                typingIntervalRef.current = window.setTimeout(step, 30);
            } else {
                setIsTyping(false);
            }
        };
        step();
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
            // If still typing, finish text immediately
            if (typingIntervalRef.current) {
                clearTimeout(typingIntervalRef.current);
            }
            setDisplayedText(currentDialogue.DialogueText);
            setIsTyping(false);
        } else {
            // If finished typing, move to next dialogue
            const nextIndex = currentIndex + 1;
            if (nextIndex < dialogues.length) {
                setCurrentIndex(nextIndex);
            } else {
                // If it's the last dialogue, redirect to "/chat"
                navigate('/chat');
            }
        }
    };

    // Determine character sprite opacities and visibility based on CharacterSettings
    let leftSpriteStyle: React.CSSProperties = { opacity: 0, visibility: 'hidden' };
    let rightSpriteStyle: React.CSSProperties = { opacity: 0, visibility: 'hidden' };

    let showNameBox = false;
    let nameBoxPosition: 'left'|'right' = 'left';

    if (currentDialogue) {
        const cs = currentDialogue.CharacterSettings;

        switch(cs) {
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
                // Only right sprite displayed
                rightSpriteStyle = { opacity: 1, visibility: 'visible' };
                break;
            case 'RightSpriteNotSpeaking':
                // Only left sprite displayed
                leftSpriteStyle = { opacity: 1, visibility: 'visible' };
                break;
            case 'NoSpritesSpeaking':
                // No sprites displayed
                break;
        }
    }

    // Camera shake effect
    const containerClass = currentDialogue?.VisualFX === 'CamShakeEffect' ? 'intro-container shake' : 'intro-container';

    return (
        <div className={containerClass} onClick={handleClick} style={{ backgroundImage: `url(${currentDialogue?.BgImage})` }}>
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
    <div className="dialogue-box">
        {displayedText}
        </div>
        </div>
        </div>
);
};

export default IntroStory;
