<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	$effect(() => {
		void goto(resolve('/games/rps/scripts/new'));
	});
</script>

<p>Redirecting...</p>
