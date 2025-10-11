<script lang="ts">
	import { goto } from '$app/navigation';
	import pb from '$lib/pocketbase';

	let name = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleCreate() {
		if (!name) {
			error = 'Please enter a name for the group';
			return;
		}

		loading = true;
		error = '';

		try {
			const userId = pb.authStore.record?.id;
			const group = await pb.collection('groups').create({
				name,
				teacher: userId,
				students: []
			});

			goto(`/teacher/groups/${group.id}`);
		} catch (err: any) {
			error = err.message || 'Failed to create group';
		} finally {
			loading = false;
		}
	}
</script>

<div class="container mx-auto p-6">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-4xl font-bold">Create New Group</h1>
		<a href="/teacher/groups" class="btn btn-ghost">Back to Groups</a>
	</div>

	<div class="card bg-base-100 shadow-xl max-w-2xl mx-auto">
		<form class="card-body" onsubmit={(e) => { e.preventDefault(); handleCreate(); }}>
			<div class="form-control w-full">
				<label class="label" for="name">
					<span class="label-text">Group Name</span>
				</label>
				<input
					type="text"
					id="name"
					placeholder="e.g., Class 10A, Biology 2024"
					class="input input-bordered w-full"
					bind:value={name}
					disabled={loading}
					required
				/>
			</div>

			{#if error}
				<div class="alert alert-error mt-4">
					<span>{error}</span>
				</div>
			{/if}

			<div class="card-actions justify-end mt-4">
				<button type="submit" class="btn btn-primary" disabled={loading}>
					{loading ? 'Creating...' : 'Create Group'}
				</button>
			</div>
		</form>
	</div>
</div>
