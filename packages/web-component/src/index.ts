import r2wc from "@r2wc/react-to-web-component";
import { LearningMap, LearningMapEditor } from "@learningmap/learningmap";
import "@learningmap/learningmap/index.css";

const LearningmapWC = r2wc(LearningMap, {
  props: {
    roadmapData: "string",
    language: "string",
    onChange: "function",
    initialState: "json",
  },
  events: {
    change: true,
  },
});

customElements.define("hyperbook-learningmap", LearningmapWC);

const LearningmapEditorWC = r2wc(LearningMapEditor, {
  props: {
    roadmapData: "string",
    language: "string",
    onChange: "function",
  },
  events: {
    change: true,
  },
});

customElements.define("hyperbook-learningmap-editor", LearningmapEditorWC);
