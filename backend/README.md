# Notebook App Backend API

A complete Node.js/Express REST API backend for a notebook application with SQLite database.

## Features

- Full CRUD operations for notebooks and notes
- Soft delete with trash/restore functionality
- Favorites system
- Full-text search
- Tag extraction and management
- Input validation and error handling
- CORS enabled for frontend integration
- Seeded database with sample data

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with better-sqlite3
- **CORS**: cors middleware

## Installation

```bash
cd backend
npm install
npm start
```

The server will start on `http://localhost:3000`

## Database Schema

### Notebooks Table
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `color` (TEXT NOT NULL)
- `createdAt` (TEXT)
- `updatedAt` (TEXT)

### Notes Table
- `id` (INTEGER PRIMARY KEY)
- `notebookId` (INTEGER, FOREIGN KEY)
- `title` (TEXT NOT NULL)
- `content` (TEXT)
- `isFavorite` (INTEGER, 0 or 1)
- `isDeleted` (INTEGER, 0 or 1)
- `createdAt` (TEXT)
- `updatedAt` (TEXT)

### Tags Table
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT UNIQUE)

### Note_Tags Junction Table
- `noteId` (INTEGER, FOREIGN KEY)
- `tagId` (INTEGER, FOREIGN KEY)

## API Endpoints

### Notebooks (4 endpoints)

#### GET /api/notebooks
List all notebooks with note counts.

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Personal",
    "color": "#FF6B6B",
    "createdAt": "2025-10-22 14:07:28",
    "updatedAt": "2025-10-22 14:07:28",
    "noteCount": 2
  }
]
```

#### POST /api/notebooks
Create a new notebook.

**Request Body**:
```json
{
  "name": "Work",
  "color": "#4ECDC4"
}
```

**Response**: `201 Created`
```json
{
  "id": 2,
  "name": "Work",
  "color": "#4ECDC4",
  "createdAt": "2025-10-22 14:07:28",
  "updatedAt": "2025-10-22 14:07:28"
}
```

**Validation Errors**: `400 Bad Request`
- Missing name: `{"error": "Notebook name is required"}`
- Invalid color: `{"error": "Valid color hex code is required"}`

#### PUT /api/notebooks/:id
Update an existing notebook.

**Request Body**:
```json
{
  "name": "Updated Name",
  "color": "#123456"
}
```

**Response**: `200 OK` - Returns updated notebook
**Errors**: `404 Not Found` if notebook doesn't exist

#### DELETE /api/notebooks/:id
Delete a notebook (cascades to notes).

**Response**: `200 OK`
```json
{
  "message": "Notebook deleted successfully"
}
```

**Errors**: `404 Not Found` if notebook doesn't exist

---

### Notes (5 endpoints)

#### GET /api/notes
List notes with optional filtering.

**Query Parameters**:
- `notebookId` - Filter by notebook
- `isFavorite` - Filter favorites (true/false)
- `isDeleted` - Include deleted notes (true/false, default: false)

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "notebookId": 1,
    "title": "Shopping List",
    "content": "Need to buy:\n- Milk\n- Eggs",
    "isFavorite": false,
    "isDeleted": false,
    "createdAt": "2025-10-22 14:07:28",
    "updatedAt": "2025-10-22 14:07:28"
  }
]
```

#### POST /api/notes
Create a new note.

**Request Body**:
```json
{
  "notebookId": 1,
  "title": "My Note",
  "content": "Note content here"
}
```

**Response**: `201 Created` - Returns created note

**Validation Errors**: `400 Bad Request`
- Missing title: `{"error": "Note title is required"}`
- Invalid notebookId: `{"error": "Valid notebook ID is required"}`

**Errors**: `404 Not Found` if notebook doesn't exist

#### PUT /api/notes/:id
Update an existing note.

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "isFavorite": true,
  "notebookId": 2
}
```

**Response**: `200 OK` - Returns updated note

**Errors**:
- `404 Not Found` if note doesn't exist
- `404 Not Found` if target notebook doesn't exist
- `400 Bad Request` if title is empty

#### DELETE /api/notes/:id
Soft delete a note (moves to trash).

**Response**: `200 OK`
```json
{
  "message": "Note moved to trash"
}
```

**Errors**: `404 Not Found` if note doesn't exist

#### POST /api/notes/:id/move
Move a note to a different notebook.

**Request Body**:
```json
{
  "notebookId": 2
}
```

**Response**: `200 OK` - Returns updated note

**Errors**:
- `404 Not Found` if note doesn't exist
- `404 Not Found` if target notebook doesn't exist

---

### Search & Filters (6 endpoints)

#### GET /api/search?q=query
Full-text search across note titles and content.

**Query Parameters**:
- `q` - Search query (required)

**Response**: `200 OK` - Returns array of matching notes

**Errors**: `400 Bad Request` if query is missing

#### GET /api/tags
List all tags with usage counts.

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "important",
    "count": 3
  }
]
```

#### GET /api/favorites
List all favorite notes (not deleted).

**Response**: `200 OK` - Returns array of favorite notes

#### GET /api/trash
List all deleted notes.

**Response**: `200 OK` - Returns array of deleted notes

#### POST /api/trash/:id/restore
Restore a note from trash.

**Response**: `200 OK` - Returns restored note

**Errors**:
- `404 Not Found` if note doesn't exist
- `400 Bad Request` if note is not in trash

#### GET /api/health
Health check endpoint.

**Response**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T14:07:28.000Z"
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation errors
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server errors

## Sample Data

The database is seeded with:
- 3 notebooks (Personal, Work, Ideas)
- 7 notes across different notebooks
- 3 favorite notes
- 3 tags with associations

## CORS Configuration

CORS is enabled for:
- Origin: `http://localhost:5173` (Vite development server)
- Methods: GET, POST, PUT, DELETE
- Headers: Content-Type

## Development

### Start Development Server
```bash
npm run dev
```

### File Structure
```
backend/
├── server.js       # Main Express server (482 lines)
├── database.js     # Database setup and seed data (194 lines)
├── package.json    # Dependencies
├── notebook.db     # SQLite database (auto-generated)
└── README.md       # This file
```

## Testing

Manual testing examples:

```bash
# Get all notebooks
curl http://localhost:3000/api/notebooks

# Create a notebook
curl -X POST http://localhost:3000/api/notebooks \
  -H "Content-Type: application/json" \
  -d '{"name":"My Notebook","color":"#FF0000"}'

# Get all notes
curl http://localhost:3000/api/notes

# Create a note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"notebookId":1,"title":"Test Note","content":"Content here"}'

# Search notes
curl "http://localhost:3000/api/search?q=vacation"

# Get favorites
curl http://localhost:3000/api/favorites

# Delete a note (soft delete)
curl -X DELETE http://localhost:3000/api/notes/1

# Get trash
curl http://localhost:3000/api/trash

# Restore from trash
curl -X POST http://localhost:3000/api/trash/1/restore
```

## Total Implementation

- **Total Lines**: 676 lines of code (excluding package.json)
  - server.js: 482 lines
  - database.js: 194 lines
- **API Endpoints**: 15 total
  - Notebooks: 4
  - Notes: 5
  - Search & Filters: 6
- **Database Tables**: 4
- **Features**: Complete validation, error handling, CORS, seeded data
