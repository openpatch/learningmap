---
name: "@learningmap/learningmap"
index: 1
---

# @learningmap/learningmap

The React package for integrating learning maps into your application.

## Installation

```bash
npm install @learningmap/learningmap
# or
pnpm add @learningmap/learningmap
# or
yarn add @learningmap/learningmap
```

## Components

### LearningMapEditor

An interactive editor for creating and editing learning maps with drag-and-drop functionality.

#### Basic Usage

```tsx
import { LearningMapEditor } from '@learningmap/learningmap';
import '@learningmap/learningmap/index.css';

function App() {
  return (
    <LearningMapEditor 
      language="en"
      jsonStore="https://json.openpatch.org"
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `roadmapData` | `string \| RoadmapData` | `undefined` | Initial roadmap data (JSON string or object) |
| `language` | `string` | `"en"` | UI language (`"en"` or `"de"`) |
| `jsonStore` | `string` | `"https://json.openpatch.org"` | URL for JSON storage service |
| `disableSharing` | `boolean` | `false` | Hide the share button (useful in environments without external sharing) |
| `disableFileOperations` | `boolean` | `false` | Hide open and download buttons (useful when file operations are handled externally) |

#### Features

- **Visual Editor**: Drag-and-drop interface for creating nodes
- **Node Types**: Topic, Task, Text, and Image nodes
- **Auto-Layout**: Automatic node positioning using ELK algorithm
- **Edge Management**: Connect nodes with customizable edges
- **Undo/Redo**: Full history support
- **Export/Import**: Save and load learning maps
- **Preview Mode**: Test the learner experience

### LearningMap

A viewer component for displaying and interacting with learning maps.

#### Basic Usage

```tsx
import { LearningMap } from '@learningmap/learningmap';
import type { RoadmapData, RoadmapState } from '@learningmap/learningmap';
import '@learningmap/learningmap/index.css';

