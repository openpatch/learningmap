import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useViewerStore } from './viewerStore';
import { Node } from '@xyflow/react';
import { NodeData, RoadmapData } from './types';

// Helper to create minimal RoadmapData for tests
const createTestRoadmap = (nodes: Node<NodeData>[], edges: any[] = []): RoadmapData => ({
  nodes,
  edges,
  settings: {},
  version: 1,
});

describe('viewerStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useViewerStore.setState({
      nodes: [],
      edges: [],
      settings: {},
      selectedNode: null,
      drawerOpen: false,
    });
  });

  describe('calculateNodesStates - unlock conditions', () => {
    it('should unlock nodes without any unlock conditions', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'locked' },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[0].data.state).toBe('unlocked');
    });

    it('should keep nodes locked when dependencies are not completed', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'unlocked' },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 2',
            state: 'locked',
            unlock: { after: ['1'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[1].data.state).toBe('locked');
    });

    it('should unlock nodes when all dependencies are completed', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'completed' },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 2',
            state: 'locked',
            unlock: { after: ['1'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[1].data.state).toBe('unlocked');
    });

    it('should unlock nodes when all dependencies are mastered', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'mastered' },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 2',
            state: 'locked',
            unlock: { after: ['1'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[1].data.state).toBe('unlocked');
    });

    it('should keep nodes locked when date condition is not met', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 1',
            state: 'locked',
            unlock: { date: futureDate.toISOString() },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[0].data.state).toBe('locked');
    });

    it('should unlock nodes when date condition is met', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 1',
            state: 'locked',
            unlock: { date: pastDate.toISOString() },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[0].data.state).toBe('unlocked');
    });

    it('should require BOTH unlock.after AND unlock.date conditions to be met', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'unlocked' },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 2',
            state: 'locked',
            unlock: {
              after: ['1'],
              date: pastDate.toISOString(),
            },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      // Task 1 is only unlocked (not completed), so Task 2 should stay locked
      expect(result[1].data.state).toBe('locked');
    });

    it('should unlock when BOTH unlock.after AND unlock.date are satisfied', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'completed' },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 2',
            state: 'locked',
            unlock: {
              after: ['1'],
              date: pastDate.toISOString(),
            },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[1].data.state).toBe('unlocked');
    });

    it('should NOT overwrite completed state when unlock conditions are not met', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 1',
            state: 'completed',
            unlock: { date: futureDate.toISOString() },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      // Should preserve completed state even though date condition isn't met
      expect(result[0].data.state).toBe('completed');
    });

    it('should NOT overwrite mastered state when unlock conditions are not met', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Dep 1', state: 'unlocked' },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 2',
            state: 'mastered',
            unlock: { after: ['1'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      // Should preserve mastered state even though dependency isn't completed
      expect(result[1].data.state).toBe('mastered');
    });

    it('should handle multiple dependencies', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'completed' },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 2', state: 'completed' },
        },
        {
          id: '3',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 3',
            state: 'locked',
            unlock: { after: ['1', '2'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[2].data.state).toBe('unlocked');
    });

    it('should keep node locked if any dependency is incomplete', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'completed' },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 2', state: 'unlocked' },
        },
        {
          id: '3',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 3',
            state: 'locked',
            unlock: { after: ['1', '2'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[2].data.state).toBe('locked');
    });
  });

  describe('calculateNodesStates - topic completion', () => {
    it('should auto-complete topics without completion needs when unlocked', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: { label: 'Topic 1', state: 'locked' },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      // Topics without needs or optional auto-master (completed -> mastered)
      expect(result[0].data.state).toBe('mastered');
    });

    it('should complete topics when all needs are satisfied', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'completed' },
        },
        {
          id: '2',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: {
            label: 'Topic 1',
            state: 'locked',
            completion: { needs: ['1'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      // Topics without optional requirements auto-master after completing needs
      expect(result[1].data.state).toBe('mastered');
    });

    it('should NOT complete topics when needs are not satisfied', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'unlocked' },
        },
        {
          id: '2',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: {
            label: 'Topic 1',
            state: 'locked',
            completion: { needs: ['1'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[1].data.state).toBe('unlocked');
    });

    it('should auto-master completed topics without optional requirements', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'completed' },
        },
        {
          id: '2',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: {
            label: 'Topic 1',
            state: 'locked',
            completion: { needs: ['1'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[1].data.state).toBe('mastered');
    });

    it('should master topics when optional requirements are completed', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'completed' },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 2', state: 'completed' },
        },
        {
          id: '3',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: {
            label: 'Topic 1',
            state: 'locked',
            completion: {
              needs: ['1'],
              optional: ['2'],
            },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[2].data.state).toBe('mastered');
    });

    it('should NOT master topics when optional requirements are incomplete', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'completed' },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 2', state: 'unlocked' },
        },
        {
          id: '3',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: {
            label: 'Topic 1',
            state: 'locked',
            completion: {
              needs: ['1'],
              optional: ['2'],
            },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      expect(result[2].data.state).toBe('completed');
    });

    it('should handle complex topic hierarchies', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'completed' },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 2', state: 'completed' },
        },
        {
          id: '3',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: {
            label: 'Sub Topic',
            state: 'locked',
            completion: { needs: ['1', '2'] },
          },
        },
        {
          id: '4',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: {
            label: 'Main Topic',
            state: 'locked',
            completion: { needs: ['3'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      // Both topics should be mastered (completed needs, no optional)
      expect(result[2].data.state).toBe('mastered');
      expect(result[3].data.state).toBe('mastered');
    });

    it('should not affect task nodes with completion logic', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 1',
            state: 'unlocked',
            completion: { needs: [] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      // Task should stay unlocked (completion logic only applies to topics)
      expect(result[0].data.state).toBe('unlocked');
    });
  });

  describe('updateNodeState', () => {
    it('should update a specific node state and recalculate dependencies', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'unlocked' },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 2',
            state: 'locked',
            unlock: { after: ['1'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      
      // Update Task 1 to completed
      useViewerStore.getState().updateNodeState('1', 'completed');
      
      const result = useViewerStore.getState().nodes;
      expect(result[0].data.state).toBe('completed');
      expect(result[1].data.state).toBe('unlocked'); // Should unlock Task 2
    });

    it('should trigger topic completion when updating task state', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'unlocked' },
        },
        {
          id: '2',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: {
            label: 'Topic 1',
            state: 'locked',
            completion: { needs: ['1'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      
      // Update Task 1 to completed
      useViewerStore.getState().updateNodeState('1', 'completed');
      
      const result = useViewerStore.getState().nodes;
      expect(result[1].data.state).toBe('mastered'); // Topic should be mastered
    });
  });

  describe('getRoadmapState', () => {
    it('should only save task node states', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'completed' },
        },
        {
          id: '2',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: { label: 'Topic 1', state: 'mastered' },
        },
        {
          id: '3',
          type: 'text',
          position: { x: 0, y: 0 },
          data: { label: 'Text Node', state: 'unlocked' },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      
      const state = useViewerStore.getState().getRoadmapState({
        x: 100,
        y: 200,
        zoom: 1.5,
      });

      expect(state.nodes).toHaveProperty('1');
      expect(state.nodes).not.toHaveProperty('2');
      expect(state.nodes).not.toHaveProperty('3');
      expect(state.x).toBe(100);
      expect(state.y).toBe(200);
      expect(state.zoom).toBe(1.5);
    });
  });

  describe('loadRoadmapData with initialState', () => {
    it('should restore state from initialState', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1', state: 'unlocked' },
        },
      ];

      const initialState = {
        nodes: {
          '1': { state: 'completed' },
        },
        x: 0,
        y: 0,
        zoom: 1,
      };

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes), initialState);
      
      const result = useViewerStore.getState().nodes;
      expect(result[0].data.state).toBe('completed');
    });
  });

  describe('edge cases', () => {
    it('should handle nodes with missing state', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: { label: 'Task 1' },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      // Should default to unlocked (no unlock conditions)
      expect(result[0].data.state).toBe('unlocked');
    });

    it('should handle non-existent dependency IDs gracefully', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 1',
            state: 'locked',
            unlock: { after: ['non-existent'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      // Should stay locked because dependency doesn't exist/isn't complete
      expect(result[0].data.state).toBe('locked');
    });

    it('should handle circular dependencies', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: '1',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 1',
            state: 'locked',
            unlock: { after: ['2'] },
          },
        },
        {
          id: '2',
          type: 'task',
          position: { x: 0, y: 0 },
          data: {
            label: 'Task 2',
            state: 'locked',
            unlock: { after: ['1'] },
          },
        },
      ];

      useViewerStore.getState().loadRoadmapData(createTestRoadmap(nodes));
      const result = useViewerStore.getState().nodes;

      // Both should stay locked (circular dependency)
      expect(result[0].data.state).toBe('locked');
      expect(result[1].data.state).toBe('locked');
    });
  });
});
