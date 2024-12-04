import './App.css';
import Platformer from './platformer/Platformer.tsx';
import Home from './game/home/Home.tsx';
import Chat from './chat/Chat.tsx';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/city-run" element={<Platformer />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
