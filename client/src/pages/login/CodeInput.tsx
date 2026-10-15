import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './login.module.css';

const LENGTH = 6;
const ALLOWED = /[A-Z0-9]/;

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

/** Six single-character boxes for an access code; accepts typing, pasting and backspace. */
const CodeInput: React.FC<CodeInputProps> = ({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  describedBy,
}) => {
  const { t } = useTranslation();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.padEnd(LENGTH, ' ').slice(0, LENGTH).split('');

  const focus = (index: number) =>
    refs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();

  const write = (start: number, input: string) => {
    const clean = input
      .toUpperCase()
      .split('')
      .filter((c) => ALLOWED.test(c));
    if (clean.length === 0) return;
    const next = chars.slice();
    clean.slice(0, LENGTH - start).forEach((c, i) => (next[start + i] = c));
    const joined = next.join('').replace(/\s+$/, '');
    onChange(joined);
    const filled = Math.min(LENGTH, start + clean.length);
    focus(filled);
    if (joined.length === LENGTH && !joined.includes(' ')) onComplete(joined);
  };

  const handleKeyDown =
    (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const next = chars.slice();
        const target = chars[index] !== ' ' ? index : index - 1;
        if (target < 0) return;
        next[target] = ' ';
        onChange(next.join('').replace(/\s+$/, ''));
        focus(target);
      } else if (e.key === 'ArrowLeft') {
        focus(index - 1);
      } else if (e.key === 'ArrowRight') {
        focus(index + 1);
      }
    };

  return (
    <div className={styles.codeBoxes} data-invalid={invalid || undefined}>
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={styles.codeBox}
          value={c.trim()}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          spellCheck={false}
          maxLength={LENGTH}
          disabled={disabled}
          aria-label={t('login.codeLabel', { n: i + 1 })}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onFocus={(e) => e.target.select()}
          onKeyDown={handleKeyDown(i)}
          onChange={(e) =>
            write(i, e.target.value.replace(c.trim(), '') || e.target.value)
          }
          onPaste={(e) => {
            e.preventDefault();
            write(i, e.clipboardData.getData('text'));
          }}
        />
      ))}
    </div>
  );
};

export default CodeInput;
