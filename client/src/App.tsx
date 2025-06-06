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
import WordScrambleWrapper from './game/word_scramble_game/WordScrambleWrapper.tsx';
import { AudioProvider, useAudio } from './context/AudioContext';

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

  return (
    <AuthProvider>
      <AudioProvider>
        <BrowserRouter>
          <BackgroundMusicStarter />
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
            <Route path="/word-scramble" element={<WordScrambleWrapper />} />
          </Routes>
        </BrowserRouter>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
