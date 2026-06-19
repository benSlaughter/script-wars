import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { startScheduler } from '$lib/server/scheduler';
import type { Handle } from '@sveltejs/kit';

// Start hourly tournament scheduler on server boot
startScheduler();

export const handle: Handle = async ({ event, resolve }) => {
	return svelteKitHandler({ event, resolve, auth });
};
