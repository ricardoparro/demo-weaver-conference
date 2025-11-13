import { db } from './db.js';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  // Debug logging
  console.log('Notes by ID handler:', {
    method: req.method,
    id: id,
    query: req.query,
    url: req.url,
    body: req.body
  });

  try {
    if (!id) {
      return res.status(400).json({ error: 'Note ID is required' });
    }

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

      console.log('Updating note:', id, 'with:', updates);

      const note = db.updateNote(id, updates);
      if (!note) {
        // Provide more context in error
        const allNotes = db.getAllNotes({ isDeleted: false });
        console.error('Failed to update note. Available note IDs:', allNotes.map(n => n.id));
        return res.status(404).json({
          error: 'Note not found',
          id: id,
          availableNotes: allNotes.length,
          message: 'The note may have been deleted or the data was reset. Try refreshing the page.'
        });
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