function LearnView() {
  const roadmapData: RoadmapData = {
    nodes: [
      {
        id: '1',
        type: 'task',
        position: { x: 0, y: 0 },
        data: {
          state: 'unlocked',
          label: 'Introduction',
          description: 'Get started with the basics',
        }
      }
    ],
    edges: [],
    settings: {},
    version: 1,
  };

  const handleChange = (state: RoadmapState) => {
    console.log('State changed:', state);
    // Save state to your backend
  };

  return (
    <LearningMap
      roadmapData={roadmapData}
      language="en"
      onChange={handleChange}
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `roadmapData` | `string \| RoadmapData` | **required** | Roadmap data (JSON string or object) |
| `language` | `string` | `"en"` | UI language (`"en"` or `"de"`) |
| `onChange` | `(state: RoadmapState) => void` | `undefined` | Called when user completes nodes |
| `initialState` | `RoadmapState` | `undefined` | Initial state for node completion |

## Data Types

### RoadmapData

```typescript
interface RoadmapData {
  nodes: Node<NodeData>[];
  edges: Edge[];
  settings: Settings;
  version: number;
  type?: string;
  source?: string;
}
```

### NodeData

```typescript
interface NodeData {
  state: "locked" | "unlocked" | "started" | "completed" | "mastered";
  label: string;
  description?: string;
  duration?: string;
  unlock?: UnlockCondition;
  completion?: Completion;
  video?: string;
  resources?: Resource[];
  summary?: string;
  fontSize?: number;
}
```

### UnlockCondition

```typescript
interface UnlockCondition {
  after?: string[];      // IDs of nodes that must be completed first
  date?: string;         // ISO date when node becomes available
  password?: string;     // Password required to unlock
}
```

### Completion

```typescript
interface Completion {
  needs?: string[];      // IDs of nodes required for completion
  optional?: string[];   // IDs of optional prerequisite nodes
}
```

### Resource

```typescript
interface Resource {
  label: string;
  url?: string;
  type?: "url" | "book";
  bookName?: string;
  bookLocation?: string;
}
```

### Settings

```typescript
interface Settings {
  title?: string;
  id?: string;
  background?: BackgroundConfig;
  language?: string;
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  defaultEdgeType?: string;
  defaultEdgeColor?: string;
}
```

### RoadmapState

```typescript
interface RoadmapState {
  nodes: Record<string, { state: string }>;
  x: number;
  y: number;
  zoom: number;
}
```

## Hooks

### useEditorStore

Access the editor state and actions:

```typescript
import { useEditorStore } from '@learningmap/learningmap';

function MyComponent() {
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const addNode = useEditorStore(state => state.addNode);
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);
  
  // Use the state and actions...
}
```

### useViewerStore

Access the viewer state and actions:

```typescript
import { useViewerStore } from '@learningmap/learningmap';

function MyComponent() {
  const nodes = useViewerStore(state => state.nodes);
  const updateNodeState = useViewerStore(state => state.updateNodeState);
  
  // Use the state and actions...
}
```

### useTemporalStore

Access undo/redo functionality:

```typescript
import { useTemporalStore } from '@learningmap/learningmap';

function MyComponent() {
  const { undo, redo } = useTemporalStore();
  
  return (
    <>
      <button onClick={() => undo()}>Undo</button>
      <button onClick={() => redo()}>Redo</button>
    </>
  );
}
```

### useFileOperations

File import/export operations:

```typescript
import { useFileOperations } from '@learningmap/learningmap';

function MyComponent() {
  const { importFile, exportJSON, exportImage } = useFileOperations();
  
  return (
    <>
      <button onClick={importFile}>Import</button>
      <button onClick={exportJSON}>Export JSON</button>
      <button onClick={() => exportImage('png')}>Export PNG</button>
    </>
  );
}
```

## Examples

### Complete Editor Example

```tsx
import { useState } from 'react';
import { LearningMapEditor } from '@learningmap/learningmap';
import type { RoadmapData } from '@learningmap/learningmap';
import '@learningmap/learningmap/index.css';

function EditorPage() {
  const [roadmapData, setRoadmapData] = useState<RoadmapData | undefined>();
  
  return (
    <div style={{ height: '100vh' }}>
      <LearningMapEditor
        roadmapData={roadmapData}
        language="en"
        jsonStore="https://json.openpatch.org"
      />
    </div>
  );
}
```

### Complete Viewer Example

```tsx
import { useState, useEffect } from 'react';
import { LearningMap } from '@learningmap/learningmap';
import type { RoadmapData, RoadmapState } from '@learningmap/learningmap';
import '@learningmap/learningmap/index.css';

function ViewerPage() {
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [state, setState] = useState<RoadmapState | undefined>();
  
  useEffect(() => {
    // Load roadmap data from your API
    fetch('/api/roadmap/123')
      .then(r => r.json())
      .then(data => setRoadmapData(data));
      
    // Load saved state from your API
    fetch('/api/progress/123')
      .then(r => r.json())
      .then(progress => setState(progress));
  }, []);
  
  const handleStateChange = (newState: RoadmapState) => {
    setState(newState);
    // Save to your API
    fetch('/api/progress/123', {
      method: 'POST',
      body: JSON.stringify(newState),
    });
  };
  
  if (!roadmapData) return <div>Loading...</div>;
  
  return (
    <div style={{ height: '100vh' }}>
      <LearningMap
        roadmapData={roadmapData}
        language="en"
        onChange={handleStateChange}
        initialState={state}
      />
    </div>
  );
}
```

## Styling

The package includes default CSS styles. Import them in your application:

```tsx
import '@learningmap/learningmap/index.css';
```

You can customize the appearance by overriding CSS variables or adding your own styles.

## TypeScript Support

The package is written in TypeScript and includes type definitions. All types are exported for your use:

```typescript
import type {
  RoadmapData,
  RoadmapState,
  NodeData,
  Settings,
  Resource,
  UnlockCondition,
  Completion,
  LearningMapProps,
  LearningMapEditorProps,
} from '@learningmap/learningmap';
```
