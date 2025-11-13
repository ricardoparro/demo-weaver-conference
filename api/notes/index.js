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
      const notes = db.getAllNotes(req.query);
      return res.status(200).json(notes);
    }

    if (req.method === 'POST') {
      const { notebookId, title, content, isFavorite } = req.body;

      if (!notebookId) {
        return res.status(400).json({ error: 'notebookId is required' });
      }

      const notebook = db.getNotebook(notebookId);
      if (!notebook) {
        return res.status(400).json({ error: 'Invalid notebook ID' });
      }

      const note = db.createNote({
        notebookId,
        title: title || 'Untitled',
        content: content || '',
        isFavorite: isFavorite || false
      });

      return res.status(201).json(note);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notes API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}