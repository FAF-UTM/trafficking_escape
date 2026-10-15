/* Context + hooks live together; fast-refresh warning is expected. */
/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';

interface MinigameChromeContextValue {
  /** Show the top-bar Exit only on the pre-play intro screen. */
  setShowPageExit: (show: boolean) => void;
}

const MinigameChromeContext = createContext<MinigameChromeContextValue | null>(
  null
);

export const MinigameChromeProvider: React.FC<{
  value: MinigameChromeContextValue;
  children: ReactNode;
}> = ({ value, children }) => (
  <MinigameChromeContext.Provider value={value}>
    {children}
  </MinigameChromeContext.Provider>
);

/** Call from a minigame with `true` on intro, `false` once play starts. */
export const useMinigameChrome = (): MinigameChromeContextValue => {
  const ctx = useContext(MinigameChromeContext);
  if (!ctx) {
    return { setShowPageExit: () => {} };
  }
  return ctx;
};

/** Keeps the page Exit button in sync with intro vs play. */
export const usePageExitOnIntro = (isIntro: boolean) => {
  const { setShowPageExit } = useMinigameChrome();
  useEffect(() => {
    setShowPageExit(isIntro);
    return () => setShowPageExit(false);
  }, [isIntro, setShowPageExit]);
};
