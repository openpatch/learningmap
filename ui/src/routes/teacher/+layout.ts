import { goto } from '$app/navigation';
import pb from '$lib/pocketbase';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = async () => {
	try {
		await pb.collection('users').authRefresh();
		if (!pb.authStore.isValid) {
			goto('/sign-in');
			return;
		}

		const user = pb.authStore.record;
		if (user?.role !== 'teacher') {
			goto('/sign-in');
			return;
		}
	} catch (e) {
		goto('/sign-in');
	}
};
