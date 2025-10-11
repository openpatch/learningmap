<script lang="ts">
	import { onMount } from 'svelte';
	import pb from '$lib/pocketbase';
	import type { Group, User } from '$lib/types';

	let groups = $state<(Group & { expand?: { students?: User[] } })[]>([]);
	let loading = $state(true);
	let deleting = $state<string | null>(null);

	onMount(async () => {
		await loadGroups();
	});

	async function loadGroups() {
		try {
			loading = true;
			const userId = pb.authStore.record?.id;
			const result = await pb.collection('groups').getList(1, 50, {
				filter: `teacher = "${userId}"`,
				expand: 'students',
				sort: '-created'
			});
			groups = result.items as any;
		} catch (err) {
			console.error('Failed to load groups:', err);
		} finally {
			loading = false;
		}
	}

	async function deleteGroup(id: string) {
		if (!confirm('Are you sure you want to delete this group?')) {
			return;
		}

		try {
			deleting = id;
			await pb.collection('groups').delete(id);
			groups = groups.filter(g => g.id !== id);
		} catch (err) {
			console.error('Failed to delete group:', err);
			alert('Failed to delete group');
		} finally {
			deleting = null;
		}
	}
</script>

<div class="container mx-auto p-6">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-4xl font-bold">Groups</h1>
		<a href="/teacher/groups/new" class="btn btn-primary">Create New Group</a>
	</div>

	{#if loading}
		<div class="flex justify-center items-center min-h-[400px]">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if groups.length === 0}
		<div class="alert alert-info">
			<span>No groups yet. Create your first group to get started!</span>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each groups as group}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title">{group.name}</h2>
						<div class="text-sm text-gray-600">
							<p>{group.expand?.students?.length || 0} students</p>
							<p>Created: {new Date(group.created).toLocaleDateString()}</p>
						</div>
						<div class="card-actions justify-end mt-4">
							<a href="/teacher/groups/{group.id}" class="btn btn-sm btn-primary">Manage</a>
							<button
								class="btn btn-sm btn-error"
								onclick={() => deleteGroup(group.id)}
								disabled={deleting === group.id}
							>
								{deleting === group.id ? 'Deleting...' : 'Delete'}
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
