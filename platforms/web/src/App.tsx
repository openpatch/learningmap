import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LearningMapEditor } from '@learningmap/learningmap';
import "@learningmap/learningmap/index.css";
import Learn from './Learn';
import Landing from './Landing';
import ReloadPrompt from './ReloadPrompt';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<LearningMapEditor jsonStore="https://json.openpatch.org" />} />
        <Route path="/learn" element={<Learn />} />
      </Routes>
      <ReloadPrompt />
    </BrowserRouter>
  )
}

export default App
