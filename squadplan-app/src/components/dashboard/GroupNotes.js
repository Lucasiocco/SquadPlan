import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../services/firebase';

const GroupNotes = ({ groupId, notes = [], onNoteAdded }) => {
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddNote = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const noteData = {
        contenido: newNote,
        fecha: new Date(),
        autor: auth.currentUser.uid
      };

      await updateDoc(doc(db, 'grupos', groupId), {
        notas: arrayUnion(noteData)
      });

      setNewNote('');
      onNoteAdded?.();
    } catch (error) {
      console.error('Error al añadir nota:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">Notas del Grupo</h5>
        
        <form onSubmit={handleAddNote} className="mb-4">
          <div className="mb-3">
            <textarea
              className="form-control"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Escribe una nota..."
              rows="3"
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Añadiendo...' : 'Añadir Nota'}
          </button>
        </form>

        <div className="notes-list">
          {notes.map((note, index) => (
            <div key={index} className="card mb-2">
              <div className="card-body">
                <p className="mb-1">{note.contenido}</p>
                <small className="text-muted">
                  {new Date(note.fecha?.toDate()).toLocaleString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupNotes;