import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import styles from './ClickPlayGame.module.css';

interface CodePadProps {
  title: string;
  length: number;
  error: string | null;
  onSubmit: (code: string) => void;
  onClose: () => void;
}

const CodePad: React.FC<CodePadProps> = ({
  title,
  length,
  error,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();
  const [digits, setDigits] = useState('');

  const push = (d: string) => {
    setDigits((prev) => (prev.length >= length ? prev : prev + d));
  };

  const back = () => setDigits((prev) => prev.slice(0, -1));

  const submit = () => {
    if (digits.length !== length) return;
    onSubmit(digits);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.modalClose}
          aria-label={t('clickPuzzle.close')}
          onClick={onClose}
        >
          <CloseRoundedIcon fontSize="small" />
        </button>
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.padDisplay} aria-live="polite">
          {digits.padEnd(length, '·')}
        </p>
        <p className={styles.errorFlash}>{error ?? ''}</p>
        <div className={styles.padGrid}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].map(
            (key) => (
              <button
                key={key}
                type="button"
                className={styles.padKey}
                onClick={() => {
                  if (key === '⌫') back();
                  else if (key === 'OK') submit();
                  else push(key);
                }}
              >
                {key === 'OK' ? t('clickPuzzle.padEnter') : key}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CodePad;
