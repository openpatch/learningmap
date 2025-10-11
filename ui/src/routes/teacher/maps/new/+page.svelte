<script lang="ts">
	import { goto } from '$app/navigation';
	import pb from '$lib/pocketbase';
	import type { RoadmapData } from '$lib/types';

	let name = $state('');
	let roadmapData = $state<RoadmapData>({
		nodes: [],
		edges: [],
		settings: { title: '', language: 'en' },
		version: 1
	});
	let loading = $state(false);
	let error = $state('');

	// Reference to the editor element
	let editorElement: HTMLElement | undefined = $state();

	async function handleCreate() {
		if (!name) {
			error = 'Please enter a name for the learning map';
			return;
		}

		loading = true;
		error = '';

		try {
			const userId = pb.authStore.record?.id;
			const map = await pb.collection('learningmaps').create({
				name,
				roadmapData,
				teacher: userId
			});

			goto(`/teacher/maps/${map.id}`);
		} catch (err: any) {
			error = err.message || 'Failed to create learning map';
		} finally {
			loading = false;
		}
	}

	function handleEditorChange(event: CustomEvent) {
		roadmapData = event.detail;
	}

	// Load the web component script dynamically
	import { onMount } from 'svelte';
	onMount(() => {
		// Check if the web component is defined
		if (!customElements.get('hyperbook-learningmap-editor')) {
			// For now, we'll just create a placeholder
			console.warn('hyperbook-learningmap-editor component not loaded');
		}
	});
</script>

<svelte:head>
	<script src="https://unpkg.com/@hyperbook/web-component-learningmap@latest/dist/index.umd.js"></script>
	<link rel="stylesheet" href="https://unpkg.com/@hyperbook/web-component-learningmap@latest/dist/web-component-learningmap.css" />
</svelte:head>

<div class="container mx-auto p-6">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-4xl font-bold">Create New Learning Map</h1>
		<a href="/teacher/maps" class="btn btn-ghost">Back to Maps</a>
	</div>

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
					disabled={loading}
				/>
			</div>

			{#if error}
				<div class="alert alert-error mb-4">
					<span>{error}</span>
				</div>
			{/if}

			<div class="mb-4">
				<label class="label">
					<span class="label-text">Design Your Learning Map</span>
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
				<button class="btn btn-primary" onclick={handleCreate} disabled={loading}>
					{loading ? 'Creating...' : 'Create Learning Map'}
				</button>
			</div>
		</div>
	</div>
</div>
