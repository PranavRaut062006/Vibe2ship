'use client';

import { useState } from 'react';
import { Brain, Edit3, Trash2, Check, X } from 'lucide-react';
import styles from './AIMemoryPanel.module.css';

export default function AIMemoryPanel() {
  const [memories, setMemories] = useState([
    { id: 'm1', text: 'Preferred focus time: 9 AM – 11 AM' },
    { id: 'm2', text: 'Average task duration: 1.2x estimated' },
    { id: 'm3', text: 'Frequently postponed: DSA Practice' },
    { id: 'm4', text: 'Most productive days: Tue, Wed' }
  ]);

  const [confirmId, setConfirmId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleDelete = (id) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    setConfirmId(null);
  };

  const handleStartEdit = (m) => {
    setEditingId(m.id);
    setEditText(m.text);
  };

  const handleSaveEdit = (id) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, text: editText } : m));
    setEditingId(null);
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Brain size={22} className="text-primary-color" />
          <div>
            <h3 className={styles.title}>What AI Knows About You</h3>
            <p className={styles.subtitle}>Edit or forget any memory to refine executive intelligence</p>
          </div>
        </div>
      </div>

      <div className={styles.list}>
        {memories.length === 0 ? (
          <div className={styles.empty}>All custom memories wiped. AI is learning fresh preferences.</div>
        ) : (
          memories.map((m) => (
            <div key={m.id} className={styles.row}>
              {editingId === m.id ? (
                <div className={styles.editForm}>
                  <input
                    type="text"
                    className={styles.input}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button className={styles.saveBtn} onClick={() => handleSaveEdit(m.id)}><Check size={14} /></button>
                  <button className={styles.cancelBtn} onClick={() => setEditingId(null)}><X size={14} /></button>
                </div>
              ) : (
                <>
                  <span className={styles.text}>{m.text}</span>

                  <div className={styles.actions}>
                    {confirmId === m.id ? (
                      <div className={styles.confirmBox}>
                        <span className={styles.confirmText}>Forget?</span>
                        <button className={styles.confirmYes} onClick={() => handleDelete(m.id)}>Yes</button>
                        <button className={styles.confirmNo} onClick={() => setConfirmId(null)}>No</button>
                      </div>
                    ) : (
                      <>
                        <button className={styles.ghostBtn} onClick={() => handleStartEdit(m)} title="Edit memory">
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button className={styles.ghostBtnDanger} onClick={() => setConfirmId(m.id)} title="Forget memory">
                          <Trash2 size={14} />
                          <span>Forget</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
