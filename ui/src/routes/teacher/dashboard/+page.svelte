<script lang="ts">
	import { onMount } from 'svelte';
	import pb from '$lib/pocketbase';
	import type { LearningMap, Group, Assignment } from '$lib/types';

	let learningMaps = $state<LearningMap[]>([]);
	let groups = $state<Group[]>([]);
	let assignments = $state<Assignment[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const userId = pb.authStore.record?.id;
			
			// Load teacher's learning maps
			const mapsResult = await pb.collection('learningmaps').getList(1, 50, {
				filter: `teacher = "${userId}"`,
				sort: '-created'
			});
			learningMaps = mapsResult.items as unknown as LearningMap[];

			// Load teacher's groups
			const groupsResult = await pb.collection('groups').getList(1, 50, {
				filter: `teacher = "${userId}"`,
				sort: '-created'
			});
			groups = groupsResult.items as unknown as Group[];

			// Load assignments
			const assignmentsResult = await pb.collection('assignments').getList(1, 50, {
				filter: `teacher = "${userId}"`,
				sort: '-created'
			});
			assignments = assignmentsResult.items as unknown as Assignment[];
		} catch (err) {
			console.error('Failed to load dashboard data:', err);
		} finally {
			loading = false;
		}
	});
</script>

<div class="container mx-auto p-6">
	<h1 class="text-4xl font-bold mb-8">Teacher Dashboard</h1>

	{#if loading}
		<div class="flex justify-center items-center min-h-[400px]">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<!-- Learning Maps Card -->
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">Learning Maps</h2>
					<p class="text-4xl font-bold">{learningMaps.length}</p>
					<div class="card-actions justify-end">
						<a href="/teacher/maps" class="btn btn-primary btn-sm">Manage Maps</a>
					</div>
				</div>
			</div>

			<!-- Groups Card -->
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">Groups</h2>
					<p class="text-4xl font-bold">{groups.length}</p>
					<div class="card-actions justify-end">
						<a href="/teacher/groups" class="btn btn-primary btn-sm">Manage Groups</a>
					</div>
				</div>
			</div>

			<!-- Assignments Card -->
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">Assignments</h2>
					<p class="text-4xl font-bold">{assignments.length}</p>
					<div class="card-actions justify-end">
						<a href="/teacher/groups" class="btn btn-primary btn-sm">View All</a>
					</div>
				</div>
			</div>
		</div>

		<div class="divider"></div>

		<!-- Quick Actions -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title mb-4">Quick Actions</h2>
				<div class="flex flex-wrap gap-4">
					<a href="/teacher/maps/new" class="btn btn-primary">Create New Learning Map</a>
					<a href="/teacher/groups/new" class="btn btn-secondary">Create New Group</a>
				</div>
			</div>
		</div>

		<!-- Recent Activity -->
		<div class="mt-8">
			<h2 class="text-2xl font-bold mb-4">Recent Learning Maps</h2>
			{#if learningMaps.length === 0}
				<div class="alert">
					<span>No learning maps yet. Create your first one to get started!</span>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each learningMaps.slice(0, 6) as map}
						<div class="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
							<div class="card-body">
								<h3 class="card-title text-lg">{map.name}</h3>
								<p class="text-sm text-gray-600">
									Created: {new Date(map.created).toLocaleDateString()}
								</p>
								<div class="card-actions justify-end mt-2">
									<a href="/teacher/maps/{map.id}" class="btn btn-sm btn-ghost">Edit</a>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
