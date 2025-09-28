import React, { useMemo, useState } from 'react';
import { z } from 'zod';

const productSchema = z.object({
	name: z.string().min(1, 'Product name is required'),
	brand: z.string().optional(),
	type: z.string().optional(),
	warrantyPeriodMonths: z
		.union([z.coerce.number().int().min(0).max(120), z.literal('')])
		.optional()
		.transform((v) => (v === '' ? undefined : (v as number))),
	startDate: z.string().optional(),
	serialNumber: z.string().optional(),
	notes: z.string().optional(),
});

type ProductInput = z.infer<typeof productSchema>;

type Product = {
	id: string;
	name: string;
	brand?: string | null;
	type?: string | null;
	warrantyPeriodMonths?: number | null;
	startDate?: string | null;
	serialNumber?: string | null;
	notes?: string | null;
	createdAt?: string;
	updatedAt?: string;
};

const defaultValues: ProductInput = {
	name: '',
	brand: '',
	type: '',
	warrantyPeriodMonths: undefined,
	startDate: '',
	serialNumber: '',
	notes: '',
};

const userIdStorageKey = 'demo-user-id';

function getOrCreateUserId(): string {
	const existing = localStorage.getItem(userIdStorageKey);
	if (existing) return existing;
	const id = crypto.randomUUID();
	localStorage.setItem(userIdStorageKey, id);
	return id;
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const userId = getOrCreateUserId();
    // In development, use localhost. In production, use the deployed server URL
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    // Explicitly set the correct API base URL
    const base = (import.meta as any)?.env?.VITE_API_BASE_URL || 
        (isDev ? 'http://localhost:4000' : 'https://product-management-server-zeta.vercel.app');
    
    const url = path.startsWith('http') ? path : `${base}${path}`;
    
    console.log('API Request:', { url, path, base, isDev, env: (import.meta as any)?.env?.VITE_API_BASE_URL }); // Debug logging
    
    const res = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			'X-User-Id': userId,
			...(options.headers || {}),
		},
	});
	
	console.log('API Response:', { status: res.status, statusText: res.statusText, url }); // Debug logging
	
	if (!res.ok) {
		const text = await res.text();
		console.error('API Error:', { status: res.status, text, url }); // Debug logging
		throw new Error(text || `${res.status} ${res.statusText}`);
	}
	return res.json();
}

export function App(): JSX.Element {
	const [values, setValues] = useState<ProductInput>(defaultValues);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [busy, setBusy] = useState(false);
	const [toast, setToast] = useState<string | null>(null);
	const [list, setList] = useState<Product[]>([]);
	const [apiError, setApiError] = useState<string | null>(null);

	const canSubmit = useMemo(() => {
		return !busy;
	}, [busy]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setValues((v) => ({ ...v, [name]: value }));
	};

	const validate = (input: ProductInput) => {
		const result = productSchema.safeParse(input);
		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			for (const [key, val] of Object.entries(result.error.flatten().fieldErrors)) {
				if (val && val.length) fieldErrors[key] = val[0] as string;
			}
			setErrors(fieldErrors);
			return false;
		}
		setErrors({});
		return true;
	};

	const refreshList = async () => {
		try {
			setApiError(null);
			const data = await api<any>('/api/products');
			const items: Product[] = Array.isArray(data) ? data : data?.items ?? [];
			setList(items);
		} catch (e: any) {
			setApiError(e.message || 'Failed to load products');
		}
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate(values)) return;
		setBusy(true);
		try {
			await api<{ id: string }>('/api/products', {
				method: 'POST',
				body: JSON.stringify(values),
			});
			setToast('Product saved');
			setValues(defaultValues);
			await refreshList();
		} catch (err: any) {
			setToast(err.message || 'Failed to save');
		} finally {
			setBusy(false);
			setTimeout(() => setToast(null), 3000);
		}
	};

	React.useEffect(() => {
		refreshList();
	}, []);

	return (
		<div className="container">
			<h1>Product Manager</h1>
			<form className="card" onSubmit={onSubmit} noValidate>
				<div className="grid">
					<label>
						<span>Product Name *</span>
						<input name="name" value={values.name} onChange={handleChange} placeholder={'e.g., Laptop 14"'} required />
						{errors.name && <em className="error">{errors.name}</em>}
					</label>
					<label>
						<span>Brand</span>
						<input name="brand" value={values.brand} onChange={handleChange} placeholder="e.g., Lenovo" />
					</label>
					<label>
						<span>Type</span>
						<input name="type" value={values.type} onChange={handleChange} placeholder="e.g., Laptop" />
					</label>
					<label>
						<span>Warranty (months)</span>
						<input name="warrantyPeriodMonths" value={(values.warrantyPeriodMonths as any) ?? ''} onChange={handleChange} inputMode="numeric" pattern="[0-9]*" placeholder="0-120" />
					</label>
					<label>
						<span>Start Date</span>
						<input type="date" name="startDate" value={values.startDate} onChange={handleChange} />
					</label>
					<label>
						<span>Serial Number</span>
						<input name="serialNumber" value={values.serialNumber} onChange={handleChange} />
					</label>
					<label className="col-span-2">
						<span>Notes</span>
						<textarea name="notes" value={values.notes} onChange={handleChange} rows={3} />
					</label>
				</div>
				<div className="actions">
					<button type="submit" disabled={!canSubmit}>{busy ? 'Saving…' : 'Confirm'}</button>
				</div>
			</form>

			<div className="list">
				<h2>Recent Products</h2>
				{apiError && <p className="error">{apiError}</p>}
				{!apiError && (list.length === 0 ? (
					<p className="muted">No products yet.</p>
				) : (
					<ul>
						{list.map((p) => (
							<li key={p.id}>
								<strong>{p.name}</strong>
								<span className="dim">{p.brand || '—'}</span>
								<span className="dim">{p.type || '—'}</span>
								<span className="dim">{p.warrantyPeriodMonths ?? '—'} months</span>
								<span className="dim">{p.startDate || '—'}</span>
							</li>
						))}
					</ul>
				))}
			</div>

			{toast && <div className="toast">{toast}</div>}
		</div>
	);
}
