'use client';

import { Sparkles } from 'lucide-react';
import styles from './AIInsightBanner.module.css';

export default function AIInsightBanner() {
  return (
    <div className={`${styles.banner} ai-glow fade-in`}>
      <div className={styles.iconWrapper}>
        <div className={styles.thinkingDot} />
        <Sparkles size={20} className={styles.icon} />
      </div>
      <div className={styles.content}>
        <span className="ai-badge">AI</span>
        <p>
          You&apos;re most productive between <strong>2 PM – 5 PM</strong>. I&apos;ve scheduled your hardest task &quot;API Integration&quot; during this window. You have a <strong className="text-warning">deadline risk</strong> on 2 items this week.
        </p>
      </div>
      <button className={styles.actionBtn}>View Plan</button>
    </div>
  );
}
