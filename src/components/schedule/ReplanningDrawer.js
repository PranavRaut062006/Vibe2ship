'use client';

import { useState } from 'react';
import { Sparkles, X, ArrowRight, Check } from 'lucide-react';
import { replanSchedule } from '@/lib/api';
import styles from './ReplanningDrawer.module.css';

export default function ReplanningDrawer({ isOpen, onClose, onAccept }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAcceptChanges = async () => {
    setLoading(true);
    try {
      await replanSchedule({ title: 'DSA Practice' }, 'Task marked as incomplete or took longer than expected');
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
      if (onAccept) onAccept();
      onClose();
    } catch (err) {
      console.error("Failed to execute AI replan:", err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.drawer} slide-in`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <Sparkles size={20} className="text-primary-color" />
            <h3 className={styles.title}>AI Updated Your Schedule</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <p className={styles.subtitle}>
          A schedule change or delay occurred. FocusFlow AI dynamically re-optimized downstream blocks to protect your high-priority items without causing burnout.
        </p>

        <div className={styles.changesList}>
          <div className={`${styles.changeCard} ${styles.moved}`}>
            <span className={styles.changeBadgeMoved}>Moved</span>
            <div className={styles.changeContent}>
              <strong>DSA Practice</strong>
              <span>→ Rescheduled to afternoon focus block</span>
            </div>
          </div>

          <div className={`${styles.changeCard} ${styles.added}`}>
            <span className={styles.changeBadgeAdded}>Added</span>
            <div className={styles.changeContent}>
              <strong>Recovery Buffer</strong>
              <span>→ 15 min mental rest buffer</span>
            </div>
          </div>

          <div className={`${styles.changeCard} ${styles.removed}`}>
            <span className={styles.changeBadgeRemoved}>Shifted</span>
            <div className={styles.changeContent}>
              <strong>Team Meeting</strong>
              <span>→ Shifted by 30 mins to avoid bottleneck</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.rejectBtn} onClick={onClose} disabled={loading}>Keep Original</button>
          <button className={styles.acceptBtn} onClick={handleAcceptChanges} disabled={loading}>
            <Check size={16} />
            <span>{loading ? 'Applying AI Replan...' : 'Accept AI Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
