import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { App } from './App';

const mockFetch = (ok = true, body: any = {}): any =>
	vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = typeof input === 'string' ? input : input.toString();
		if (url.endsWith('/api/products') && (!init || init.method === 'GET')) {
			return { ok: true, json: async () => ({ items: [] }), text: async () => '' } as any;
		}
		if (url.endsWith('/api/products') && init?.method === 'POST') {
			return { ok, json: async () => ({ id: 'id-1' }), text: async () => '' } as any;
		}
		return { ok: true, json: async () => body, text: async () => '' } as any;
	});

describe('App', () => {
	beforeEach(() => {
		// @ts-ignore
		global.fetch = mockFetch();
		localStorage.clear();
	});

	it('renders form fields', () => {
		render(<App />);
		expect(screen.getByText('Product Manager')).toBeInTheDocument();
		expect(screen.getByText('Product Name *')).toBeInTheDocument();
	});

	it('validates required name', async () => {
		render(<App />);
		fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
		await waitFor(() => {
			expect(screen.getByText('Product name is required')).toBeInTheDocument();
		});
	});

	it('submits and shows toast', async () => {
		// @ts-ignore
		global.fetch = mockFetch(true, { items: [] });
		render(<App />);
		fireEvent.change(screen.getByPlaceholderText('e.g., Laptop 14"'), { target: { value: 'My Laptop' } });
		fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
		await waitFor(() => {
			expect(screen.getByText('Product saved')).toBeInTheDocument();
		});
	});
});
