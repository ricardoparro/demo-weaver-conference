# Notebook App - React Frontend

A complete React frontend application for note-taking and organization, built with Vite and React 18.

## Features

### Core Functionality
- **15 Complete API Endpoints** - Full integration with backend API
- **3-Column Responsive Layout** - Sidebar, Note List, and Editor
- **Auto-save** - Debounced auto-save after 1 second of inactivity
- **Real-time Search** - Full-text search with debounced input
- **Keyboard Shortcuts** - Ctrl/Cmd+N for new notes
- **Tag Management** - Add and remove tags from notes
- **Favorites** - Mark notes as favorites
- **Trash System** - Soft delete with restore functionality

### Components

#### Sidebar.jsx (144 lines)
- Notebooks list with custom colors
- Create/delete notebooks
- Quick navigation (All Notes, Favorites, Trash)
- Active state highlighting

#### NoteList.jsx (106 lines)
- Display notes with title, preview, and metadata
- Date formatting (Today, Yesterday, relative dates)
- Tag badges
- Empty states
- Click to select notes

#### NoteEditor.jsx (201 lines)
- Title and content editing
- Auto-save with 1-second debounce
- Favorite toggle
- Tag management (add/remove)
- Delete functionality
- Trash restore
- Save indicator

#### SearchBar.jsx (51 lines)
- Real-time search with 300ms debounce
- Clear button
- Integrated with global search state

#### App.jsx (248 lines)
- Context API for state management
- API integration
- Error handling with user feedback
- Keyboard shortcuts
- View management (all, favorites, trash)

### API Service Layer (api.js - 108 lines)

All 15 endpoints implemented:

**Notebooks:**
- `fetchNotebooks()` - GET /api/notebooks
- `createNotebook(data)` - POST /api/notebooks
- `updateNotebook(id, data)` - PUT /api/notebooks/:id
- `deleteNotebook(id)` - DELETE /api/notebooks/:id

**Notes:**
- `fetchNotes(params)` - GET /api/notes
- `createNote(data)` - POST /api/notes
- `updateNote(id, data)` - PUT /api/notes/:id
- `deleteNote(id)` - DELETE /api/notes/:id
- `moveNote(id, notebookId)` - PUT /api/notes/:id/move

**Special Functions:**
- `searchNotes(query)` - GET /api/notes/search
- `fetchTags()` - GET /api/tags
- `fetchFavorites()` - GET /api/notes/favorites
- `fetchTrash()` - GET /api/notes/trash
- `restoreFromTrash(id)` - PUT /api/notes/:id/restore

### Styling (App.css - 605 lines)

- Modern, clean design with gradient header
- Responsive layout (desktop, tablet, mobile)
- Custom scrollbar styling
- Smooth transitions and hover effects
- Error banner with dismiss
- Loading states
- Empty states

## Project Structure

```
conference/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── api.js
    └── components/
        ├── Sidebar.jsx
        ├── NoteList.jsx
        ├── NoteEditor.jsx
        └── SearchBar.jsx
```

## Total Lines: ~1,463 lines

- App.jsx: 248 lines
- NoteEditor.jsx: 201 lines
- Sidebar.jsx: 144 lines
- api.js: 108 lines
- NoteList.jsx: 106 lines
- App.css: 605 lines
- SearchBar.jsx: 51 lines

## Getting Started

### Prerequisites
- Node.js 16+
- Backend API running on http://localhost:8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at http://localhost:3000

### Build for Production

```bash
npm run build
npm run preview
```

## Key Features Implementation

### State Management
Uses React Context API for global state:
- Notebooks list
- Notes list
- Current notebook/view selection
- Selected note
- Search query
- Loading and error states

### Auto-save
- Debounced auto-save with 1-second delay
- Only saves when there are actual changes
- Visual indicator when saving
- Uses `useRef` for timer management

### Keyboard Shortcuts
- `Ctrl+N` / `Cmd+N` - Create new note
- Prevents default browser behavior

### Responsive Design
- Desktop: 3-column layout (250px, 350px, 1fr)
- Tablet: Reduced column widths
- Mobile: Single column, editor-focused view

## API Integration

All API calls include:
- Proper HTTP methods (GET, POST, PUT, DELETE)
- JSON content-type headers
- Error handling with user-friendly messages
- Query parameter support
- Request body formatting

## Error Handling

- Global error banner with dismiss button
- Try-catch blocks for all API calls
- User-friendly error messages
- Console logging for debugging

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features
- CSS Grid and Flexbox

## Development

Built with:
- React 18.3.1
- Vite 5.4.0
- No external UI libraries (pure CSS)
- No state management libraries (Context API)

## License

MIT
