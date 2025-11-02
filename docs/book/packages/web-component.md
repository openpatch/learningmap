---
name: "@learningmap/web-component"
index: 2
---

# @learningmap/web-component

A framework-agnostic web component for integrating learning maps into any web application.

## Installation

### Via npm

```bash
npm install @learningmap/web-component
# or
pnpm add @learningmap/web-component
# or
yarn add @learningmap/web-component
```

### Via CDN

```html
<script src="https://unpkg.com/@learningmap/web-component"></script>
<link rel="stylesheet" href="https://unpkg.com/@learningmap/web-component/dist/web-component.css">
```

## Usage

### Basic Editor

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@learningmap/web-component/dist/web-component.css">
  <script src="https://unpkg.com/@learningmap/web-component"></script>
</head>
<body>
  <hyperbook-learningmap-editor
    language="en"
    roadmap-data='{"nodes": [], "edges": [], "settings": {}, "version": 1}'
  ></hyperbook-learningmap-editor>

  <script>
    const editor = document.querySelector('hyperbook-learningmap-editor');
    
    editor.addEventListener('change', (event) => {
      const roadmapData = event.detail;
      console.log('Roadmap saved:', roadmapData);
      // Save to your backend
    });
  </script>
</body>
</html>
```

### Basic Viewer

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@learningmap/web-component/dist/web-component.css">
  <script src="https://unpkg.com/@learningmap/web-component"></script>
</head>
<body>
  <hyperbook-learningmap
    language="en"
    roadmap-data='{"nodes": [...], "edges": [...], "settings": {}, "version": 1}'
  ></hyperbook-learningmap>

  <script>
    const viewer = document.querySelector('hyperbook-learningmap');
    
    viewer.addEventListener('change', (event) => {
      const state = event.detail;
      console.log('Progress updated:', state);
      // Save progress to your backend
    });
  </script>
</body>
</html>
```

## Components

### `<hyperbook-learningmap-editor>`

Interactive editor for creating and editing learning maps.

#### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `roadmap-data` | `string` | `undefined` | JSON string of roadmap data |
| `language` | `string` | `"en"` | UI language (`"en"` or `"de"`) |
| `json-store` | `string` | `"https://json.openpatch.org"` | URL for JSON storage service |
| `disable-sharing` | `boolean` | `false` | Hide the share button (useful in environments without external sharing) |
| `disable-file-operations` | `boolean` | `false` | Hide open and download buttons (useful when file operations are handled externally) |
| `key-bindings` | `string` | `undefined` | JSON string of custom keyboard shortcuts (see React docs for KeyBindings type) |

#### Customizing Keyboard Shortcuts

You can customize keyboard shortcuts by passing a JSON string to the `key-bindings` attribute:

```html
<hyperbook-learningmap-editor
  key-bindings='{"save": null, "addTaskNode": {"key": "t", "ctrl": true}}'
></hyperbook-learningmap-editor>
```

This example disables the save shortcut and changes the "add task" shortcut from `Ctrl+1` to `Ctrl+T`. See the React package documentation for a complete list of available shortcuts and the KeyBindings type definition.

#### Events

**`change`** - Fired when the user clicks the Save button

```javascript
editor.addEventListener('change', (event) => {
  const roadmapData = event.detail;
  // roadmapData: { nodes, edges, settings, version }
});
```

### `<hyperbook-learningmap>`

Viewer for displaying and interacting with learning maps.

#### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `roadmap-data` | `string` | **required** | JSON string of roadmap data |
| `language` | `string` | `"en"` | UI language (`"en"` or `"de"`) |
| `initial-state` | `string` | `undefined` | JSON string of initial progress state |

#### Events

**`change`** - Fired when the user completes or updates a node

```javascript
viewer.addEventListener('change', (event) => {
  const state = event.detail;
  // state: { nodes: {...}, x, y, zoom }
});
```

## Data Format

### Roadmap Data

