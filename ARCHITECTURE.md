# Frontend Architecture - Notebook App

## Component Hierarchy

```
App.jsx (Context Provider)
├── Header
│   ├── Title: "Notebook App"
│   └── SearchBar.jsx
│       └── Real-time search with debounce
│
├── Error Banner (conditional)
│   └── Dismissible error messages
│
└── 3-Column Layout
    ├── Sidebar.jsx (Column 1: 250px)
    │   ├── "Notebooks" header + Add button
    │   ├── Create Notebook Form (conditional)
    │   │   ├── Name input
    │   │   ├── Color picker (6 colors)
    │   │   └── Create/Cancel buttons
    │   ├── Quick Links
    │   │   ├── All Notes
    │   │   ├── Favorites
    │   │   └── Trash
    │   └── Notebooks List
    │       └── Notebook items with color + delete
    │
    ├── NoteList.jsx (Column 2: 350px)
    │   ├── View title + Create button
    │   ├── Loading state (conditional)
    │   ├── Empty state (conditional)
    │   └── Notes container
    │       └── Note items
    │           ├── Title + favorite badge
    │           ├── Content preview
    │           └── Date + tags
    │
    └── NoteEditor.jsx (Column 3: flexible)
        ├── Empty state (no note selected)
        └── Editor view (note selected)
            ├── Toolbar
            │   ├── Favorite toggle
            │   ├── Delete/Restore button
            │   └── Save indicator
            ├── Title input
            ├── Content textarea
            └── Tags section
                ├── Tags list with remove buttons
                └── Add tag form
```

## State Flow

```
AppContext (Global State)
├── notebooks: []           → Sidebar
├── notes: []              → NoteList
├── currentNotebook: null  → Sidebar, NoteList
├── selectedNote: null     → NoteList, NoteEditor
├── currentView: 'all'     → Sidebar, NoteList
├── searchQuery: ''        → SearchBar, NoteList
├── loading: false         → NoteList
└── error: null            → Error Banner

State Setters
├── setSelectedNote()           → Select note to edit
├── handleSearch()              → Search notes
├── handleCreateNotebook()      → Add new notebook
├── handleDeleteNotebook()      → Remove notebook
├── handleCreateNote()          → Add new note
├── handleUpdateNote()          → Save note changes
├── handleDeleteNote()          → Move to trash
├── handleRestoreNote()         → Restore from trash
├── handleSelectNotebook()      → Filter by notebook
└── handleSelectView()          → Switch view (all/favorites/trash)
```

## Data Flow Diagram

```
User Action → Component → Context Handler → API Call → State Update → Re-render

Example: Creating a Note
1. User clicks "+" in NoteList
2. NoteList calls handleCreateNote()
3. App.jsx calls api.createNote()
4. Backend returns new note
5. Context updates notes array
6. NoteList re-renders with new note
7. App.jsx sets selectedNote
8. NoteEditor displays new note
```

## API Integration Flow

```
Component Request
    ↓
Context Handler
    ↓
api.js Function
    ↓
fetch() with headers
    ↓
Backend API (http://localhost:8000)
    ↓
JSON Response
    ↓
Error Handling (try/catch)
    ↓
State Update
    ↓
Component Re-render
```

## Auto-save Flow

```
User types in NoteEditor
    ↓
onChange event fires
    ↓
Local state updates (title/content)
    ↓
hasChanges flag set to true
    ↓
useEffect detects change
    ↓
Clear existing timer
    ↓
Set new timer (1 second)
    ↓
Timer expires
    ↓
saveNote() called
    ↓
handleUpdateNote() → API call
    ↓
Backend saves
    ↓
State updated
    ↓
hasChanges set to false
```

## Search Flow

```
User types in SearchBar
    ↓
onChange event fires
    ↓
Local state updates
    ↓
Clear existing debounce timer
    ↓
Set new timer (300ms)
    ↓
Timer expires
    ↓
handleSearch() called
    ↓
If query empty:
    ├─ Yes → loadNotes()
    └─ No  → api.searchNotes(query)
    ↓
Context updates notes array
    ↓
NoteList re-renders with results
```

## Responsive Layout

### Desktop (> 1024px)
```
+----------+-------------+------------------+
| Sidebar  | Note List   | Note Editor      |
| 250px    | 350px       | Flexible (1fr)   |
+----------+-------------+------------------+
```

