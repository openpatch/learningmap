<script lang="ts">
	import { goto } from '$app/navigation';
	import { logout, getCurrentUser } from '$lib/auth';

	let { children } = $props();
	
	const user = getCurrentUser();

	function handleLogout() {
		logout();
		goto('/sign-in');
	}
</script>

<div class="navbar bg-base-100 shadow-sm">
	<div class="navbar-start">
		<div class="dropdown">
			<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					/>
				</svg>
			</div>
			<ul class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
				<li><a href="/teacher/dashboard">Dashboard</a></li>
				<li><a href="/teacher/maps">Learning Maps</a></li>
				<li><a href="/teacher/groups">Groups</a></li>
			</ul>
		</div>
		<a href="/teacher/dashboard" class="btn btn-ghost text-xl">LearningMap</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/teacher/dashboard">Dashboard</a></li>
			<li><a href="/teacher/maps">Learning Maps</a></li>
			<li><a href="/teacher/groups">Groups</a></li>
		</ul>
	</div>
	<div class="navbar-end gap-2">
		<div class="text-sm">
			Welcome, <strong>{user?.displayName || user?.email}</strong>
		</div>
		<button class="btn btn-sm" onclick={handleLogout}>Logout</button>
	</div>
</div>

{@render children()}