```json
{
  "nodes": [
    {
      "id": "node1",
      "type": "task",
      "position": { "x": 0, "y": 0 },
      "data": {
        "state": "unlocked",
        "label": "Introduction",
        "description": "Learn the basics",
        "duration": "30 min",
        "resources": [
          {
            "label": "Documentation",
            "url": "https://example.com"
          }
        ],
        "unlock": {
          "password": "secret",
          "date": "2024-01-01",
          "after": ["node0"]
        },
        "completion": {
          "needs": ["node0"],
          "optional": ["node2"]
        }
      }
    },
    {
      "id": "node2",
      "type": "topic",
      "position": { "x": 200, "y": 0 },
      "data": {
        "state": "locked",
        "label": "Advanced Topics",
        "description": "Deep dive into advanced concepts"
      }
    }
  ],
  "edges": [
    {
      "id": "edge1",
      "source": "node1",
      "target": "node2"
    }
  ],
  "settings": {
    "title": "My Learning Path",
    "language": "en",
    "background": {
      "color": "#ffffff"
    }
  },
  "version": 1
}
```

### Node Types

#### Task Node
Represents an actionable learning task.

```json
{
  "id": "task1",
  "type": "task",
  "position": { "x": 0, "y": 0 },
  "data": {
    "state": "unlocked",
    "label": "Complete Exercise",
    "description": "Practice what you learned",
    "duration": "15 min"
  }
}
```

#### Topic Node
Represents a learning topic or module.

```json
{
  "id": "topic1",
  "type": "topic",
  "position": { "x": 200, "y": 0 },
  "data": {
    "state": "unlocked",
    "label": "JavaScript Basics",
    "description": "Learn the fundamentals"
  }
}
```

#### Text Node
Adds text annotations to the map.

```json
{
  "id": "text1",
  "type": "text",
  "position": { "x": 100, "y": 100 },
  "data": {
    "text": "Start here!",
    "fontSize": 16,
    "color": "#000000"
  }
}
```

#### Image Node
Adds images as background elements.

```json
{
  "id": "image1",
  "type": "image",
  "position": { "x": 0, "y": 0 },
  "data": {
    "data": "data:image/png;base64,...",
    "caption": "Example diagram"
  }
}
```

### Node States

- `"locked"` - Node is not yet accessible
- `"unlocked"` - Node is accessible but not started
- `"started"` - User has begun the node
- `"completed"` - User has completed the node
- `"mastered"` - User has mastered the node

### Unlock Conditions

Control when nodes become available:

```json
{
  "unlock": {
    "after": ["node1", "node2"],  // Requires these nodes to be completed
    "date": "2024-12-01",          // Available from this date
    "password": "secret123"        // Requires password to unlock
  }
}
```

### Completion Rules

Define completion requirements:

```json
{
  "completion": {
    "needs": ["node1"],      // Must complete these nodes
    "optional": ["node2"]    // Optional prerequisite nodes
  }
}
```

### Resources

Add learning resources to nodes:

```json
{
  "resources": [
    {
      "label": "Documentation",
      "url": "https://example.com",
      "type": "url"
    },
    {
      "label": "Chapter 5",
      "type": "book",
      "bookName": "Programming Guide",
      "bookLocation": "Page 42"
    }
  ]
}
```

## Framework Integration

### Vue.js

```vue
<template>
  <hyperbook-learningmap-editor
    :roadmap-data="roadmapDataJson"
    language="en"
    @change="handleChange"
  />
</template>

<script>
import '@learningmap/web-component';
import '@learningmap/web-component/dist/web-component.css';

export default {
  data() {
    return {
      roadmapData: { nodes: [], edges: [], settings: {}, version: 1 }
    };
  },
  computed: {
    roadmapDataJson() {
      return JSON.stringify(this.roadmapData);
    }
  },
  methods: {
    handleChange(event) {
      this.roadmapData = event.detail;
    }
  }
};
</script>
```

