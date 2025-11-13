import { useContext } from 'react';
import { AppContext } from '../App';

function NoteList() {
  const {
    notes,
    selectedNote,
    currentNotebook,
    currentView,
    loading,
    setSelectedNote,
    handleCreateNote,
  } = useContext(AppContext);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPreview = (content) => {
    if (!content) return 'No content';
    return content.slice(0, 100) + (content.length > 100 ? '...' : '');
  };

  const getTitle = () => {
    if (currentView === 'favorites') return 'Favorites';
    if (currentView === 'trash') return 'Trash';
    if (currentNotebook) return currentNotebook.name;
    return 'All Notes';
  };

  return (
    <div className="note-list">
      <div className="note-list-header">
        <h2>{getTitle()}</h2>
        {currentView !== 'trash' && (
          <button
            className="btn-icon"
            onClick={handleCreateNote}
            title="New note (Ctrl+N)"
          >
            +
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <p>No notes yet</p>
          {currentView !== 'trash' && (
            <button className="btn-primary" onClick={handleCreateNote}>
              Create your first note
            </button>
          )}
        </div>
      ) : (
        <div className="notes-container">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`note-item ${selectedNote?.id === note.id ? 'active' : ''}`}
              onClick={() => setSelectedNote(note)}
            >
              <div className="note-item-header">
                <h3>{note.title || 'Untitled'}</h3>
                {note.isFavorite && <span className="favorite-badge">⭐</span>}
              </div>
              <p className="note-preview">{getPreview(note.content)}</p>
              <div className="note-item-footer">
                <span className="note-date">{formatDate(note.updatedAt)}</span>
                {note.tags && note.tags.length > 0 && (
                  <div className="note-tags">
                    {note.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className="tag">+{note.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NoteList;
