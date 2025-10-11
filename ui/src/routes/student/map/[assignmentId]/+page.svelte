<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import pb from '$lib/pocketbase';
	import type { Assignment, LearningMap, Progress, RoadmapState, RoadmapData } from '$lib/types';

	let assignmentId = $derived($page.params.assignmentId);
	let assignment = $state<Assignment & { expand?: { learningmap?: LearningMap } } | null>(null);
	let progress = $state<Progress | null>(null);
	let roadmapData = $state<RoadmapData | null>(null);
	let roadmapState = $state<RoadmapState | null>(null);
	let loading = $state(true);
	let saving = $state(false);

	// Reference to the learningmap element
	let learningmapElement: HTMLElement | undefined = $state();

	onMount(async () => {
		await loadAssignment();
	});

	async function loadAssignment() {
		try {
			const userId = pb.authStore.record?.id;
			
			// Load assignment with expanded learningmap
			const assignmentResult = await pb.collection('assignments').getOne(assignmentId, {
				expand: 'learningmap'
			});
			assignment = assignmentResult as any;
			roadmapData = assignment?.expand?.learningmap?.roadmapData || null;

			// Load progress
			try {
				const progressResult = await pb.collection('progress').getList(1, 1, {
					filter: `student = "${userId}" && assignment = "${assignmentId}"`
				});

				if (progressResult.items.length > 0) {
					progress = progressResult.items[0] as unknown as Progress;
					roadmapState = progress.roadmapState;
				} else {
					// Initialize progress
					roadmapState = {
						nodes: {},
						x: 0,
						y: 0,
						zoom: 1
					};
				}
			} catch (err) {
				console.error('Failed to load progress:', err);
				// Initialize with default state
				roadmapState = {
					nodes: {},
					x: 0,
					y: 0,
					zoom: 1
				};
			}
		} catch (err) {
			console.error('Failed to load assignment:', err);
		} finally {
			loading = false;
		}
	}

	async function handleStateChange(event: CustomEvent) {
		roadmapState = event.detail;
		await saveProgress();
	}

	async function saveProgress() {
		if (!roadmapState) return;

		try {
			saving = true;
			const userId = pb.authStore.record?.id;

			if (progress) {
				// Update existing progress
				await pb.collection('progress').update(progress.id, {
					roadmapState
				});
			} else {
				// Create new progress
				const newProgress = await pb.collection('progress').create({
					student: userId,
					assignment: assignmentId,
					roadmapState
				});
				progress = newProgress as unknown as Progress;
			}
		} catch (err) {
			console.error('Failed to save progress:', err);
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<script src="https://unpkg.com/@hyperbook/learningmap@latest/dist/index.js"></script>
</svelte:head>

<div class="container mx-auto p-6">
	<div class="flex justify-between items-center mb-4">
		<div>
			<h1 class="text-3xl font-bold">
				{assignment?.expand?.learningmap?.name || 'Learning Map'}
			</h1>
			{#if saving}
				<p class="text-sm text-gray-600">Saving progress...</p>
			{/if}
		</div>
		<a href="/student/dashboard" class="btn btn-ghost">Back to Dashboard</a>
	</div>

	{#if loading}
		<div class="flex justify-center items-center min-h-[600px]">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if !roadmapData}
		<div class="alert alert-error">
			<span>Failed to load learning map data.</span>
		</div>
	{:else}
		<div class="border border-gray-300 rounded-lg bg-white" style="height: calc(100vh - 200px); min-height: 600px;">
			<hyperbook-learningmap
				bind:this={learningmapElement}
				language="en"
				roadmap-data={JSON.stringify(roadmapData)}
				initial-state={JSON.stringify(roadmapState)}
				onchange={handleStateChange}
			></hyperbook-learningmap>
		</div>
	{/if}
</div>
