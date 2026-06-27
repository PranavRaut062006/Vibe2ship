'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Flag, Sparkles } from 'lucide-react';
import styles from './QuickAddModal.module.css';

export default function QuickAddModal({ isOpen, onClose }) {
  const [task, setTask] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!task.trim()) return;
    onClose();
    setTask('');
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} scale-in glass`}>
        <div className={styles.header}>
          <h3>Quick Add Task</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="What needs to be done?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />

          <div className={styles.options}>
            <button type="button" className={styles.optionBtn}>
              <Calendar size={14} />
              <span>Today</span>
            </button>
            <button type="button" className={styles.optionBtn}>
              <Flag size={14} />
              <span>Priority</span>
            </button>
            <button type="button" className={`${styles.optionBtn} ${styles.aiOption}`}>
              <Sparkles size={14} />
              <span>AI Categorize</span>
            </button>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
