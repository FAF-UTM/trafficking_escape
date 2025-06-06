import React, { useState, useEffect } from 'react';
import styles from './notification.module.css';

interface CharacterProps {
  isVisible: boolean;
  message?: string;
  from?: string;
}

const Notification: React.FC<CharacterProps> = ({ isVisible, message }) => {
  const [showNotification, setNotification] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setNotification(true);
    } else {
      setNotification(false);
    }
  }, [isVisible]);

  return (
    <div>
      <div>
        New notification from <b>{from}</b>
      </div>
    </div>
  );
};

export default Character;
