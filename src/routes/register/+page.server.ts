import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => {
	return {
		turnstileSiteKey: env.PUBLIC_TURNSTILE_SITE_KEY ?? ''
	};
};
