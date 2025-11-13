import { db } from './db.js';

// Consolidated notes handler for all operations
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, action, notebookId } = req.query;

  try {
    // Handle special actions
    if (action === 'move' && id) {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      if (!notebookId) {
        return res.status(400).json({ error: 'notebookId is required' });
      }

      const note = db.moveNote(id, notebookId);
      if (!note) {
        return res.status(404).json({ error: 'Note or notebook not found' });
      }

      return res.status(200).json(note);
    }

    // Handle operations on specific note (with ID)
    if (id) {
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
    }
    // Handle operations on notes collection (no ID)
    else {
      if (req.method === 'GET') {
        const notes = db.getAllNotes(req.query);
        return res.status(200).json(notes);
      }

      if (req.method === 'POST') {
        const { notebookId: nbId, title, content, isFavorite } = req.body;

        if (!nbId) {
          return res.status(400).json({ error: 'notebookId is required' });
        }

        const notebook = db.getNotebook(nbId);
        if (!notebook) {
          return res.status(400).json({ error: 'Invalid notebook ID' });
        }

        const note = db.createNote({
          notebookId: nbId,
          title: title || 'Untitled',
          content: content || '',
          isFavorite: isFavorite || false
        });

        return res.status(201).json(note);
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notes API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}