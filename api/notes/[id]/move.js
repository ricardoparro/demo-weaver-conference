import { db } from '../../db.js';

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

  const { id } = req.query;
  const { notebookId } = req.body;

  try {
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId is required' });
    }

    const note = db.moveNote(id, notebookId);
    if (!note) {
      return res.status(404).json({ error: 'Note or notebook not found' });
    }

    return res.status(200).json(note);
  } catch (error) {
    console.error('Move note API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}