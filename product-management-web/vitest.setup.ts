import { beforeAll, vi } from 'vitest';

beforeAll(() => {
	// simple uuid mock for tests
	if (!('crypto' in globalThis)) {
		// @ts-ignore
		globalThis.crypto = {};
	}
	// @ts-ignore
	if (!globalThis.crypto.randomUUID) {
		// @ts-ignore
		globalThis.crypto.randomUUID = () => '00000000-0000-4000-8000-000000000000';
	}

	if (!globalThis.fetch) {
		// provide a default fetch mock (tests will stub per suite)
		// @ts-ignore
		globalThis.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ items: [] }), text: async () => '' }));
	}
});
