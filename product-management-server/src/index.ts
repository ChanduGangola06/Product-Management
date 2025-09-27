import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const isMockMode = !process.env.DATABASE_URL;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        headers: req.headers,
        body: req.body,
        query: req.query
    });
    next();
});

// Schemas
const productInputSchema = z.object({
    name: z.string().min(1),
    brand: z.string().optional().or(z.literal('')),
    type: z.string().optional().or(z.literal('')),
    warrantyPeriodMonths: z.coerce.number().int().min(0).max(120).optional(),
    startDate: z.string().optional().or(z.literal('')),
    serialNumber: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
});

const listQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

// Health route is always available
app.get('/health', (_req: Request, res: Response) => {
    res.json({ ok: true, mode: isMockMode ? 'mock' : 'db' });
});

if (isMockMode) {
    // In-memory mock store for local dev without a database
    console.warn('DATABASE_URL not set. Running API in MOCK MODE with in-memory storage.');
    type Product = {
        id: string;
        userId: string;
        name: string;
        brand: string | null;
        type: string | null;
        warrantyPeriodMonths: number | null;
        startDate: string | null;
        serialNumber: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
    const products: Product[] = [];

    const getUserId = async (req: Request): Promise<string | null> => {
        const userId = req.header('X-User-Id');
        if (!userId) return null;
        return userId;
    };

    app.get('/api/products', async (req: Request, res: Response) => {
        const userId = await getUserId(req);
        if (!userId) return res.status(401).json({ error: 'Missing X-User-Id' });
        const { limit, offset } = listQuerySchema.parse(req.query);
        const all = products.filter(p => p.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const slice = all.slice(offset, offset + limit);
        res.json({
            items: slice.map(p => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                type: p.type,
                warrantyPeriodMonths: p.warrantyPeriodMonths ?? null,
                startDate: p.startDate,
                serialNumber: p.serialNumber,
                notes: p.notes,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
            })),
            total: all.length,
            limit,
            offset,
        });
    });

    app.get('/api/products/:id', async (req: Request, res: Response) => {
        const userId = await getUserId(req);
        if (!userId) return res.status(401).json({ error: 'Missing X-User-Id' });
        const { id } = req.params as { id: string };
        const found = products.find(p => p.id === id && p.userId === userId);
        if (!found) return res.status(404).json({ error: 'Not found' });
        res.json(found);
    });

    app.post('/api/products', async (req: Request, res: Response) => {
        const userId = await getUserId(req);
        if (!userId) return res.status(401).json({ error: 'Missing X-User-Id' });
        const parse = productInputSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
        }
        const input = parse.data;
        const now = new Date();
        const id = randomUUID();
        products.unshift({
            id,
            userId,
            name: input.name,
            brand: input.brand || null,
            type: input.type || null,
            warrantyPeriodMonths: input.warrantyPeriodMonths ?? null,
            startDate: input.startDate || null,
            serialNumber: input.serialNumber || null,
            notes: input.notes || null,
            createdAt: now,
            updatedAt: now,
        });
        res.status(201).json({ id });
    });
} else {
    // Initialize Postgres (Neon-compatible)
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    async function migrate(): Promise<void> {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT
        );`);

        await pool.query(`CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            name TEXT NOT NULL,
            brand TEXT,
            type TEXT,
            warranty_period_months INTEGER,
            start_date DATE,
            serial_number TEXT,
            notes TEXT,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL
        );`);

        await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);`);
    }

    // Only run migration if not in mock mode
    if (!isMockMode) {
        await migrate();
    }

    // Simple auth via header
    async function ensureUser(userId: string): Promise<void> {
        await pool.query('INSERT INTO users (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [userId, null]);
    }

    const getUserId = async (req: Request): Promise<string | null> => {
        const userId = req.header('X-User-Id');
        if (!userId) return null;
        await ensureUser(userId);
        return userId;
    };

    // Routes backed by Postgres
    app.get('/api/products', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = await getUserId(req);
            if (!userId) return res.status(401).json({ error: 'Missing X-User-Id' });
            const { limit, offset } = listQuerySchema.parse(req.query);
            const { rows } = await pool.query(
                `SELECT id, name, brand, type, warranty_period_months AS "warrantyPeriodMonths", to_char(start_date, 'YYYY-MM-DD') AS "startDate", serial_number AS "serialNumber", notes, created_at AS "createdAt", updated_at AS "updatedAt"
                 FROM products WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
                [userId, limit, offset]
            );
            const total = (await pool.query('SELECT COUNT(*)::int AS count FROM products WHERE user_id = $1', [userId])).rows[0].count as number;
            res.json({ items: rows, total, limit, offset });
        } catch (err) {
            next(err);
        }
    });

    app.get('/api/products/:id', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = await getUserId(req);
            if (!userId) return res.status(401).json({ error: 'Missing X-User-Id' });
            const { id } = req.params as { id: string };
            const { rows } = await pool.query(
                `SELECT id, name, brand, type, warranty_period_months AS "warrantyPeriodMonths", to_char(start_date, 'YYYY-MM-DD') AS "startDate", serial_number AS "serialNumber", notes, created_at AS "createdAt", updated_at AS "updatedAt"
                 FROM products WHERE id = $1 AND user_id = $2`,
                [id, userId]
            );
            if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
            res.json(rows[0]);
        } catch (err) {
            next(err);
        }
    });

    app.post('/api/products', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = await getUserId(req);
            if (!userId) return res.status(401).json({ error: 'Missing X-User-Id' });
            const parse = productInputSchema.safeParse(req.body);
            if (!parse.success) {
                return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
            }
            const input = parse.data;
            const now = new Date();
            const id = randomUUID();
            await pool.query(
                `INSERT INTO products (id, user_id, name, brand, type, warranty_period_months, start_date, serial_number, notes, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    id,
                    userId,
                    input.name,
                    input.brand || null,
                    input.type || null,
                    input.warrantyPeriodMonths ?? null,
                    input.startDate || null,
                    input.serialNumber || null,
                    input.notes || null,
                    now,
                    now,
                ]
            );
            res.status(201).json({ id });
        } catch (err) {
            next(err);
        }
    });
}

// 404 handler for unknown API routes
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Route not found' });
    }
    next();
});

// Central error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
});

if (process.env.VERCEL !== '1') {
    app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
    });
}

export default app;


