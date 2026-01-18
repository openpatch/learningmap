import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@learningmap/learningmap/index.css";
import Learn from "./Learn";
import Teach from "./Teach";
import Landing from "./Landing";
import ReloadPrompt from "./ReloadPrompt";
import { TeacherEditor } from "./TeacherEditor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<TeacherEditor />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/teach" element={<Teach />} />
      </Routes>
      <ReloadPrompt />
    </BrowserRouter>
  );
}

export default App;
