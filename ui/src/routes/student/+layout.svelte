<script lang="ts">
	import { goto } from '$app/navigation';
	import { logout, getCurrentUser } from '$lib/auth';

	let { children } = $props();
	
	const user = getCurrentUser();

	function handleLogout() {
		logout();
		goto('/student/login');
	}
</script>

<div class="navbar bg-base-100 shadow-sm">
	<div class="navbar-start">
		<a href="/student/dashboard" class="btn btn-ghost text-xl">LearningMap</a>
	</div>
	<div class="navbar-end gap-2">
		<div class="text-sm">
			Welcome, <strong>{user?.displayName}</strong>
		</div>
		<button class="btn btn-sm" onclick={handleLogout}>Logout</button>
	</div>
</div>

{@render children()}
