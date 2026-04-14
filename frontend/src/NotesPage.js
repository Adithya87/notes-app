import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MarkdownEditor from './MarkdownEditor';

function NotesPage({ token, setToken, dark, setDark }) {
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);
    const res = await axios.get('http://localhost:5000/api/notes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotes(res.data);
    setLoading(false);
  }

  async function handleSave(note) {
    if (note.id) {
      await axios.put(`http://localhost:5000/api/notes/${note.id}`,
        { title: note.title, body: note.body },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await axios.post('http://localhost:5000/api/notes',
        { title: note.title, body: note.body },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    fetchNotes();
  }

  async function handleDelete(id) {
    await axios.delete(`http://localhost:5000/api/notes/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSelected(null);
    fetchNotes();
  }

  async function handleSearch(e) {
    setSearch(e.target.value);
    if (e.target.value.trim() === '') return fetchNotes();
    const res = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(e.target.value)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotes(res.data);
  }

  function handleLogout() {
    setToken(null);
  }

  return (
    <div className="notes-app">
      <header>
        <h1>Markdown Notes</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => setDark(d => !d)}>{dark ? 'Light Mode' : 'Dark Mode'}</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <div className="notes-main">
        <aside>
          <button onClick={() => setSelected({ title: '', body: '' })}>+ New Note</button>
          <input placeholder="Search notes..." value={search} onChange={handleSearch} />
          {loading ? <div>Loading...</div> : (
            <ul className="notes-list">
              {notes.map(note => (
                <li key={note.id} onClick={() => setSelected(note)} className={selected && note.id === selected.id ? 'active' : ''}>
                  <strong>{note.title}</strong>
                  <span>{new Date(note.updated_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
        <main>
          {selected ? (
            <MarkdownEditor
              note={selected}
              onSave={handleSave}
              onDelete={handleDelete}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div className="empty-state">Select or create a note to begin.</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default NotesPage;
