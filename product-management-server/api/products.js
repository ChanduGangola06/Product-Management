export default function handler(req, res) {
  if (req.method === 'GET') {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Missing X-User-Id' });
    }
    return res.json({ items: [], total: 0, limit: 20, offset: 0 });
  }
  
  if (req.method === 'POST') {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Missing X-User-Id' });
    }
    return res.status(201).json({ id: 'mock-id' });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
