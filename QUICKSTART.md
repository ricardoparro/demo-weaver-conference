# Quick Start Guide - Notebook App

## Prerequisites
- Node.js 16+ installed
- Backend API running (see backend/README.md)

## Installation & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will automatically open at **http://localhost:3000**

### 3. Using the App

#### Create a Notebook
1. Click the **+** button next to "Notebooks" in the sidebar
2. Enter a name and choose a color
3. Click "Create"

#### Create a Note
1. Select a notebook (or use "All Notes")
2. Click the **+** button in the note list header
3. Or press **Ctrl+N** (Windows/Linux) or **Cmd+N** (Mac)

#### Edit a Note
1. Click on a note in the list
2. Edit the title and content
3. Changes are auto-saved after 1 second

#### Add Tags
1. Select a note
2. Scroll to the "Tags" section at the bottom
3. Type a tag name and click "Add"
4. Remove tags by clicking the **×** button

#### Mark as Favorite
1. Select a note
2. Click the **☆** button in the toolbar
3. View all favorites from the sidebar

#### Search Notes
1. Type in the search bar at the top
2. Results appear in real-time
3. Click **×** to clear search

#### Delete a Note
1. Select a note
2. Click the "Delete" button
3. Find deleted notes in "Trash"

#### Restore from Trash
1. Click "Trash" in the sidebar
2. Select a deleted note
3. Click "Restore"

## API Configuration

The app connects to the backend at `http://localhost:8000/api`

To change the API URL, edit `src/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## Build for Production

```bash
npm run build
npm run preview
```

Build files will be in the `dist/` directory.

## Troubleshooting

### "Failed to load notebooks" error
- Ensure the backend server is running on port 8000
- Check the console for CORS errors
- Verify the API is accessible at http://localhost:8000/api/notebooks

### Port 3000 already in use
Edit `vite.config.js` to change the port:
```javascript
server: {
  port: 3001,  // Change to any available port
}
```

### Changes not auto-saving
- Check the browser console for errors
- Ensure you've selected a note before editing
- Look for the "Saving..." indicator in the toolbar

## Keyboard Shortcuts

- **Ctrl+N** / **Cmd+N** - Create new note
- More shortcuts coming soon!

## Features Checklist

- [x] 15 API endpoints integrated
- [x] 3-column responsive layout
- [x] Auto-save (1 second debounce)
- [x] Real-time search (300ms debounce)
- [x] Notebooks with colors
- [x] Tags management
- [x] Favorites
- [x] Trash with restore
- [x] Keyboard shortcuts
- [x] Error handling
- [x] Loading states
- [x] Empty states
- [x] Responsive design

## Support

For issues or questions, check:
1. Browser console for errors
2. Network tab for API call failures
3. Backend logs for server-side issues
