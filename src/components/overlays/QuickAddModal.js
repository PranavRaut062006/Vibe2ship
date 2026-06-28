'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Flag, Sparkles } from 'lucide-react';
import { createTask } from '@/lib/api';
import styles from './QuickAddModal.module.css';

export default function QuickAddModal({ isOpen, onClose, onAdd }) {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('P2');
  const [deadline, setDeadline] = useState('Today');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!task.trim() || loading) return;
    setLoading(true);
    try {
      const res = await createTask({
        title: task.trim(),
        priority,
        deadline,
        estimatedMinutes: 45,
        category: 'Focus',
        status: 'approved',
        source: 'manual'
      });
      if (onAdd) onAdd(res.task);
      setTask('');
      onClose();
    } catch (err) {
      console.error("Failed to create task:", err);
      alert("Failed to save task to backend. Is Express server running?");
    } finally {
      setLoading(false);
    }
  };

  const togglePriority = () => {
    if (priority === 'P2') setPriority('P1');
    else if (priority === 'P1') setPriority('P3');
    else setPriority('P2');
  };

  const toggleDeadline = () => {
    if (deadline === 'Today') setDeadline('Tomorrow');
    else if (deadline === 'Tomorrow') setDeadline('Friday');
    else setDeadline('Today');
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
            disabled={loading}
          />

          <div className={styles.options}>
            <button type="button" className={styles.optionBtn} onClick={toggleDeadline}>
              <Calendar size={14} />
              <span>{deadline}</span>
            </button>
            <button type="button" className={styles.optionBtn} onClick={togglePriority}>
              <Flag size={14} className={priority === 'P1' ? 'text-danger' : priority === 'P2' ? 'text-warning' : 'text-muted'} />
              <span>{priority}</span>
            </button>
            <button type="button" className={`${styles.optionBtn} ${styles.aiOption}`}>
              <Sparkles size={14} />
              <span>AI Categorized</span>
            </button>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
