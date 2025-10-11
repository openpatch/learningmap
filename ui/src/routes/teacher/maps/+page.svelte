<script lang="ts">
	import { onMount } from 'svelte';
	import pb from '$lib/pocketbase';
	import type { LearningMap } from '$lib/types';

	let maps = $state<LearningMap[]>([]);
	let loading = $state(true);
	let deleting = $state<string | null>(null);

	onMount(async () => {
		await loadMaps();
	});

	async function loadMaps() {
		try {
			loading = true;
			const userId = pb.authStore.record?.id;
			const result = await pb.collection('learningmaps').getList(1, 50, {
				filter: `teacher = "${userId}"`,
				sort: '-id'
			});
			maps = result.items as unknown as LearningMap[];
		} catch (err) {
			console.error('Failed to load maps:', err);
		} finally {
			loading = false;
		}
	}

	async function deleteMap(id: string) {
		if (!confirm('Are you sure you want to delete this learning map?')) {
			return;
		}

		try {
			deleting = id;
			await pb.collection('learningmaps').delete(id);
			maps = maps.filter(m => m.id !== id);
		} catch (err) {
			console.error('Failed to delete map:', err);
			alert('Failed to delete map');
		} finally {
			deleting = null;
		}
	}
</script>

<div class="container mx-auto p-6">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-4xl font-bold">Learning Maps</h1>
		<a href="/teacher/maps/new" class="btn btn-primary">Create New Map</a>
	</div>

	{#if loading}
		<div class="flex justify-center items-center min-h-[400px]">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if maps.length === 0}
		<div class="alert alert-info">
			<span>No learning maps yet. Create your first one to get started!</span>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="table table-zebra">
				<thead>
					<tr>
						<th>Name</th>
						<th>Created</th>
						<th>Updated</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each maps as map}
						<tr>
							<td>
								<div class="font-bold">{map.name}</div>
								<div class="text-sm opacity-50">
									{map.roadmapData?.settings?.title || ''}
								</div>
							</td>
							<td>{new Date(map.created).toLocaleDateString()}</td>
							<td>{new Date(map.updated).toLocaleDateString()}</td>
							<td>
								<div class="flex gap-2">
									<a href="/teacher/maps/{map.id}" class="btn btn-sm btn-ghost">Edit</a>
									<button
										class="btn btn-sm btn-error"
										onclick={() => deleteMap(map.id)}
										disabled={deleting === map.id}
									>
										{deleting === map.id ? 'Deleting...' : 'Delete'}
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
