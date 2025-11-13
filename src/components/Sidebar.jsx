import { useContext, useState } from 'react';
import { AppContext } from '../App';

function Sidebar() {
  const {
    notebooks,
    currentNotebook,
    currentView,
    handleCreateNotebook,
    handleDeleteNotebook,
    handleSelectNotebook,
    handleSelectView,
  } = useContext(AppContext);

  const [isCreating, setIsCreating] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newNotebookColor, setNewNotebookColor] = useState('#3b82f6');

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newNotebookName.trim()) {
      handleCreateNotebook(newNotebookName.trim(), newNotebookColor);
      setNewNotebookName('');
      setNewNotebookColor('#3b82f6');
      setIsCreating(false);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Notebooks</h2>
        <button
          className="btn-icon"
          onClick={() => setIsCreating(!isCreating)}
          title="Create notebook"
        >
          +
        </button>
      </div>

      {isCreating && (
        <form className="notebook-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Notebook name"
            value={newNotebookName}
            onChange={(e) => setNewNotebookName(e.target.value)}
            autoFocus
          />
          <div className="color-picker">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-option ${newNotebookColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setNewNotebookColor(color)}
              />
            ))}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Create</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsCreating(false);
                setNewNotebookName('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="sidebar-section">
        <button
          className={`sidebar-item ${currentView === 'all' && !currentNotebook ? 'active' : ''}`}
          onClick={() => handleSelectView('all')}
        >
          <span className="icon">📄</span>
          <span>All Notes</span>
        </button>
        <button
          className={`sidebar-item ${currentView === 'favorites' ? 'active' : ''}`}
          onClick={() => handleSelectView('favorites')}
        >
          <span className="icon">⭐</span>
          <span>Favorites</span>
        </button>
        <button
          className={`sidebar-item ${currentView === 'trash' ? 'active' : ''}`}
          onClick={() => handleSelectView('trash')}
        >
          <span className="icon">🗑️</span>
          <span>Trash</span>
        </button>
      </div>

      <div className="sidebar-section">
        <h3>My Notebooks</h3>
        {notebooks.length === 0 ? (
          <p className="empty-message">No notebooks yet</p>
        ) : (
          notebooks.map((notebook) => (
            <div
              key={notebook.id}
              className={`notebook-item ${currentNotebook?.id === notebook.id ? 'active' : ''}`}
            >
              <button
                className="notebook-button"
                onClick={() => handleSelectNotebook(notebook)}
              >
                <span
                  className="notebook-color"
                  style={{ backgroundColor: notebook.color }}
                />
                <span className="notebook-name">{notebook.name}</span>
              </button>
              <button
                className="btn-icon-small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${notebook.name}"?`)) {
                    handleDeleteNotebook(notebook.id);
                  }
                }}
                title="Delete notebook"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;
