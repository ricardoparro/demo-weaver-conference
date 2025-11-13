// Database configuration for Vercel deployment
// Using in-memory storage for demo (resets on each deployment)
// For production, use Vercel KV, Postgres, or external database

let notebooks = [
  { id: 1, name: 'Personal', color: '#FF6B6B', createdAt: new Date().toISOString() },
  { id: 2, name: 'Work', color: '#4ECDC4', createdAt: new Date().toISOString() },
  { id: 3, name: 'Ideas', color: '#95E1D3', createdAt: new Date().toISOString() }
];

let notes = [
  {
    id: 1,
    notebookId: 1,
    title: 'Welcome to your Notebook!',
    content: 'This is your first note. Start writing and organize your thoughts!\n\n#welcome #tutorial',
    isFavorite: true,
    isDeleted: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    notebookId: 2,
    title: 'Meeting Notes',
    content: 'Team sync discussion points:\n- Project timeline\n- Resource allocation\n- Next steps\n\n#meeting #important',
    isFavorite: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    notebookId: 3,
    title: 'App Ideas',
    content: 'Potential features to add:\n- Dark mode\n- Export to PDF\n- Collaboration\n\n#ideas #todo',
    isFavorite: true,
    isDeleted: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let nextNoteId = 4;
let nextNotebookId = 4;

// Helper function to extract tags from content
function extractTags(content) {
  const tagRegex = /#(\w+)/g;
  const tags = [];
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    tags.push(match[1].toLowerCase());
  }
  return [...new Set(tags)]; // Remove duplicates
}

// Database functions
export const db = {
  // Notebooks
  getAllNotebooks: () => notebooks,

  getNotebook: (id) => notebooks.find(n => n.id === parseInt(id)),

  createNotebook: (data) => {
    const notebook = {
      id: nextNotebookId++,
      name: data.name,
      color: data.color || '#95E1D3',
      createdAt: new Date().toISOString()
    };
    notebooks.push(notebook);
    return notebook;
  },

  updateNotebook: (id, data) => {
    const index = notebooks.findIndex(n => n.id === parseInt(id));
    if (index === -1) return null;
    notebooks[index] = { ...notebooks[index], ...data };
    return notebooks[index];
  },

  deleteNotebook: (id) => {
    const index = notebooks.findIndex(n => n.id === parseInt(id));
    if (index === -1) return false;
    // Delete all notes in this notebook
    notes = notes.filter(n => n.notebookId !== parseInt(id));
    notebooks.splice(index, 1);
    return true;
  },

  // Notes
  getAllNotes: (filters = {}) => {
    let filteredNotes = [...notes];

    if (filters.notebookId) {
      filteredNotes = filteredNotes.filter(n => n.notebookId === parseInt(filters.notebookId));
    }
    if (filters.isFavorite !== undefined) {
      filteredNotes = filteredNotes.filter(n => n.isFavorite === (filters.isFavorite === 'true'));
    }
    if (filters.isDeleted !== undefined) {
      filteredNotes = filteredNotes.filter(n => n.isDeleted === (filters.isDeleted === 'true'));
    } else {
      // By default, don't show deleted notes
      filteredNotes = filteredNotes.filter(n => !n.isDeleted);
    }

    return filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  getNote: (id) => notes.find(n => n.id === parseInt(id)),

  createNote: (data) => {
    const note = {
      id: nextNoteId++,
      notebookId: data.notebookId,
      title: data.title || 'Untitled',
      content: data.content || '',
      isFavorite: data.isFavorite || false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notes.push(note);
    return note;
  },

  updateNote: (id, data) => {
    const index = notes.findIndex(n => n.id === parseInt(id));
    if (index === -1) return null;

    const updatedNote = {
      ...notes[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    notes[index] = updatedNote;
    return updatedNote;
  },

  deleteNote: (id) => {
    const index = notes.findIndex(n => n.id === parseInt(id));
    if (index === -1) return false;
    notes[index].isDeleted = true;
    notes[index].updatedAt = new Date().toISOString();
    return true;
  },

  moveNote: (id, notebookId) => {
    const note = notes.find(n => n.id === parseInt(id));
    if (!note) return null;
    const notebook = notebooks.find(n => n.id === parseInt(notebookId));
    if (!notebook) return null;

    note.notebookId = parseInt(notebookId);
    note.updatedAt = new Date().toISOString();
    return note;
  },

  restoreNote: (id) => {
    const note = notes.find(n => n.id === parseInt(id));
    if (!note || !note.isDeleted) return null;
    note.isDeleted = false;
    note.updatedAt = new Date().toISOString();
    return note;
  },

  searchNotes: (query) => {
    const searchTerm = query.toLowerCase();
    return notes
      .filter(n => !n.isDeleted)
      .filter(n =>
        n.title.toLowerCase().includes(searchTerm) ||
        n.content.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  getTags: () => {
    const tagCount = {};
    notes
      .filter(n => !n.isDeleted)
      .forEach(note => {
        const tags = extractTags(note.content);
        tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });

    return Object.entries(tagCount).map(([name, count]) => ({
      name,
      count
    }));
  },

  getFavorites: () => {
    return notes
      .filter(n => n.isFavorite && !n.isDeleted)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  getTrash: () => {
    return notes
      .filter(n => n.isDeleted)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
};