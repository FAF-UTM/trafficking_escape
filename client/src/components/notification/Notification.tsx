import React from 'react';
import styles from './notification.module.css';

interface CharacterProps {
  isVisible: boolean;
  message?: string;
  from?: string;
}

const Notification: React.FC<CharacterProps> = ({
  isVisible,
  message,
  from,
}) => {
  return (
    <div
      className={`${styles.notification} ${isVisible && styles.notification_show}`}
    >
      <div className={styles.notification_small_text}>
        New notification from <b>{from}</b>
      </div>
      <div className={styles.notification_text}>{message}</div>
      <div className={styles.notification_time}>12:00 AM</div>
    </div>
  );
};

export default Notification;
