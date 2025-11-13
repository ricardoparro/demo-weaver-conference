import { createContext, useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import SearchBar from './components/SearchBar';
import * as api from './api';

// Create Context
export const AppContext = createContext();

function App() {
  const [notebooks, setNotebooks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [currentNotebook, setCurrentNotebook] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [currentView, setCurrentView] = useState('all'); // 'all', 'favorites', 'trash'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load notebooks on mount
  useEffect(() => {
    loadNotebooks();
  }, []);

  // Load notes when notebook or view changes
  useEffect(() => {
    if (searchQuery) return; // Don't load if searching
    loadNotes();
  }, [currentNotebook, currentView]);

  const loadNotebooks = async () => {
    try {
      setLoading(true);
      const data = await api.fetchNotebooks();
      setNotebooks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notebooks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      setLoading(true);
      let data;

      if (currentView === 'favorites') {
        data = await api.fetchFavorites();
      } else if (currentView === 'trash') {
        data = await api.fetchTrash();
      } else if (currentNotebook) {
        data = await api.fetchNotes({ notebookId: currentNotebook.id });
      } else {
        data = await api.fetchNotes();
      }

      setNotes(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      loadNotes();
      return;
    }

    try {
      setLoading(true);
      const data = await api.searchNotes(query);
      setNotes(data);
      setError(null);
    } catch (err) {
      setError('Search failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotebook = async (name, color) => {
    try {
      const newNotebook = await api.createNotebook({ name, color });
      setNotebooks([...notebooks, newNotebook]);
      setError(null);
    } catch (err) {
      setError('Failed to create notebook');
      console.error(err);
    }
  };

  const handleDeleteNotebook = async (id) => {
    try {
      await api.deleteNotebook(id);
      setNotebooks(notebooks.filter(nb => nb.id !== id));
      if (currentNotebook?.id === id) {
        setCurrentNotebook(null);
      }
      setError(null);
    } catch (err) {
      setError('Failed to delete notebook');
      console.error(err);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await api.createNote({
        title: 'Untitled Note',
        content: '',
        notebookId: currentNotebook?.id || 1, // Default to first notebook
      });
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setError(null);
    } catch (err) {
      setError('Failed to create note');
      console.error(err);
    }
  };

  const handleUpdateNote = async (id, updates) => {
    try {
      const updatedNote = await api.updateNote(id, updates);
      setNotes(notes.map(note => note.id === id ? updatedNote : note));
      setSelectedNote(updatedNote);
      setError(null);
    } catch (err) {
      setError('Failed to update note');
      console.error(err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await api.deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
      setError(null);
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
    }
  };

  const handleRestoreNote = async (id) => {
    try {
      await api.restoreFromTrash(id);
      setNotes(notes.filter(note => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
      loadNotes();
      setError(null);
    } catch (err) {
      setError('Failed to restore note');
      console.error(err);
    }
  };

  const handleSelectNotebook = (notebook) => {
    setCurrentNotebook(notebook);
    setCurrentView('all');
    setSearchQuery('');
    setSelectedNote(null);
  };

  const handleSelectView = (view) => {
    setCurrentView(view);
    setCurrentNotebook(null);
    setSearchQuery('');
    setSelectedNote(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentNotebook, notes]);

  const contextValue = {
    notebooks,
    notes,
    currentNotebook,
    selectedNote,
    currentView,
    searchQuery,
    loading,
    error,
    setSelectedNote,
    handleSearch,
    handleCreateNotebook,
    handleDeleteNotebook,
    handleCreateNote,
    handleUpdateNote,
    handleDeleteNote,
    handleRestoreNote,
    handleSelectNotebook,
    handleSelectView,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app">
        <div className="app-header">
          <h1>Notebook App</h1>
          <SearchBar />
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="app-container">
          <Sidebar />
          <NoteList />
          <NoteEditor />
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
