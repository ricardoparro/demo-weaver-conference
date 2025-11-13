import { db } from './db.js';

// Consolidated notebooks handler for all operations
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
    // Handle operations on specific notebook (with ID)
    if (id) {
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
    }
    // Handle operations on notebooks collection (no ID)
    else {
      if (req.method === 'GET') {
        const notebooks = db.getAllNotebooks();
        return res.status(200).json(notebooks);
      }

      if (req.method === 'POST') {
        const { name, color } = req.body;

        if (!name || name.trim().length === 0) {
          return res.status(400).json({ error: 'Name is required' });
        }

        const notebook = db.createNotebook({ name: name.trim(), color });
        return res.status(201).json(notebook);
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notebooks API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}