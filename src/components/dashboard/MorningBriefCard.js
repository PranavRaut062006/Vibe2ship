'use client';

import { useState } from 'react';
import { Sparkles, Mail, Calendar as CalendarIcon, AlertTriangle, X } from 'lucide-react';
import styles from './MorningBriefCard.module.css';

export default function MorningBriefCard({ onOrganize }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`${styles.card} fade-in`}>
      <div className={styles.headerRow}>
        <div className={styles.greetingWrapper}>
          <h2 className={styles.greeting}>Good morning, Pran 👋</h2>
        </div>
        <div className={styles.badgeWrapper}>
          <span className="ai-badge">AI Brief</span>
          <button className={styles.closeBtn} onClick={() => setDismissed(true)} aria-label="Dismiss brief">
            <X size={16} />
          </button>
        </div>
      </div>

      <p className={styles.summary}>
        I&apos;ve reviewed your Gmail and calendar. Here&apos;s what needs your attention today.
      </p>

      <div className={styles.chipsRow}>
        <div className={styles.chip}>
          <Mail size={14} className="text-primary-color" />
          <span>2 new tasks extracted</span>
        </div>
        <div className={styles.chip}>
          <CalendarIcon size={14} className="text-accent" />
          <span>3 calendar events</span>
        </div>
        <div className={styles.chip}>
          <AlertTriangle size={14} className="text-warning" />
          <span>1 deadline tomorrow</span>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button className={styles.primaryBtn} onClick={onOrganize}>
          <Sparkles size={16} />
          <span>Organize My Day</span>
        </button>
        <div className={styles.textBtns}>
          <button className={styles.textBtn} onClick={onOrganize}>Review First</button>
          <span className={styles.separator}>|</span>
          <button className={styles.textBtn} onClick={() => setDismissed(true)}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}
