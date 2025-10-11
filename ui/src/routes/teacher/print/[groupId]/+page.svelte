<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import pb from '$lib/pocketbase';
	import type { Group, User } from '$lib/types';
	import { generateQRCode } from '$lib/utils/qr';

	let groupId = $derived($page.params.groupId);
	let group = $state<Group & { expand?: { students?: User[] } } | null>(null);
	let students = $state<User[]>([]);
	let qrCodes = $state<Record<string, string>>({});
	let loading = $state(true);

	onMount(async () => {
		await loadGroup();
		await generateQRCodes();
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
		}
	}

	async function generateQRCodes() {
		try {
			const codes: Record<string, string> = {};
			const baseUrl = window.location.origin;
			
			for (const student of students) {
				if (student.code) {
					const loginUrl = `${baseUrl}/student/login?code=${student.code}`;
					const qrDataUrl = await generateQRCode(loginUrl);
					codes[student.id] = qrDataUrl;
				}
			}
			
			qrCodes = codes;
		} catch (err) {
			console.error('Failed to generate QR codes:', err);
		} finally {
			loading = false;
		}
	}

	function handlePrint() {
		window.print();
	}
</script>

<svelte:head>
	<title>Print Student Codes - {group?.name}</title>
</svelte:head>

<style>
	@media print {
		.no-print {
			display: none;
		}
		
		.print-page {
			page-break-after: always;
		}
		
		.print-card {
			break-inside: avoid;
		}
	}
</style>

<div class="container mx-auto p-6">
	<div class="no-print mb-8 flex justify-between items-center">
		<h1 class="text-3xl font-bold">Student Login Codes - {group?.name}</h1>
		<div class="flex gap-2">
			<button class="btn btn-primary" onclick={handlePrint}>Print</button>
			<a href="/teacher/groups/{groupId}" class="btn btn-ghost">Back to Group</a>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center items-center min-h-[400px]">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if students.length === 0}
		<div class="alert alert-info no-print">
			<span>No students in this group yet.</span>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each students as student}
				<div class="card bg-base-100 shadow-xl border-2 border-gray-200 print-card">
					<div class="card-body items-center text-center">
						<h2 class="card-title text-2xl mb-4">{student.displayName}</h2>
						
						{#if qrCodes[student.id]}
							<img src={qrCodes[student.id]} alt="QR Code for {student.displayName}" class="w-64 h-64" />
						{/if}
						
						<div class="divider">OR</div>
						
						<div class="text-center">
							<p class="text-sm text-gray-600 mb-2">Enter this code:</p>
							<p class="text-4xl font-mono font-bold">{student.code}</p>
						</div>
						
						<div class="mt-4 text-sm text-gray-500">
							<p>Scan the QR code or enter the code at:</p>
							<p class="font-mono">{window.location.origin}/student/login</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
