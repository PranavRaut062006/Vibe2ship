'use client';

import { Sparkles } from 'lucide-react';
import styles from './FloatingAIButton.module.css';

export default function FloatingAIButton({ onClick }) {
  return (
    <button className={styles.fab} onClick={onClick} aria-label="Open AI Chat">
      <div className={styles.pulse} />
      <Sparkles size={24} className={styles.icon} />
    </button>
  );
}