### Angular

```typescript
import { Component, OnInit } from '@angular/core';
import '@learningmap/web-component';
import '@learningmap/web-component/dist/web-component.css';

@Component({
  selector: 'app-learningmap',
  template: `
    <hyperbook-learningmap-editor
      [attr.roadmap-data]="roadmapDataJson"
      language="en"
      (change)="handleChange($event)"
    ></hyperbook-learningmap-editor>
  `
})
export class LearningmapComponent implements OnInit {
  roadmapData = { nodes: [], edges: [], settings: {}, version: 1 };
  
  get roadmapDataJson() {
    return JSON.stringify(this.roadmapData);
  }
  
  handleChange(event: CustomEvent) {
    this.roadmapData = event.detail;
  }
}
```

### Svelte

```svelte
<script>
  import { onMount } from 'svelte';
  import '@learningmap/web-component';
  import '@learningmap/web-component/dist/web-component.css';
  
  let roadmapData = { nodes: [], edges: [], settings: {}, version: 1 };
  
  function handleChange(event) {
    roadmapData = event.detail;
  }
</script>

<hyperbook-learningmap-editor
  roadmap-data={JSON.stringify(roadmapData)}
  language="en"
  on:change={handleChange}
/>
```

## Examples

### Full Editor Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learning Map Editor</title>
  <link rel="stylesheet" href="https://unpkg.com/@learningmap/web-component/dist/web-component.css">
  <script src="https://unpkg.com/@learningmap/web-component"></script>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .editor {
      flex: 1;
    }
  </style>
</head>
<body>
  <div class="container">
    <hyperbook-learningmap-editor
      id="editor"
      class="editor"
      language="en"
      roadmap-data='{"nodes":[],"edges":[],"settings":{},"version":1}'
    ></hyperbook-learningmap-editor>
  </div>

  <script>
    const editor = document.getElementById('editor');
    
    // Load saved data from localStorage
    const saved = localStorage.getItem('learningmap');
    if (saved) {
      editor.setAttribute('roadmap-data', saved);
    }
    
    // Save when user makes changes
    editor.addEventListener('change', (event) => {
      const data = JSON.stringify(event.detail);
      localStorage.setItem('learningmap', data);
      console.log('Saved to localStorage');
    });
  </script>
</body>
</html>
```

### Full Viewer Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learning Map</title>
  <link rel="stylesheet" href="https://unpkg.com/@learningmap/web-component/dist/web-component.css">
  <script src="https://unpkg.com/@learningmap/web-component"></script>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .container {
      height: 100vh;
    }
  </style>
</head>
<body>
  <div class="container">
    <hyperbook-learningmap
      id="viewer"
      language="en"
    ></hyperbook-learningmap>
  </div>

  <script>
    const viewer = document.getElementById('viewer');
    
    // Fetch roadmap data
    fetch('/api/roadmap/123')
      .then(r => r.json())
      .then(data => {
        viewer.setAttribute('roadmap-data', JSON.stringify(data));
      });
    
    // Load saved progress
    const progress = localStorage.getItem('progress-123');
    if (progress) {
      viewer.setAttribute('initial-state', progress);
    }
    
    // Save progress when updated
    viewer.addEventListener('change', (event) => {
      const state = JSON.stringify(event.detail);
      localStorage.setItem('progress-123', state);
      
      // Also save to backend
      fetch('/api/progress/123', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: state
      });
    });
  </script>
</body>
</html>
```

## Styling

The web component includes default styles. You can customize the appearance using CSS:

```css
hyperbook-learningmap-editor {
  --background-color: #f5f5f5;
  --primary-color: #007bff;
  --text-color: #333;
}
```

## Browser Support

The web component works in all modern browsers that support:
- Custom Elements v1
- Shadow DOM v1
- ES2015+

For older browsers, consider using polyfills:
- [@webcomponents/webcomponentsjs](https://github.com/webcomponents/webcomponentsjs)

