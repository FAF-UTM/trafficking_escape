import React from 'react';
import styles from './Character.module.css';

interface CharacterProps {
    isVisible: boolean;
    character: string;
    altText?: string;
    type: 'left' | 'right';
    message?:string;
}

const Character: React.FC<CharacterProps> = ({ isVisible, character, altText,message, type }) => {
    console.log('Props:', { isVisible, character, altText, type, message }); // Debugging
    return (
        <div
            className={`${styles.character} ${
                isVisible ? (type === 'left' ? styles.character_show_left : styles.character_show_right) : ''
            } ${type === 'right' ? styles.character_right : styles.character_left}`}
        >
            {message && (
                <div
                    className={`${styles.character_message} ${
                        styles[`character_message_${character}`] || ''
                    }`}
                >
                    {message}
                </div>
            )}
            {
                character === 'mom' ?
                    <img  id={styles[`character_img_${character}`]} src='/images/charaters/mom.png' alt={altText || 'character'}/>:
            character === 'daughter' ?
                    <img  id={styles[`character_img_${character}`]} src='/images/charaters/daughter.png' alt={altText || 'character'}/>:
           ''

        }
        </div>
    );
};

export default Character;
