import './App.css'
import { LearningMapEditor, type LearningMapEditorProps } from '@learningmap/learningmap';
import "@learningmap/learningmap/index.css";
import { useEffect, useState } from 'react';

function App() {


  const [roadmapData, setRoadmapData] = useState<LearningMapEditorProps["roadmapData"] | undefined>(undefined);

  useEffect(() => {
    const savedState = localStorage.getItem("learningmap-editor-state");
    if (savedState) {
      const state = JSON.parse(savedState);
      setRoadmapData(state);
    }
  }, []);

  const handleChange: LearningMapEditorProps["onChange"] = (state) => {
    localStorage.setItem("learningmap-editor-state", JSON.stringify(state));
  }

  return (
    <LearningMapEditor onChange={handleChange} roadmapData={roadmapData} />
  )
}

export default App
