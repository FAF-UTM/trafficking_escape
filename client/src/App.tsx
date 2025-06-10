import './App.css';
import Platformer from './game/platformer/Platformer.tsx';
import Home from './pages/home/Home.tsx';
// import Chat from './chat/Chat.tsx';
import ChatWithMinigames from './chat/ChatWithMinigames.tsx';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import LoginPage from './pages/login/Login.tsx';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import IntroStory from './game/intro/IntroStory.tsx';
import './i18n';
import ClickPlayGame from './game/click-play/ClickPlayGame.tsx';
import TimelinePuzzle from './game/timeline/TimelinePuzzle.tsx';
import Settings from './pages/settings/Settings.tsx';
import CombinationLockWrapper from './game/combination_lock/CombinationLockWrapper.tsx';
import WhoToTrustGameWrapper from './game/who_to_trust_game/WhoToTrustGameWrapper.tsx';
import MinigamesShowcase from './pages/minigames/MinigamesShowcase.tsx';
import TrueFalseFlashCardsWrapper from './game/true_false_flash_cards/TrueFalseFlashCardsWrapper.tsx';
import WordChoiceWrapper from './game/word_choice_game/WordChoiceWrapper.tsx';
import EmojiStoryDecoderWrapper from './game/emoji_story_decoder/EmojiStoryDecoderWrapper.tsx';
import SafetyChecklistBuilderWrapper from './game/safety_checklist_builder/SafetyChecklistBuilderWrapper.tsx';
import DangerWordHighlightWrapper from './game/danger_word_highlight/DangerWordHighlightWrapper.tsx';
import { AudioProvider, useAudio } from './context/AudioContext';
import Ending from './pages/ending/Ending.tsx';
import Credentials from './pages/credentials/Credentials.tsx';
import Legal from './pages/legal/Legal.tsx';
import NotFound from './pages/notfound/NotFound.tsx';
import WordScrambleWrapper from './game/word_scramble_game/WordScrambleWrapper.tsx';

const imagesArray = [
  '/images/charaters/daughter.png',
  '/images/charaters/mom.png',
];

// Utility function to preload images
const preloadImages = (urls: string[]) => {
  const promises = urls.map((url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = resolve;
      img.onerror = reject;
    });
  });

  return Promise.all(promises);
};

function App() {
  useEffect(() => {
    const preloadAfterRender = () => {
      preloadImages(imagesArray)
        .then(() => {
          console.log('All images preloaded.');
        })
        .catch((err) => {
          console.error('Failed to preload images', err);
        });
    };

    // Use requestIdleCallback if available to delay preloading until the browser is idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloadAfterRender);
    } else {
      // Fallback to setTimeout if requestIdleCallback is unavailable
      setTimeout(preloadAfterRender, 100);
    }
  }, []);

  const BackgroundMusicStarter: React.FC = () => {
    const { playMusic } = useAudio();
    useEffect(() => {
      playMusic();
    }, [playMusic]);
    return null;
  };

  useEffect(() => {
    const cbm = localStorage.getItem('colorBlindMode') || 'none';
    document.documentElement.style.filter =
      cbm === 'none' ? 'none' : `url(#${cbm})`;
  }, []);

  return (
    <AuthProvider>
      <AudioProvider>
        <BrowserRouter>
          <BackgroundMusicStarter />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'absolute', width: 0, height: 0 }}
            aria-hidden="true"
          >
            <filter id="deuteranopia" colorInterpolationFilters="linearRGB">
              <feColorMatrix
                type="matrix"
                values="
        0.367  0.861 -0.228  0.000  0.000
        0.280  0.673  0.047  0.000  0.000
       -0.012  0.043  0.969  0.000  0.000
        0.000  0.000  0.000  1.000  0.000
      "
              />
            </filter>
            <filter id="protanopia" colorInterpolationFilters="linearRGB">
              <feColorMatrix
                type="matrix"
                values="
        0.567  0.433  0.000  0.000  0.000
        0.558  0.442  0.000  0.000  0.000
        0.000  0.242  0.758  0.000  0.000
        0.000  0.000  0.000  1.000  0.000
      "
              />
            </filter>
            <filter id="tritanopia" colorInterpolationFilters="linearRGB">
              <feColorMatrix
                type="matrix"
                values="
        0.950  0.050  0.000  0.000  0.000
        0.000  0.433  0.567  0.000  0.000
        0.000  0.475  0.525  0.000  0.000
        0.000  0.000  0.000  1.000  0.000
      "
              />
            </filter>
            <filter id="achromatopsia" colorInterpolationFilters="linearRGB">
              <feColorMatrix
                type="matrix"
                values="
        0.299 0.587 0.114 0 0
        0.299 0.587 0.114 0 0
        0.299 0.587 0.114 0 0
        0     0     0     1 0
      "
              />
            </filter>
          </svg>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/intro" element={<IntroStory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/mini-games" element={<MinigamesShowcase />} />
            <Route
              path="/chat"
              element={
                <ProtectedRoute roles={['ROLE_USER', 'ROLE_ADMIN']}>
                  {/*<Chat />*/}
                  <ChatWithMinigames />
                </ProtectedRoute>
              }
            />
            <Route path="/click-play" element={<ClickPlayGame />} />
            <Route path="/city-run" element={<Platformer />} />
            <Route path="/timeline-puzzle" element={<TimelinePuzzle />} />
            <Route
              path="/combination-lock"
              element={<CombinationLockWrapper />}
            />
            <Route path="/who-to-trust" element={<WhoToTrustGameWrapper />} />
            <Route
              path="/true-false"
              element={<TrueFalseFlashCardsWrapper />}
            />
            <Route path="/word-choice" element={<WordChoiceWrapper />} />
            <Route path="/emoji-story" element={<EmojiStoryDecoderWrapper />} />
            <Route
              path="/safety-checklist"
              element={<SafetyChecklistBuilderWrapper />}
            />
            <Route
              path="/danger-highlight"
              element={<DangerWordHighlightWrapper />}
            />
            <Route path="/ending" element={<Ending />} />
            <Route path="/word-scramble" element={<WordScrambleWrapper />} />
            <Route path="/credentials" element={<Credentials />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
