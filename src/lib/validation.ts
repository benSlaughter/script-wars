const NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9 _-]{0,18}[a-zA-Z0-9]$/;
const MIN_LENGTH = 2;
const MAX_LENGTH = 20;

export function validateDisplayName(name: string): { valid: boolean; error?: string } {
	const trimmed = name.trim();

	if (trimmed.length < MIN_LENGTH) {
		return { valid: false, error: `Name must be at least ${MIN_LENGTH} characters` };
	}

	if (trimmed.length > MAX_LENGTH) {
		return { valid: false, error: `Name must be at most ${MAX_LENGTH} characters` };
	}

	if (!NAME_REGEX.test(trimmed)) {
		return {
			valid: false,
			error: 'Name can only contain letters, numbers, spaces, hyphens, and underscores'
		};
	}

	return { valid: true };
}
