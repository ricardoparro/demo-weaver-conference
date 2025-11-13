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
      const note = db.getNote(id);
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
      return res.status(200).json(note);
    }

    if (req.method === 'PUT') {
      const { title, content, isFavorite, tags } = req.body;
      const updates = {};

      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (isFavorite !== undefined) updates.isFavorite = isFavorite;
      if (tags !== undefined) updates.tags = tags;

      const note = db.updateNote(id, updates);
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
      return res.status(200).json(note);
    }

    if (req.method === 'DELETE') {
      const success = db.deleteNote(id);
      if (!success) {
        return res.status(404).json({ error: 'Note not found' });
      }
      return res.status(200).json({ message: 'Note moved to trash' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Note API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}