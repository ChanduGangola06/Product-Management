import { z } from 'zod';
import { randomUUID } from 'crypto';

// Mock storage for demo
const products = [];

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

export default function handler(req, res) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Missing X-User-Id' });
  }

  if (req.method === 'GET') {
    try {
      const { limit, offset } = listQuerySchema.parse(req.query);
      const userProducts = products
        .filter(p => p.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const slice = userProducts.slice(offset, offset + limit);
      
      return res.json({
        items: slice.map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          type: p.type,
          warrantyPeriodMonths: p.warrantyPeriodMonths,
          startDate: p.startDate,
          serialNumber: p.serialNumber,
          notes: p.notes,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
        total: userProducts.length,
        limit,
        offset,
      });
    } catch (err) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const parse = productInputSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
      }
      
      const input = parse.data;
      const now = new Date();
      const id = randomUUID();
      
      const product = {
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
      };
      
      products.unshift(product);
      return res.status(201).json({ id });
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
