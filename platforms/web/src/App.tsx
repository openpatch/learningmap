import './App.css'
import { LearningMapEditor } from '@learningmap/learningmap';
import "@learningmap/learningmap/index.css";

function App() {

  return (
    <LearningMapEditor
      jsonStore="https://json.openpatch.org"
    />
  )
}

export default App
