<script lang="ts">
	import { onMount } from 'svelte';
	import pb from '$lib/pocketbase';
	import type { Assignment, LearningMap, Progress } from '$lib/types';

	let assignments = $state<(Assignment & { expand?: { learningmap?: LearningMap, progress?: Progress } })[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const userId = pb.authStore.record?.id;
			
			// Get all groups this student is in
			const groupsResult = await pb.collection('groups').getList(1, 50, {
				filter: `students ~ "${userId}"`
			});

			if (groupsResult.items.length > 0) {
				const groupIds = groupsResult.items.map(g => `"${g.id}"`).join(',');
				
				// Get assignments for those groups
				const assignmentsResult = await pb.collection('assignments').getList(1, 50, {
					filter: `group.id ?~ [${groupIds}]`,
					expand: 'learningmap',
					sort: '-id'
				});

				// Load progress for each assignment
				for (const assignment of assignmentsResult.items) {
					try {
						const progressResult = await pb.collection('progress').getList(1, 1, {
							filter: `student = "${userId}" && assignment = "${assignment.id}"`
						});
						if (progressResult.items.length > 0) {
							assignment.expand = assignment.expand || {};
							assignment.expand.progress = progressResult.items[0] as unknown as Progress;
						}
					} catch (err) {
						console.error('Failed to load progress:', err);
					}
				}

				assignments = assignmentsResult.items as any;
			}
		} catch (err) {
			console.error('Failed to load assignments:', err);
		} finally {
			loading = false;
		}
	});

	function getProgressPercentage(assignment: any): number {
		if (!assignment.expand?.progress?.roadmapState) return 0;
		
		const nodes = assignment.expand.progress.roadmapState.nodes;
		if (!nodes) return 0;
		
		const totalNodes = Object.keys(nodes).length;
		if (totalNodes === 0) return 0;
		
		const completedNodes = Object.values(nodes).filter(
			(node: any) => node.state === 'completed' || node.state === 'mastered'
		).length;
		
		return Math.round((completedNodes / totalNodes) * 100);
	}
</script>

<div class="container mx-auto p-6">
	<h1 class="text-4xl font-bold mb-8">My Learning Maps</h1>

	{#if loading}
		<div class="flex justify-center items-center min-h-[400px]">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if assignments.length === 0}
		<div class="alert alert-info">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
			<span>No learning maps assigned to you yet. Please contact your teacher.</span>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each assignments as assignment}
				{@const map = assignment.expand?.learningmap}
				{@const progress = getProgressPercentage(assignment)}
				{#if map}
					<div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
						<div class="card-body">
							<h2 class="card-title">{map.name}</h2>
							<p class="text-sm text-gray-600">
								{map.roadmapData?.settings?.title || 'Learning Map'}
							</p>
							
							<div class="mt-4">
								<div class="flex justify-between text-sm mb-1">
									<span>Progress</span>
									<span>{progress}%</span>
								</div>
								<progress class="progress progress-primary w-full" value={progress} max="100"></progress>
							</div>

							<div class="card-actions justify-end mt-4">
								<a href="/student/map/{assignment.id}" class="btn btn-primary">
									{progress === 0 ? 'Start' : 'Continue'}
								</a>
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
