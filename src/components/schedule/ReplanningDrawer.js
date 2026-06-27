'use client';

import { Sparkles, X, ArrowRight, Check } from 'lucide-react';
import styles from './ReplanningDrawer.module.css';

export default function ReplanningDrawer({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.drawer} slide-in`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <Sparkles size={20} className="text-primary-color" />
            <h3 className={styles.title}>AI Updated Your Schedule</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className={styles.subtitle}>
          You marked DSA as incomplete. I&apos;ve adjusted your afternoon to keep you on track without overloading tonight.
        </p>

        <div className={styles.changesList}>
          <div className={`${styles.changeCard} ${styles.moved}`}>
            <span className={styles.changeBadgeMoved}>Moved</span>
            <div className={styles.changeContent}>
              <strong>DSA Practice</strong>
              <span>→ Rescheduled to 14:00–16:00 focus block</span>
            </div>
          </div>

          <div className={`${styles.changeCard} ${styles.added}`}>
            <span className={styles.changeBadgeAdded}>Added</span>
            <div className={styles.changeContent}>
              <strong>Recovery Buffer</strong>
              <span>→ 15 min mental transition at 13:45</span>
            </div>
          </div>

          <div className={`${styles.changeCard} ${styles.removed}`}>
            <span className={styles.changeBadgeRemoved}>Removed</span>
            <div className={styles.changeContent}>
              <strong className="line-through">Optional Reading</strong>
              <span>→ Freed up 45 mins to accommodate DSA</span>
            </div>
          </div>
        </div>

        <div className={`${styles.reasoningCard} ai-glow`}>
          <div className={styles.reasoningHeader}>
            <Sparkles size={14} className="text-primary-color" />
            <span>AI Replanning Logic</span>
          </div>
          <p>
            I prioritized your DSA task because the deadline is tomorrow and your completion probability dropped to 62%.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.acceptBtn} onClick={onAccept}>
            <Check size={16} />
            <span>Accept Changes</span>
          </button>
          <button className={styles.customizeBtn} onClick={onClose}>Customize</button>
          <button className={styles.keepBtn} onClick={onClose}>Keep Original</button>
        </div>
      </div>
    </div>
  );
}
