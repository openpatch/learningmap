<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { loginStudent } from '$lib/auth';

	let code = $state('');
	let error = $state('');
	let loading = $state(false);

	onMount(() => {
		// Check if code is provided in query parameter
		const codeParam = $page.url.searchParams.get('code');
		if (codeParam) {
			code = codeParam.toUpperCase();
			// Auto-submit if code is valid
			if (code.length === 6) {
				handleStudentLogin();
			}
		}
	});

	async function handleStudentLogin() {
		if (!code) {
			error = 'Please enter your student code';
			return;
		}

		loading = true;
		error = '';

		try {
			await loginStudent(code.toUpperCase());
			goto('/student/dashboard');
		} catch (err: any) {
			error = err.message || 'Invalid student code. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="hero bg-base-200 min-h-screen">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">Student Login</h1>
			<p class="py-6">
				Enter the 6-character code provided by your teacher to access your learning maps.
			</p>
			<div class="divider">OR</div>
			<p class="text-sm">
				Are you a teacher? <a href="/sign-in" class="link link-primary">Login with email</a>
			</p>
		</div>
		<div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
			<form class="card-body" onsubmit={(e) => { e.preventDefault(); handleStudentLogin(); }}>
				<fieldset class="fieldset" disabled={loading}>
					<label class="fieldset-label" for="code">Student Code</label>
					<input
						type="text"
						id="code"
						class="input input-lg text-center font-mono text-2xl uppercase"
						placeholder="ABC123"
						bind:value={code}
						maxlength="6"
						pattern="[A-Za-z0-9]{6}"
						required
						oninput={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase(); }}
					/>
					{#if error}
						<div class="alert alert-error mt-2">
							<span>{error}</span>
						</div>
					{/if}
					<button type="submit" class="btn btn-primary mt-4" disabled={loading}>
						{loading ? 'Logging in...' : 'Login'}
					</button>
				</fieldset>
			</form>
		</div>
	</div>
</div>
