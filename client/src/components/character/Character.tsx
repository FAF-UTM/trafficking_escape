import React, { useState, useEffect } from 'react';
import styles from './Character.module.css';

interface CharacterProps {
  isVisible: boolean;
  character: string;
  altText?: string;
  position: 'left' | 'right';
  message?: string;
}

const Character: React.FC<CharacterProps> = ({
  isVisible,
  character,
  altText,
  message,
  position,
}) => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (isVisible) {
      timeout = setTimeout(() => {
        setShowMessage(true);
      }, 1000); // Delay message appearance by 2.2 seconds
    } else {
      setShowMessage(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout); // Cleanup timeout on unmount or prop change
    };
  }, [isVisible]);

  return (
    <div
      className={`${styles.character} ${
        isVisible
          ? position === 'left'
            ? styles.character_show_left
            : styles.character_show_right
          : ''
      } ${position === 'right' ? styles.character_right : styles.character_left}`}
    >
      {message && (
        <div
          id={`${styles[`character_message_${character}`] || ''}`}
          className={`${styles.character_message} ${
            showMessage ? styles.message_visible : styles.message_hidden
          } ${styles[`character_message_${character}`] || ''} `}
        >
          {message}
        </div>
      )}
      {character === 'mom' ? (
        <img
          id={styles[`character_img_${character}`]}
          src="/images/charaters/mom.png"
          alt={altText || 'character'}
        />
      ) : character === 'daughter' ? (
        <img
          id={styles[`character_img_${character}`]}
          src="/images/charaters/daughter.png"
          alt={altText || 'character'}
        />
      ) : (
        ''
      )}
    </div>
  );
};

export default Character;
