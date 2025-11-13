import { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';

function NoteEditor() {
  const {
    selectedNote,
    currentView,
    handleUpdateNote,
    handleDeleteNote,
    handleRestoreNote,
  } = useContext(AppContext);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const autoSaveTimerRef = useRef(null);

  // Update local state when selected note changes
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || '');
      setContent(selectedNote.content || '');
      setTags(selectedNote.tags || []);
      setIsFavorite(selectedNote.isFavorite || false);
      setHasChanges(false);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setIsFavorite(false);
      setHasChanges(false);
    }
  }, [selectedNote]);

  // Auto-save with debounce
  useEffect(() => {
    if (!selectedNote || !hasChanges) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for 1 second
    autoSaveTimerRef.current = setTimeout(() => {
      saveNote();
    }, 1000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, tags, isFavorite, hasChanges]);

  const saveNote = () => {
    if (!selectedNote) return;

    handleUpdateNote(selectedNote.id, {
      title,
      content,
      isFavorite,
    });
    setHasChanges(false);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setHasChanges(true);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      setHasChanges(true);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    setHasChanges(true);
  };

  const handleDelete = () => {
    if (!selectedNote) return;

    if (confirm('Are you sure you want to delete this note?')) {
      handleDeleteNote(selectedNote.id);
    }
  };

  const handleRestore = () => {
    if (!selectedNote) return;

    handleRestoreNote(selectedNote.id);
  };

  if (!selectedNote) {
    return (
      <div className="note-editor">
        <div className="empty-state">
          <h3>No note selected</h3>
          <p>Select a note from the list or create a new one</p>
        </div>
      </div>
    );
  }

  const isTrash = currentView === 'trash';

  return (
    <div className="note-editor">
      <div className="editor-toolbar">
        <button
          className={`btn-icon ${isFavorite ? 'active' : ''}`}
          onClick={toggleFavorite}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          disabled={isTrash}
        >
          {isFavorite ? '⭐' : '☆'}
        </button>
        {isTrash ? (
          <button className="btn-secondary" onClick={handleRestore}>
            Restore
          </button>
        ) : (
          <button className="btn-danger" onClick={handleDelete}>
            Delete
          </button>
        )}
        {hasChanges && <span className="save-indicator">Saving...</span>}
      </div>

      <input
        type="text"
        className="editor-title"
        placeholder="Note title"
        value={title}
        onChange={handleTitleChange}
        disabled={isTrash}
      />

      <textarea
        className="editor-content"
        placeholder="Start typing..."
        value={content}
        onChange={handleContentChange}
        disabled={isTrash}
      />

      <div className="editor-tags">
        <h4>Tags</h4>
        <div className="tags-list">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
              {!isTrash && (
                <button
                  className="tag-remove"
                  onClick={() => handleRemoveTag(tag)}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        {!isTrash && (
          <form className="tag-input-form" onSubmit={handleAddTag}>
            <input
              type="text"
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
            <button type="submit" className="btn-primary">Add</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default NoteEditor;
