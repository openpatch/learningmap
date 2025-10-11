<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import pb from '$lib/pocketbase';
	import type { RoadmapData, LearningMap } from '$lib/types';

	let mapId = $derived($page.params.id);
	let name = $state('');
	let roadmapData = $state<RoadmapData>({
		nodes: [],
		edges: [],
		settings: { title: '', language: 'en' },
		version: 1
	});
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');

	// Reference to the editor element
	let editorElement: HTMLElement | undefined = $state();

	onMount(async () => {
		await loadMap();
	});

	async function loadMap() {
		try {
			loading = true;
			const map = await pb.collection('learningmaps').getOne(mapId) as unknown as LearningMap;
			name = map.name;
			roadmapData = map.roadmapData;
		} catch (err: any) {
			error = err.message || 'Failed to load learning map';
		} finally {
			loading = false;
		}
	}

	async function handleSave() {
		if (!name) {
			error = 'Please enter a name for the learning map';
			return;
		}

		saving = true;
		error = '';

		try {
			await pb.collection('learningmaps').update(mapId, {
				name,
				roadmapData
			});

			goto('/teacher/maps');
		} catch (err: any) {
			error = err.message || 'Failed to save learning map';
		} finally {
			saving = false;
		}
	}

	function handleEditorChange(event: CustomEvent) {
		roadmapData = event.detail;
	}
</script>

<svelte:head>
	<script src="https://unpkg.com/@hyperbook/learningmap@latest/dist/index.js"></script>
</svelte:head>

<div class="container mx-auto p-6">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-4xl font-bold">Edit Learning Map</h1>
		<a href="/teacher/maps" class="btn btn-ghost">Back to Maps</a>
	</div>

	{#if loading}
		<div class="flex justify-center items-center min-h-[400px]">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<div class="form-control w-full mb-4">
					<label class="label" for="name">
						<span class="label-text">Map Name</span>
					</label>
					<input
						type="text"
						id="name"
						placeholder="e.g., JavaScript Fundamentals"
						class="input input-bordered w-full"
						bind:value={name}
						disabled={saving}
					/>
				</div>

				{#if error}
					<div class="alert alert-error mb-4">
						<span>{error}</span>
					</div>
				{/if}

				<div class="mb-4">
					<label class="label">
						<span class="label-text">Edit Your Learning Map</span>
					</label>
					<div class="border border-gray-300 rounded-lg" style="min-height: 500px;">
						<hyperbook-learningmap-editor
							bind:this={editorElement}
							language="en"
							roadmap-data={JSON.stringify(roadmapData)}
							onchange={handleEditorChange}
						></hyperbook-learningmap-editor>
					</div>
				</div>

				<div class="card-actions justify-end">
					<button class="btn btn-primary" onclick={handleSave} disabled={saving}>
						{saving ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
