<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import pb from '$lib/pocketbase';
	import type { Group, User, LearningMap, Assignment } from '$lib/types';
	import { createStudent } from '$lib/auth';
	import { generateQRCode } from '$lib/utils/qr';

	let groupId = $derived($page.params.id);
	let group = $state<Group & { expand?: { students?: User[] } } | null>(null);
	let students = $state<User[]>([]);
	let learningMaps = $state<LearningMap[]>([]);
	let assignments = $state<Assignment[]>([]);
	let loading = $state(true);
	let addingStudent = $state(false);
	let assigningMap = $state(false);
	let selectedMapId = $state('');

	onMount(async () => {
		await loadGroup();
		await loadMaps();
		await loadAssignments();
	});

	async function loadGroup() {
		try {
			const result = await pb.collection('groups').getOne(groupId, {
				expand: 'students'
			});
			group = result as any;
			students = group?.expand?.students || [];
		} catch (err) {
			console.error('Failed to load group:', err);
		} finally {
			loading = false;
		}
	}

	async function loadMaps() {
		try {
			const userId = pb.authStore.record?.id;
			const result = await pb.collection('learningmaps').getList(1, 50, {
				filter: `teacher = "${userId}"`,
				sort: 'name'
			});
			learningMaps = result.items as unknown as LearningMap[];
		} catch (err) {
			console.error('Failed to load maps:', err);
		}
	}

	async function loadAssignments() {
		try {
			const result = await pb.collection('assignments').getList(1, 50, {
				filter: `group = "${groupId}"`,
				expand: 'learningmap'
			});
			assignments = result.items as any;
		} catch (err) {
			console.error('Failed to load assignments:', err);
		}
	}

	async function handleAddStudent() {
		try {
			addingStudent = true;
			const teacherId = pb.authStore.record?.id;
			const student = await createStudent(teacherId!);
			
			// Add student to group
			const updatedStudents = [...(group?.students || []), student.id];
			await pb.collection('groups').update(groupId, {
				students: updatedStudents
			});
			
			await loadGroup();
		} catch (err) {
			console.error('Failed to add student:', err);
			alert('Failed to add student');
		} finally {
			addingStudent = false;
		}
	}

	async function handleRemoveStudent(studentId: string) {
		if (!confirm('Are you sure you want to remove this student?')) {
			return;
		}

		try {
			const updatedStudents = (group?.students || []).filter(id => id !== studentId);
			await pb.collection('groups').update(groupId, {
				students: updatedStudents
			});
			
			await loadGroup();
		} catch (err) {
			console.error('Failed to remove student:', err);
			alert('Failed to remove student');
		}
	}

	async function handleAssignMap() {
		if (!selectedMapId) {
			alert('Please select a learning map');
			return;
		}

		try {
			assigningMap = true;
			const teacherId = pb.authStore.record?.id;
			
			await pb.collection('assignments').create({
				group: groupId,
				learningmap: selectedMapId,
				teacher: teacherId
			});
			
			selectedMapId = '';
			await loadAssignments();
		} catch (err) {
			console.error('Failed to assign map:', err);
			alert('Failed to assign map');
		} finally {
			assigningMap = false;
		}
	}

	async function handleUnassignMap(assignmentId: string) {
		if (!confirm('Are you sure you want to remove this assignment?')) {
			return;
		}

		try {
			await pb.collection('assignments').delete(assignmentId);
			await loadAssignments();
		} catch (err) {
			console.error('Failed to remove assignment:', err);
			alert('Failed to remove assignment');
		}
	}

	async function handlePrintCodes() {
		window.open(`/teacher/print/${groupId}`, '_blank');
	}
</script>

<div class="container mx-auto p-6">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-4xl font-bold">{group?.name || 'Loading...'}</h1>
		<a href="/teacher/groups" class="btn btn-ghost">Back to Groups</a>
	</div>

	{#if loading}
		<div class="flex justify-center items-center min-h-[400px]">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<!-- Students Section -->
		<div class="card bg-base-100 shadow-xl mb-6">
			<div class="card-body">
				<div class="flex justify-between items-center mb-4">
					<h2 class="card-title">Students ({students.length})</h2>
					<div class="flex gap-2">
						<button class="btn btn-sm btn-primary" onclick={handleAddStudent} disabled={addingStudent}>
							{addingStudent ? 'Adding...' : 'Add Student'}
						</button>
						{#if students.length > 0}
							<button class="btn btn-sm btn-secondary" onclick={handlePrintCodes}>
								Print QR Codes
							</button>
						{/if}
					</div>
				</div>

				{#if students.length === 0}
					<div class="alert alert-info">
						<span>No students in this group yet. Add students to get started!</span>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="table table-zebra">
							<thead>
								<tr>
									<th>Display Name</th>
									<th>Code</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each students as student}
									<tr>
										<td>{student.displayName}</td>
										<td><code class="font-mono">{student.code}</code></td>
										<td>
											<button
												class="btn btn-sm btn-error"
												onclick={() => handleRemoveStudent(student.id)}
											>
												Remove
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>

		<!-- Assignments Section -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title mb-4">Assigned Learning Maps ({assignments.length})</h2>

				<div class="form-control mb-4">
					<label class="label">
						<span class="label-text">Assign a Learning Map</span>
					</label>
					<div class="flex gap-2">
						<select class="select select-bordered flex-1" bind:value={selectedMapId} disabled={assigningMap}>
							<option value="">Select a learning map...</option>
							{#each learningMaps as map}
								<option value={map.id}>{map.name}</option>
							{/each}
						</select>
						<button class="btn btn-primary" onclick={handleAssignMap} disabled={!selectedMapId || assigningMap}>
							{assigningMap ? 'Assigning...' : 'Assign'}
						</button>
					</div>
				</div>

				{#if assignments.length === 0}
					<div class="alert alert-info">
						<span>No learning maps assigned to this group yet.</span>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="table table-zebra">
							<thead>
								<tr>
									<th>Learning Map</th>
									<th>Assigned</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each assignments as assignment}
									{@const map = (assignment as any).expand?.learningmap}
									<tr>
										<td>{map?.name || 'Unknown'}</td>
										<td>{new Date(assignment.created).toLocaleDateString()}</td>
										<td>
											<button
												class="btn btn-sm btn-error"
												onclick={() => handleUnassignMap(assignment.id)}
											>
												Unassign
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
