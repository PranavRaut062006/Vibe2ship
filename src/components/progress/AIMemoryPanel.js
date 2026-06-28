'use client';

import { useState, useEffect } from 'react';
import { Brain, Edit3, Trash2, Check, X } from 'lucide-react';
import { fetchMemories, updateMemory, deleteMemory } from '@/lib/api';
import styles from './AIMemoryPanel.module.css';

export default function AIMemoryPanel() {
  const [memories, setMemories] = useState([]);
  const [confirmKey, setConfirmKey] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [editText, setEditText] = useState('');

  const loadMemories = async () => {
    try {
      const res = await fetchMemories();
      if (res.memories) {
        setMemories(res.memories.map(m => ({
          id: m._id || m.key,
          key: m.key,
          text: `${m.key}: ${m.value}`,
          val: m.value
        })));
      }
    } catch (err) {
      console.error("Failed to load memories:", err);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleDelete = async (key) => {
    try {
      await deleteMemory(key);
      await loadMemories();
      setConfirmKey(null);
    } catch (err) {
      console.error("Failed to delete memory:", err);
    }
  };

  const handleStartEdit = (m) => {
    setEditingKey(m.key);
    setEditText(m.val);
  };

  const handleSaveEdit = async (key) => {
    try {
      await updateMemory(key, editText);
      await loadMemories();
      setEditingKey(null);
    } catch (err) {
      console.error("Failed to update memory:", err);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Brain size={22} className="text-primary-color" />
          <div>
            <h3 className={styles.title}>What FocusFlow AI Knows About You</h3>
            <p className={styles.subtitle}>Edit or forget any memory to refine executive intelligence</p>
          </div>
        </div>
      </div>

      <div className={styles.list}>
        {memories.length === 0 ? (
          <div className={styles.empty}>No memories recorded yet. FocusFlow AI will autonomously learn your habits and preferences as you complete tasks.</div>
        ) : (
          memories.map((m) => (
            <div key={m.id} className={styles.row}>
              {editingKey === m.key ? (
                <div className={styles.editForm}>
                  <input
                    type="text"
                    className={styles.input}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button className={styles.saveBtn} onClick={() => handleSaveEdit(m.key)}><Check size={14} /></button>
                  <button className={styles.cancelBtn} onClick={() => setEditingKey(null)}><X size={14} /></button>
                </div>
              ) : (
                <>
                  <span className={styles.text}>{m.text}</span>

                  <div className={styles.actions}>
                    {confirmKey === m.key ? (
                      <div className={styles.confirmBox}>
                        <span className={styles.confirmText}>Forget?</span>
                        <button className={styles.confirmYes} onClick={() => handleDelete(m.key)}>Yes</button>
                        <button className={styles.confirmNo} onClick={() => setConfirmKey(null)}>No</button>
                      </div>
                    ) : (
                      <>
                        <button className={styles.ghostBtn} onClick={() => handleStartEdit(m)} title="Edit memory">
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button className={styles.ghostBtnDanger} onClick={() => setConfirmKey(m.key)} title="Forget memory">
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
