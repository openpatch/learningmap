import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoadmapData, RoadmapState } from '@learningmap/learningmap';

interface LearningMapEntry {
  id: string;
  roadmapData: RoadmapData;
  state?: RoadmapState;
  lastAccessed: number;
}

interface LearnerStore {
  learningMaps: Record<string, LearningMapEntry>;
  
  // Actions
  addLearningMap: (id: string, roadmapData: RoadmapData) => void;
  updateState: (id: string, state: RoadmapState) => void;
  getLearningMap: (id: string) => LearningMapEntry | undefined;
  getAllLearningMaps: () => LearningMapEntry[];
  removeLearningMap: (id: string) => void;
}

export const useLearnerStore = create<LearnerStore>()(
  persist(
    (set, get) => ({
      learningMaps: {},
      
      addLearningMap: (id, roadmapData) => {
        set((state) => ({
          learningMaps: {
            ...state.learningMaps,
            [id]: {
              id,
              roadmapData,
              state: state.learningMaps[id]?.state,
              lastAccessed: Date.now(),
            },
          },
        }));
      },
      
      updateState: (id, state) => {
        set((prevState) => ({
          learningMaps: {
            ...prevState.learningMaps,
            [id]: {
              ...prevState.learningMaps[id],
              state,
              lastAccessed: Date.now(),
            },
          },
        }));
      },
      
      getLearningMap: (id) => {
        return get().learningMaps[id];
      },
      
      getAllLearningMaps: () => {
        const maps = get().learningMaps;
        return Object.values(maps).sort((a, b) => b.lastAccessed - a.lastAccessed);
      },
      
      removeLearningMap: (id) => {
        set((state) => {
          const newMaps = { ...state.learningMaps };
          delete newMaps[id];
          return { learningMaps: newMaps };
        });
      },
    }),
    {
      name: 'learningmap-learner-storage',
      version: 1,
    }
  )
);
