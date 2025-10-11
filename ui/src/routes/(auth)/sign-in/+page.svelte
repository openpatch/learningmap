<script lang="ts">
	import { goto } from '$app/navigation';
	import { loginTeacher } from '$lib/auth';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleTeacherLogin() {
		if (!email || !password) {
			error = 'Please enter both email and password';
			return;
		}

		loading = true;
		error = '';

		try {
			await loginTeacher(email, password);
			goto('/teacher/dashboard');
		} catch (err: any) {
			error = err.message || 'Login failed. Please check your credentials.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="hero bg-base-200 min-h-screen">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">Teacher Login</h1>
			<p class="py-6">
				Sign in with your teacher account to create and manage learning maps, groups, and assignments.
			</p>
			<div class="divider">OR</div>
			<p class="text-sm">
				Are you a student? <a href="/student/login" class="link link-primary">Login with your code</a>
			</p>
		</div>
		<div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
			<form class="card-body" onsubmit={(e) => { e.preventDefault(); handleTeacherLogin(); }}>
				<fieldset class="fieldset" disabled={loading}>
					<label class="fieldset-label" for="email">Email</label>
					<input
						type="email"
						id="email"
						class="input"
						placeholder="teacher@example.com"
						bind:value={email}
						required
					/>
					<label class="fieldset-label" for="password">Password</label>
					<input
						type="password"
						id="password"
						class="input"
						placeholder="Password"
						bind:value={password}
						required
					/>
					{#if error}
						<div class="alert alert-error mt-2">
							<span>{error}</span>
						</div>
					{/if}
					<button type="submit" class="btn btn-neutral mt-4" disabled={loading}>
						{loading ? 'Logging in...' : 'Login'}
					</button>
				</fieldset>
			</form>
		</div>
	</div>
</div>