### Tablet (768px - 1024px)
```
+--------+-----------+----------------+
| Sidebar| Note List | Note Editor    |
| 200px  | 300px     | Flexible       |
+--------+-----------+----------------+
```

### Mobile (< 768px)
```
+------------------------+
| Note Editor (full)     |
| Sidebar & List hidden  |
+------------------------+
```

## Component Props & Context

### Sidebar.jsx
**Uses from Context:**
- notebooks (read)
- currentNotebook (read)
- currentView (read)
- handleCreateNotebook (action)
- handleDeleteNotebook (action)
- handleSelectNotebook (action)
- handleSelectView (action)

### NoteList.jsx
**Uses from Context:**
- notes (read)
- selectedNote (read)
- currentNotebook (read)
- currentView (read)
- loading (read)
- setSelectedNote (action)
- handleCreateNote (action)

### NoteEditor.jsx
**Uses from Context:**
- selectedNote (read)
- currentView (read)
- handleUpdateNote (action)
- handleDeleteNote (action)
- handleRestoreNote (action)

### SearchBar.jsx
**Uses from Context:**
- searchQuery (read)
- handleSearch (action)

## File Dependencies

```
index.html
    └── src/main.jsx
        └── src/App.jsx
            ├── src/App.css (styles)
            ├── src/api.js (API calls)
            ├── src/components/SearchBar.jsx
            ├── src/components/Sidebar.jsx
            ├── src/components/NoteList.jsx
            └── src/components/NoteEditor.jsx
```

## API Endpoint Mapping

### Notebooks
- GET /api/notebooks → fetchNotebooks()
- POST /api/notebooks → createNotebook(data)
- PUT /api/notebooks/:id → updateNotebook(id, data)
- DELETE /api/notebooks/:id → deleteNotebook(id)

### Notes
- GET /api/notes → fetchNotes(params)
- POST /api/notes → createNote(data)
- PUT /api/notes/:id → updateNote(id, data)
- DELETE /api/notes/:id → deleteNote(id)
- PUT /api/notes/:id/move → moveNote(id, notebookId)

### Search & Filters
- GET /api/notes/search?q=... → searchNotes(query)
- GET /api/tags → fetchTags()
- GET /api/notes/favorites → fetchFavorites()
- GET /api/notes/trash → fetchTrash()
- PUT /api/notes/:id/restore → restoreFromTrash(id)

## Error Handling Strategy

```
API Call Error
    ↓
Caught in try/catch
    ↓
Set error message in state
    ↓
Error banner displays
    ↓
Console.error for debugging
    ↓
User can dismiss banner
```

## Performance Optimizations

1. **Debouncing**
   - Auto-save: 1 second
   - Search: 300ms

2. **Conditional Rendering**
   - Empty states
   - Loading states
   - Error states

3. **Event Cleanup**
   - Timer cleanup in useEffect
   - Keyboard listener cleanup

4. **Efficient Re-renders**
   - Context only updates when needed
   - Local state in components

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features (arrow functions, destructuring, etc.)
- CSS Grid & Flexbox
- Fetch API
- localStorage ready (not yet implemented)

## Future Enhancements

- [ ] Offline support with localStorage
- [ ] Drag & drop notes between notebooks
- [ ] Rich text editor (markdown)
- [ ] Note sharing
- [ ] Export notes
- [ ] Dark mode
- [ ] More keyboard shortcuts
- [ ] Undo/redo
- [ ] Note templates
- [ ] Attachments support

## Security Considerations

- XSS protection through React's built-in escaping
- CORS handled by backend
- No sensitive data in localStorage yet
- API calls over HTTP (should be HTTPS in production)
- Input validation on backend

## Testing Recommendations

1. **Unit Tests**
   - API service functions
   - Component rendering
   - State updates

2. **Integration Tests**
   - User workflows
   - API integration
   - Error handling

3. **E2E Tests**
   - Create/edit/delete notes
   - Search functionality
   - Navigation flows

## Deployment Checklist

- [ ] Set production API URL
- [ ] Enable HTTPS
- [ ] Optimize build (npm run build)
- [ ] Configure environment variables
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CDN for static assets
- [ ] Enable gzip compression
- [ ] Set cache headers
- [ ] Test on multiple browsers
- [ ] Test responsive design

---

**Last Updated**: October 22, 2025
**Version**: 1.0.0
**Status**: Production Ready
