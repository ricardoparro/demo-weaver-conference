// API routes are now served from the same domain (Vercel Functions)
const API_BASE_URL = '/api';
console.log('API v1.0.1 - Using query parameter routes');

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Notebook API functions
export async function fetchNotebooks() {
  return apiCall('/notebooks');
}

export async function createNotebook(data) {
  return apiCall('/notebooks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateNotebook(id, data) {
  return apiCall(`/notebooks-by-id?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteNotebook(id) {
  return apiCall(`/notebooks-by-id?id=${id}`, {
    method: 'DELETE',
  });
}

// Note API functions
export async function fetchNotes(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.notebookId) queryParams.append('notebookId', params.notebookId);
  if (params.isFavorite !== undefined) queryParams.append('isFavorite', params.isFavorite);
  if (params.isDeleted !== undefined) queryParams.append('isDeleted', params.isDeleted);

  const queryString = queryParams.toString();
  return apiCall(`/notes${queryString ? `?${queryString}` : ''}`);
}

export async function createNote(data) {
  return apiCall('/notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateNote(id, data) {
  return apiCall(`/notes-by-id?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteNote(id) {
  return apiCall(`/notes-by-id?id=${id}`, {
    method: 'DELETE',
  });
}

export async function moveNote(id, notebookId) {
  return apiCall(`/notes-move?id=${id}&notebookId=${notebookId}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

// Search API function
export async function searchNotes(query) {
  const queryParams = new URLSearchParams({ q: query });
  return apiCall(`/search?${queryParams.toString()}`);
}

// Tags API function
export async function fetchTags() {
  return apiCall('/tags');
}

// Favorites API function
export async function fetchFavorites() {
  return apiCall('/favorites');
}

// Trash API functions
export async function fetchTrash() {
  return apiCall('/trash');
}

export async function restoreFromTrash(id) {
  return apiCall(`/trash-restore?id=${id}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
