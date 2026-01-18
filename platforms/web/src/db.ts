import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { RoadmapData, RoadmapState } from "@learningmap/learningmap";

interface LearningMapEntry {
  id: string;
  roadmapData: RoadmapData;
  state?: RoadmapState;
  lastAccessed: number;
}

interface TeacherMapEntry {
  id: string;
  roadmapData: RoadmapData;
  jsonId?: string; // ID from jsonStore if published
  createdAt: number;
  lastModified: number;
}

interface LearningMapDB extends DBSchema {
  learningMaps: {
    key: string;
    value: LearningMapEntry;
    indexes: { "by-lastAccessed": number };
  };
  teacherMaps: {
    key: string;
    value: TeacherMapEntry;
    indexes: { "by-lastModified": number };
  };
}

let dbPromise: Promise<IDBPDatabase<LearningMapDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<LearningMapDB>("learningmap-db", 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore("learningMaps", { keyPath: "id" });
          store.createIndex("by-lastAccessed", "lastAccessed");
        }
        if (oldVersion < 2) {
          const teacherStore = db.createObjectStore("teacherMaps", {
            keyPath: "id",
          });
          teacherStore.createIndex("by-lastModified", "lastModified");
        }
      },
    });
  }
  return dbPromise;
}

export async function addLearningMap(
  id: string,
  roadmapData: RoadmapData,
  existingState?: RoadmapState,
) {
  const db = await getDB();
  const entry: LearningMapEntry = {
    id,
    roadmapData,
    state: existingState,
    lastAccessed: Date.now(),
  };
  await db.put("learningMaps", entry);
}

export async function updateState(id: string, state: RoadmapState) {
  const db = await getDB();
  const existing = await db.get("learningMaps", id);
  if (existing) {
    existing.state = state;
    existing.lastAccessed = Date.now();
    await db.put("learningMaps", existing);
  }
}

export async function getLearningMap(
  id: string,
): Promise<LearningMapEntry | undefined> {
  const db = await getDB();
  return await db.get("learningMaps", id);
}

export async function getAllLearningMaps(): Promise<LearningMapEntry[]> {
  const db = await getDB();
  const allMaps = await db.getAllFromIndex("learningMaps", "by-lastAccessed");
  return allMaps.reverse(); // Most recent first
}

export async function removeLearningMap(id: string) {
  const db = await getDB();
  await db.delete("learningMaps", id);
}

// Teacher Maps functions
export async function addTeacherMap(
  id: string,
  roadmapData: RoadmapData,
  jsonId?: string,
) {
  const db = await getDB();
  const existing = await db.get("teacherMaps", id);
  const entry: TeacherMapEntry = {
    id,
    roadmapData,
    jsonId,
    createdAt: existing?.createdAt || Date.now(),
    lastModified: Date.now(),
  };
  await db.put("teacherMaps", entry);
}

export async function getTeacherMap(
  id: string,
): Promise<TeacherMapEntry | undefined> {
  const db = await getDB();
  return await db.get("teacherMaps", id);
}

export async function getAllTeacherMaps(): Promise<TeacherMapEntry[]> {
  const db = await getDB();
  const allMaps = await db.getAllFromIndex("teacherMaps", "by-lastModified");
  return allMaps.reverse(); // Most recent first
}

export async function findTeacherMapBySettingsId(
  settingsId: string,
): Promise<TeacherMapEntry | undefined> {
  const db = await getDB();
  const allMaps = await db.getAll("teacherMaps");
  return allMaps.find((map) => map.roadmapData.settings?.id === settingsId);
}

export async function removeTeacherMap(id: string) {
  const db = await getDB();
  await db.delete("teacherMaps", id);
}

export type { TeacherMapEntry };
