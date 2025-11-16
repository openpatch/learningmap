import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { RoadmapData, RoadmapState } from '@learningmap/learningmap';

interface LearningMapEntry {
  id: string;
  roadmapData: RoadmapData;
  state?: RoadmapState;
  lastAccessed: number;
}

interface LearningMapDB extends DBSchema {
  learningMaps: {
    key: string;
    value: LearningMapEntry;
    indexes: { 'by-lastAccessed': number };
  };
}

let dbPromise: Promise<IDBPDatabase<LearningMapDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<LearningMapDB>('learningmap-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('learningMaps', { keyPath: 'id' });
        store.createIndex('by-lastAccessed', 'lastAccessed');
      },
    });
  }
  return dbPromise;
}

export async function addLearningMap(id: string, roadmapData: RoadmapData, existingState?: RoadmapState) {
  const db = await getDB();
  const entry: LearningMapEntry = {
    id,
    roadmapData,
    state: existingState,
    lastAccessed: Date.now(),
  };
  await db.put('learningMaps', entry);
}

export async function updateState(id: string, state: RoadmapState) {
  const db = await getDB();
  const existing = await db.get('learningMaps', id);
  if (existing) {
    existing.state = state;
    existing.lastAccessed = Date.now();
    await db.put('learningMaps', existing);
  }
}

export async function getLearningMap(id: string): Promise<LearningMapEntry | undefined> {
  const db = await getDB();
  return await db.get('learningMaps', id);
}

export async function getAllLearningMaps(): Promise<LearningMapEntry[]> {
  const db = await getDB();
  const allMaps = await db.getAllFromIndex('learningMaps', 'by-lastAccessed');
  return allMaps.reverse(); // Most recent first
}

export async function removeLearningMap(id: string) {
  const db = await getDB();
  await db.delete('learningMaps', id);
}
