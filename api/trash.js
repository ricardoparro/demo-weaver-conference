import { db } from './db.js';

// Consolidated trash handler
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, action } = req.query;

  try {
    // Handle restore action
    if (action === 'restore' && id) {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const note = db.restoreNote(id);
      if (!note) {
        return res.status(404).json({ error: 'Note not found or not in trash' });
      }

      return res.status(200).json(note);
    }

    // Handle GET trash list
    if (req.method === 'GET' && !id) {
      const trashedNotes = db.getTrash();
      return res.status(200).json(trashedNotes);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Trash API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}