'use client';

import { useState } from 'react';
import { Coffee, Check, X } from 'lucide-react';
import styles from './BurnoutCard.module.css';

export default function BurnoutCard({ onDismiss, onScheduleBreak }) {
  const [selectedBreak, setSelectedBreak] = useState('🚶 5-min Walk');
  const [scheduled, setScheduled] = useState(false);

  const options = [
    { label: '💧 Drink Water', time: '2 mins' },
    { label: '🚶 5-min Walk', time: '5 mins' },
    { label: '🥗 Lunch', time: '30 mins' },
    { label: '🧘 Stretch', time: '10 mins' }
  ];

  const handleSchedule = () => {
    setScheduled(true);
    setTimeout(() => {
      if (onScheduleBreak) onScheduleBreak(selectedBreak);
      if (onDismiss) onDismiss();
    }, 1500);
  };

  if (scheduled) {
    return (
      <div className={`${styles.cardScheduled} fade-in`}>
        <Check size={20} className="text-accent" />
        <span>Scheduled <strong>{selectedBreak}</strong> into your timeline! Enjoy your rest.</span>
      </div>
    );
  }

  return (
    <div className={`${styles.card} scale-in`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Coffee size={20} className="text-warning" />
          <span className={styles.title}>Cognitive Wellness Intervention</span>
        </div>
        <button className={styles.closeBtn} onClick={onDismiss} title="Skip for now"><X size={16} /></button>
      </div>

      <div className={styles.content}>
        <p className={styles.lead}>You&apos;ve been in uninterrupted focus mode for <strong>2.5 hours</strong>.</p>
        <p className={styles.sub}>Taking a short break now improves afternoon analytical performance by ~23%.</p>
      </div>

      <div className={styles.optionsGrid}>
        {options.map((opt) => (
          <button
            key={opt.label}
            className={`${styles.optBtn} ${selectedBreak === opt.label ? styles.optActive : ''}`}
            onClick={() => setSelectedBreak(opt.label)}
          >
            <span>{opt.label}</span>
            <span className={styles.optTime}>{opt.time}</span>
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.scheduleBtn} onClick={handleSchedule}>
          <span>Schedule Break Now</span>
        </button>
        <button className={styles.skipBtn} onClick={onDismiss}>Skip for Now</button>
      </div>
    </div>
  );
}
