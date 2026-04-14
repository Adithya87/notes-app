
import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';

function MarkdownEditor({ note, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(note.title || '');
  const [body, setBody] = useState(note.body || '');
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const debounceRef = useRef();

  useEffect(() => {
    setTitle(note.title || '');
    setBody(note.body || '');
  }, [note]);

  useEffect(() => {
    setPreview(marked.parse(body));
  }, [body]);

  // Debounced autosave
  useEffect(() => {
    if (!note.id) return; // Only autosave for existing notes
    setAutoSaved(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      await onSave({ ...note, title, body });
      setSaving(false);
      setAutoSaved(true);
    }, 1000); // 1 second debounce
    return () => clearTimeout(debounceRef.current);
  }, [title, body]);

  async function handleSave() {
    setSaving(true);
    await onSave({ ...note, title, body });
    setSaving(false);
    setAutoSaved(true);
    if (!note.id) onClose();
  }

  function handleDelete() {
    if (note.id && window.confirm('Delete this note?')) {
      onDelete(note.id);
      onClose();
    }
  }

  return (
    <div className="markdown-editor">
      <input
        className="note-title"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <div className="split-view">
        <textarea
          className="note-body"
          placeholder="Write your markdown here..."
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        <div className="note-preview" dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
      <div className="editor-actions">
        <button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        {note.id && <button onClick={handleDelete}>Delete</button>}
        <button onClick={onClose}>Close</button>
        {note.id && <span style={{ marginLeft: 12, color: '#888', fontSize: 13 }}>{autoSaved ? 'Autosaved' : ''}</span>}
      </div>
    </div>
  );
}

export default MarkdownEditor;
