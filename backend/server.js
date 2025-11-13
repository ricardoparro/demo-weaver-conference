const express = require('express');
const cors = require('cors');
const { db, initDatabase, extractAndSaveTags } = require('./database');

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',  // Local Vite development
  'http://localhost:3000',  // Alternative local port
  process.env.FRONTEND_URL   // Production frontend URL from environment variable
].filter(Boolean); // Remove undefined values

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(express.json());

// Initialize database
initDatabase();

// Helper function to format dates
function formatNote(note) {
  return {
    ...note,
    isFavorite: Boolean(note.isFavorite),
    isDeleted: Boolean(note.isDeleted)
  };
}

// Error handler middleware
function errorHandler(res, error, defaultMessage = 'Internal server error') {
  console.error(error);
  res.status(500).json({ error: defaultMessage });
}

// Validation helpers
function validateNotebook(data) {
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    return 'Notebook name is required';
  }
  if (!data.color || typeof data.color !== 'string' || !data.color.match(/^#[0-9A-Fa-f]{6}$/)) {
    return 'Valid color hex code is required';
  }
  return null;
}

function validateNote(data) {
  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    return 'Note title is required';
  }
  if (data.notebookId && !Number.isInteger(Number(data.notebookId))) {
    return 'Valid notebook ID is required';
  }
  return null;
}

// ==================== NOTEBOOK ENDPOINTS ====================

// GET /api/notebooks - List all notebooks
app.get('/api/notebooks', (req, res) => {
  try {
    const notebooks = db.prepare(`
      SELECT
        n.*,
        COUNT(notes.id) as noteCount
      FROM notebooks n
      LEFT JOIN notes ON notes.notebookId = n.id AND notes.isDeleted = 0
      GROUP BY n.id
      ORDER BY n.createdAt DESC
    `).all();

    res.json(notebooks);
  } catch (error) {
    errorHandler(res, error, 'Failed to fetch notebooks');
  }
});

// POST /api/notebooks - Create notebook
app.post('/api/notebooks', (req, res) => {
  try {
    const validationError = validateNotebook(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { name, color } = req.body;

    const result = db.prepare(`
      INSERT INTO notebooks (name, color)
      VALUES (?, ?)
    `).run(name.trim(), color);

    const notebook = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(notebook);
  } catch (error) {
    errorHandler(res, error, 'Failed to create notebook');
  }
});

// PUT /api/notebooks/:id - Update notebook
app.put('/api/notebooks/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if notebook exists
    const existing = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    const validationError = validateNotebook(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { name, color } = req.body;

    db.prepare(`
      UPDATE notebooks
      SET name = ?, color = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).run(name.trim(), color, id);

    const notebook = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(id);

    res.json(notebook);
  } catch (error) {
    errorHandler(res, error, 'Failed to update notebook');
  }
});

// DELETE /api/notebooks/:id - Delete notebook
app.delete('/api/notebooks/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if notebook exists
    const existing = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    // Delete notebook (will cascade delete notes due to foreign key)
    db.prepare('DELETE FROM notebooks WHERE id = ?').run(id);

    res.json({ message: 'Notebook deleted successfully' });
  } catch (error) {
    errorHandler(res, error, 'Failed to delete notebook');
  }
});

// ==================== NOTE ENDPOINTS ====================

// GET /api/notes - List notes with optional filters
app.get('/api/notes', (req, res) => {
  try {
    const { notebookId, isFavorite, isDeleted } = req.query;

    let query = 'SELECT * FROM notes WHERE 1=1';
    const params = [];

    if (notebookId) {
      query += ' AND notebookId = ?';
      params.push(notebookId);
    }

    if (isFavorite !== undefined) {
      query += ' AND isFavorite = ?';
      params.push(isFavorite === 'true' ? 1 : 0);
    }

    if (isDeleted !== undefined) {
      query += ' AND isDeleted = ?';
      params.push(isDeleted === 'true' ? 1 : 0);
    } else {
      // By default, exclude deleted notes
      query += ' AND isDeleted = 0';
    }

    query += ' ORDER BY updatedAt DESC';

    const notes = db.prepare(query).all(...params);

    res.json(notes.map(formatNote));
  } catch (error) {
    errorHandler(res, error, 'Failed to fetch notes');
  }
});

// POST /api/notes - Create note
app.post('/api/notes', (req, res) => {
  try {
    const validationError = validateNote(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { notebookId, title, content = '' } = req.body;

    // Verify notebook exists
    const notebook = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(notebookId);
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    const result = db.prepare(`
      INSERT INTO notes (notebookId, title, content)
      VALUES (?, ?, ?)
    `).run(notebookId, title.trim(), content);

    const noteId = result.lastInsertRowid;

    // Extract and save tags
    extractAndSaveTags(noteId, content);

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);

    res.status(201).json(formatNote(note));
  } catch (error) {
    errorHandler(res, error, 'Failed to create note');
  }
});

// PUT /api/notes/:id - Update note
app.put('/api/notes/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if note exists
    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updates = [];
    const params = [];

    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return res.status(400).json({ error: 'Note title cannot be empty' });
      }
      updates.push('title = ?');
      params.push(req.body.title.trim());
    }

    if (req.body.content !== undefined) {
      updates.push('content = ?');
      params.push(req.body.content);

      // Extract and save tags when content is updated
      extractAndSaveTags(id, req.body.content);
    }

    if (req.body.isFavorite !== undefined) {
      updates.push('isFavorite = ?');
      params.push(req.body.isFavorite ? 1 : 0);
    }

    if (req.body.notebookId !== undefined) {
      // Verify notebook exists
      const notebook = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(req.body.notebookId);
      if (!notebook) {
        return res.status(404).json({ error: 'Notebook not found' });
      }
      updates.push('notebookId = ?');
      params.push(req.body.notebookId);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push("updatedAt = datetime('now')");
    params.push(id);

    db.prepare(`
      UPDATE notes
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...params);

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);

    res.json(formatNote(note));
  } catch (error) {
    errorHandler(res, error, 'Failed to update note');
  }
});

