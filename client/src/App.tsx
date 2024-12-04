import './App.css'
import Platformer from "./platformer/Platformer.tsx";
import Home from "./game/Home.tsx";
import {
    BrowserRouter,
    Routes,
    Route,
} from 'react-router-dom';

function App() {


  return (
    <>
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/city-run" element={<Platformer />} />
      </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
