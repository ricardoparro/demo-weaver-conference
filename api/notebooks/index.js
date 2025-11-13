import { db } from '../db.js';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notebooks API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}