import { db } from '../db.js';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const notebook = db.getNotebook(id);
      if (!notebook) {
        return res.status(404).json({ error: 'Notebook not found' });
      }
      return res.status(200).json(notebook);
    }

    if (req.method === 'PUT') {
      const { name, color } = req.body;
      const updates = {};

      if (name !== undefined) {
        if (name.trim().length === 0) {
          return res.status(400).json({ error: 'Name cannot be empty' });
        }
        updates.name = name.trim();
      }
      if (color !== undefined) {
        updates.color = color;
      }

      const notebook = db.updateNotebook(id, updates);
      if (!notebook) {
        return res.status(404).json({ error: 'Notebook not found' });
      }
      return res.status(200).json(notebook);
    }

    if (req.method === 'DELETE') {
      const success = db.deleteNotebook(id);
      if (!success) {
        return res.status(404).json({ error: 'Notebook not found' });
      }
      return res.status(200).json({ message: 'Notebook deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notebook API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}