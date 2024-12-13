import './App.css';
import Platformer from './platformer/Platformer.tsx';
import Home from './game/home/Home.tsx';
import Chat from './chat/Chat.tsx';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import LoginPage from "./pages/Login.tsx";
import { AuthProvider, ProtectedRoute } from "./context/AuthContext";

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

  return (
      <>
          <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route
                path="/chat"
                element={
                    <ProtectedRoute roles={["ROLE_USER", "ROLE_ADMIN"]}>
                    <Chat />
                  </ProtectedRoute>
                }
            />
            <Route
                path="/city-run"
                element={
                    <ProtectedRoute roles={["ROLE_USER", "ROLE_ADMIN"]}>
                    <Platformer />
                  </ProtectedRoute>
                }
            />
          </Routes>
        </BrowserRouter>
          </AuthProvider>
      </>
  );
}

export default App;
