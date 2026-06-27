'use client';

import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import styles from './ScanningState.module.css';

export default function ScanningState() {
  const messages = [
    "Checking subject lines...",
    "Identifying deadlines...",
    "Estimating effort...",
    "Calculating priorities..."
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className={`${styles.container} fade-in`}>
      <div className={styles.iconWrapper}>
        <div className={styles.pulseRing} />
        <Mail size={32} className="text-primary-color" />
      </div>

      <h3 className={styles.title}>AI is reading your Gmail...</h3>

      <div className={styles.msgBox}>
        <p key={msgIdx} className={`${styles.cyclingMsg} fade-in`}>
          {messages[msgIdx]}
        </p>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar} />
      </div>

      <p className={styles.subtext}>This usually takes 10–15 seconds</p>
    </div>
  );
}
