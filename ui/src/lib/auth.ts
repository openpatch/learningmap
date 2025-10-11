import pb from './pocketbase';
import type { User } from './types';
import { generateRandomName, generateRandomCode } from './randomName';

export async function loginTeacher(email: string, password: string): Promise<User> {
	try {
		const authData = await pb.collection('users').authWithPassword(email, password);
		const user = authData.record as unknown as User;
		
		if (user.role !== 'teacher') {
			await pb.authStore.clear();
			throw new Error('Only teachers can log in with email/password');
		}
		
		return user;
	} catch (error) {
		console.error('Teacher login failed:', error);
		throw error;
	}
}

export async function loginStudent(code: string): Promise<User> {
	try {
		// Find user by code
		const records = await pb.collection('users').getList(1, 1, {
			filter: `code = "${code}" && role = "student"`
		});
		
		if (records.items.length === 0) {
			throw new Error('Invalid student code');
		}
		
		const user = records.items[0] as unknown as User;
		
		// Set auth manually for student (no password)
		pb.authStore.save(pb.authStore.token, user);
		
		return user;
	} catch (error) {
		console.error('Student login failed:', error);
		throw error;
	}
}

export async function createStudent(teacherId: string): Promise<User> {
	try {
		const displayName = generateRandomName();
		const code = generateRandomCode(6);
		
		const user = await pb.collection('users').create({
			role: 'student',
			displayName,
			code,
			managedBy: teacherId
		});
		
		return user as unknown as User;
	} catch (error) {
		console.error('Failed to create student:', error);
		throw error;
	}
}

export function logout(): void {
	pb.authStore.clear();
}

export function getCurrentUser(): User | null {
	if (!pb.authStore.isValid) {
		return null;
	}
	return pb.authStore.record as unknown as User;
}

export function isTeacher(): boolean {
	const user = getCurrentUser();
	return user?.role === 'teacher';
}

export function isStudent(): boolean {
	const user = getCurrentUser();
	return user?.role === 'student';
}
