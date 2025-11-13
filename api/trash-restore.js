import { db } from './db.js';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract note ID from query parameters
  // URL format: /api/trash-restore?id=123
  const { id } = req.query;

  try {
    if (!id) {
      return res.status(400).json({ error: 'Note ID is required' });
    }

    const note = db.restoreNote(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found or not in trash' });
    }

    return res.status(200).json(note);
  } catch (error) {
    console.error('Restore API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}