// DELETE /api/notes/:id - Soft delete note
app.delete('/api/notes/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if note exists
    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }

    db.prepare(`
      UPDATE notes
      SET isDeleted = 1, updatedAt = datetime('now')
      WHERE id = ?
    `).run(id);

    res.json({ message: 'Note moved to trash' });
  } catch (error) {
    errorHandler(res, error, 'Failed to delete note');
  }
});

// POST /api/notes/:id/move - Move note to different notebook
app.post('/api/notes/:id/move', (req, res) => {
  try {
    const { id } = req.params;
    const { notebookId } = req.body;

    // Check if note exists
    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Verify notebook exists
    const notebook = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(notebookId);
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    db.prepare(`
      UPDATE notes
      SET notebookId = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).run(notebookId, id);

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);

    res.json(formatNote(note));
  } catch (error) {
    errorHandler(res, error, 'Failed to move note');
  }
});

// ==================== SEARCH & FILTER ENDPOINTS ====================

// GET /api/search?q=query - Full-text search
app.get('/api/search', (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = `%${q.trim()}%`;

    const notes = db.prepare(`
      SELECT * FROM notes
      WHERE (title LIKE ? OR content LIKE ?)
      AND isDeleted = 0
      ORDER BY updatedAt DESC
    `).all(searchTerm, searchTerm);

    res.json(notes.map(formatNote));
  } catch (error) {
    errorHandler(res, error, 'Search failed');
  }
});

// GET /api/tags - List all tags with usage counts
app.get('/api/tags', (req, res) => {
  try {
    const tags = db.prepare(`
      SELECT
        t.id,
        t.name,
        COUNT(nt.noteId) as count
      FROM tags t
      LEFT JOIN note_tags nt ON nt.tagId = t.id
      LEFT JOIN notes n ON n.id = nt.noteId AND n.isDeleted = 0
      GROUP BY t.id
      HAVING count > 0
      ORDER BY count DESC, t.name ASC
    `).all();

    res.json(tags);
  } catch (error) {
    errorHandler(res, error, 'Failed to fetch tags');
  }
});

// GET /api/favorites - List favorite notes
app.get('/api/favorites', (req, res) => {
  try {
    const notes = db.prepare(`
      SELECT * FROM notes
      WHERE isFavorite = 1 AND isDeleted = 0
      ORDER BY updatedAt DESC
    `).all();

    res.json(notes.map(formatNote));
  } catch (error) {
    errorHandler(res, error, 'Failed to fetch favorites');
  }
});

// GET /api/trash - List deleted notes
app.get('/api/trash', (req, res) => {
  try {
    const notes = db.prepare(`
      SELECT * FROM notes
      WHERE isDeleted = 1
      ORDER BY updatedAt DESC
    `).all();

    res.json(notes.map(formatNote));
  } catch (error) {
    errorHandler(res, error, 'Failed to fetch trash');
  }
});

// POST /api/trash/:id/restore - Restore note from trash
app.post('/api/trash/:id/restore', (req, res) => {
  try {
    const { id } = req.params;

    // Check if note exists and is deleted
    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (!existing.isDeleted) {
      return res.status(400).json({ error: 'Note is not in trash' });
    }

    db.prepare(`
      UPDATE notes
      SET isDeleted = 0, updatedAt = datetime('now')
      WHERE id = ?
    `).run(id);

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);

    res.json(formatNote(note));
  } catch (error) {
    errorHandler(res, error, 'Failed to restore note');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET    /api/notebooks');
  console.log('  POST   /api/notebooks');
  console.log('  PUT    /api/notebooks/:id');
  console.log('  DELETE /api/notebooks/:id');
  console.log('  GET    /api/notes');
  console.log('  POST   /api/notes');
  console.log('  PUT    /api/notes/:id');
  console.log('  DELETE /api/notes/:id');
  console.log('  POST   /api/notes/:id/move');
  console.log('  GET    /api/search?q=query');
  console.log('  GET    /api/tags');
  console.log('  GET    /api/favorites');
  console.log('  GET    /api/trash');
  console.log('  POST   /api/trash/:id/restore');
  console.log('  GET    /api/health');
});

module.exports = app;
