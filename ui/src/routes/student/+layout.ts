import { goto } from '$app/navigation';
import pb from '$lib/pocketbase';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = async () => {
	try {
		await pb.collection('users').authRefresh();
		if (!pb.authStore.isValid) {
			goto('/student/login');
			return;
		}

		const user = pb.authStore.record;
		if (user?.role !== 'student') {
			goto('/student/login');
			return;
		}
	} catch (e) {
		goto('/student/login');
	}
};
