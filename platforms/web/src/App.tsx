import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LearningMapEditor } from '@learningmap/learningmap';
import "@learningmap/learningmap/index.css";
import Learn from './Learn';
import Landing from './Landing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<LearningMapEditor jsonStore="https://json.openpatch.org" />} />
        <Route path="/learn" element={<Learn />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
