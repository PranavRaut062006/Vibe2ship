'use client';

import { useState, useEffect } from 'react';
import { Check, Pause, X, Sparkles } from 'lucide-react';
import styles from './ActiveVerificationToast.module.css';

export default function ActiveVerificationToast({ onResponse }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const handleAction = (resp) => {
    setVisible(false);
    onResponse(resp);
  };

  return (
    <div className={`${styles.toast} slide-up`}>
      <div className={styles.header}>
        <Sparkles size={16} className="text-primary-color" />
        <span>Active Task Verification · 11:00 AM</span>
        <button className={styles.closeBtn} onClick={() => setVisible(false)}><X size={14} /></button>
      </div>

      <p className={styles.question}>
        Are you working on <strong>DSA Practice</strong> right now?
      </p>

      <div className={styles.actions}>
        <button className={styles.yesBtn} onClick={() => handleAction('focused')}>
          <Check size={14} />
          <span>Yes, focused</span>
        </button>
        <button className={styles.breakBtn} onClick={() => handleAction('break')}>
          <Pause size={14} />
          <span>Taking a break</span>
        </button>
        <button className={styles.notStartedBtn} onClick={() => handleAction('not_started')}>
          <X size={14} />
          <span>Not started yet</span>
        </button>
      </div>
    </div>
  );
}
