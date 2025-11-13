const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const db = new Database(path.join(__dirname, 'notebook.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function createTables() {
  // Notebooks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notebooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `);

  // Notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notebookId INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      isFavorite INTEGER DEFAULT 0,
      isDeleted INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (notebookId) REFERENCES notebooks(id) ON DELETE CASCADE
    )
  `);

  // Tags table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // Note-Tags junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS note_tags (
      noteId INTEGER NOT NULL,
      tagId INTEGER NOT NULL,
      PRIMARY KEY (noteId, tagId),
      FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notes_notebookId ON notes(notebookId);
    CREATE INDEX IF NOT EXISTS idx_notes_isFavorite ON notes(isFavorite);
    CREATE INDEX IF NOT EXISTS idx_notes_isDeleted ON notes(isDeleted);
    CREATE INDEX IF NOT EXISTS idx_note_tags_noteId ON note_tags(noteId);
    CREATE INDEX IF NOT EXISTS idx_note_tags_tagId ON note_tags(tagId);
  `);

  console.log('Database tables created successfully');
}

// Seed initial data
function seedData() {
  // Check if data already exists
  const notebookCount = db.prepare('SELECT COUNT(*) as count FROM notebooks').get();

  if (notebookCount.count > 0) {
    console.log('Database already contains data, skipping seed');
    return;
  }

  console.log('Seeding database with initial data...');

  // Insert notebooks
  const insertNotebook = db.prepare('INSERT INTO notebooks (name, color) VALUES (?, ?)');

  const notebook1 = insertNotebook.run('Personal', '#FF6B6B');
  const notebook2 = insertNotebook.run('Work', '#4ECDC4');
  const notebook3 = insertNotebook.run('Ideas', '#FFE66D');

  // Insert notes
  const insertNote = db.prepare(`
    INSERT INTO notes (notebookId, title, content, isFavorite)
    VALUES (?, ?, ?, ?)
  `);

  insertNote.run(
    notebook1.lastInsertRowid,
    'Shopping List',
    'Need to buy:\n- Milk\n- Eggs\n- Bread\n- Coffee\n- Fruits',
    0
  );

  insertNote.run(
    notebook1.lastInsertRowid,
    'Vacation Plans',
    'Planning summer vacation:\n- Research destinations\n- Check flight prices\n- Book hotel\n- Create itinerary',
    1
  );

  insertNote.run(
    notebook2.lastInsertRowid,
    'Project Roadmap',
    'Q1 Goals:\n- Complete feature A\n- Refactor backend\n- Improve test coverage\n- Deploy to production',
    1
  );

  insertNote.run(
    notebook2.lastInsertRowid,
    'Meeting Notes',
    'Team meeting - Jan 15:\n- Discussed new features\n- Assigned tasks\n- Set deadlines\n- Next meeting: Jan 22',
    0
  );

  insertNote.run(
    notebook3.lastInsertRowid,
    'App Ideas',
    'Ideas for new apps:\n1. Recipe manager\n2. Habit tracker\n3. Budget planner\n4. Reading list organizer',
    0
  );

  insertNote.run(
    notebook3.lastInsertRowid,
    'Book Recommendations',
    'Books to read:\n- "Atomic Habits" by James Clear\n- "Deep Work" by Cal Newport\n- "The Pragmatic Programmer"',
    1
  );

  insertNote.run(
    notebook2.lastInsertRowid,
    'Code Snippets',
    'Useful code snippets:\n\n// Debounce function\nfunction debounce(func, wait) {\n  let timeout;\n  return function(...args) {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => func.apply(this, args), wait);\n  };\n}',
    0
  );

  // Insert some tags
  const insertTag = db.prepare('INSERT INTO tags (name) VALUES (?)');
  const tag1 = insertTag.run('important');
  const tag2 = insertTag.run('todo');
  const tag3 = insertTag.run('urgent');

  // Associate some tags with notes
  const insertNoteTag = db.prepare('INSERT INTO note_tags (noteId, tagId) VALUES (?, ?)');
  insertNoteTag.run(1, tag2.lastInsertRowid);
  insertNoteTag.run(3, tag1.lastInsertRowid);
  insertNoteTag.run(3, tag3.lastInsertRowid);
  insertNoteTag.run(4, tag2.lastInsertRowid);

  console.log('Database seeded successfully with sample data');
}

// Extract tags from content and update tags table
function extractAndSaveTags(noteId, content) {
  // Extract hashtags from content
  const tagMatches = content.match(/#[\w]+/g) || [];
  const tagNames = tagMatches.map(tag => tag.substring(1).toLowerCase());

  if (tagNames.length === 0) return;

  // Remove existing tags for this note
  db.prepare('DELETE FROM note_tags WHERE noteId = ?').run(noteId);

  // Insert or get tag IDs and associate with note
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
  const getTagId = db.prepare('SELECT id FROM tags WHERE name = ?');
  const insertNoteTag = db.prepare('INSERT INTO note_tags (noteId, tagId) VALUES (?, ?)');

  for (const tagName of tagNames) {
    insertTag.run(tagName);
    const tag = getTagId.get(tagName);
    if (tag) {
      insertNoteTag.run(noteId, tag.id);
    }
  }
}

// Initialize database
function initDatabase() {
  createTables();
  seedData();
}

module.exports = {
  db,
  initDatabase,
  extractAndSaveTags
};
