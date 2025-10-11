import type { Node, Edge } from '@xyflow/react';

export interface UnlockCondition {
	after?: string[];
	date?: string;
	password?: string;
}

export interface Completion {
	needs?: string[];
	optional?: string[];
}

export interface NodeData {
	state: 'locked' | 'unlocked' | 'started' | 'completed' | 'mastered';
	label: string;
	description?: string;
	duration?: string;
	unlock?: UnlockCondition;
	completion?: Completion;
	video?: string;
	resources?: { label: string; url: string }[];
	summary?: string;
	[key: string]: any;
}

export interface RoadmapData {
	nodes?: Node<NodeData>[];
	edges?: Edge[];
	settings: { title?: string; language?: string };
	version: number;
}

export interface RoadmapState {
	nodes: Record<string, { state: string }>;
	x: number;
	y: number;
	zoom: number;
}

export interface User {
	id: string;
	role: 'teacher' | 'student';
	displayName: string;
	code?: string;
	email?: string;
	created: string;
	updated: string;
}

export interface Group {
	id: string;
	name: string;
	teacher: string;
	students: string[];
	created: string;
	updated: string;
}

export interface LearningMap {
	id: string;
	name: string;
	roadmapData: RoadmapData;
	teacher: string;
	created: string;
	updated: string;
}

export interface Assignment {
	id: string;
	group: string;
	learningmap: string;
	teacher: string;
	created: string;
	updated: string;
}

export interface Progress {
	id: string;
	student: string;
	assignment: string;
	roadmapState: RoadmapState;
	created: string;
	updated: string;
}
