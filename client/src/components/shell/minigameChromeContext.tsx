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
  /** Show the floating top-right settings gear (hide when game embeds its own). */
  setShowSettings: (show: boolean) => void;
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

export const useMinigameChrome = (): MinigameChromeContextValue => {
  const ctx = useContext(MinigameChromeContext);
  if (!ctx) {
    return { setShowPageExit: () => {}, setShowSettings: () => {} };
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

/**
 * Hide floating chrome settings while `embedded` is true (game shows its own gear).
 * Restores on unmount / when embedded becomes false.
 */
export const useEmbeddedSettings = (embedded: boolean) => {
  const { setShowSettings } = useMinigameChrome();
  useEffect(() => {
    setShowSettings(!embedded);
    return () => setShowSettings(true);
  }, [embedded, setShowSettings]);
};
