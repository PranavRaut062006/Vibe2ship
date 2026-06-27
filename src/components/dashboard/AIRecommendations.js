'use client';

import { Sparkles, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
import styles from './AIRecommendations.module.css';

export default function AIRecommendations() {
  const recs = [
    {
      icon: AlertTriangle,
      colorClass: 'warning',
      text: <><strong>Deadline Alert:</strong> &quot;API Integration&quot; has only 45 min buffer before the meeting. Consider starting now.</>
    },
    {
      icon: TrendingUp,
      colorClass: 'accent',
      text: <><strong>Momentum:</strong> You&apos;ve completed 3 tasks before lunch — 20% above your average. Keep it up!</>
    },
    {
      icon: Lightbulb,
      colorClass: 'primary',
      text: <><strong>Suggestion:</strong> Move &quot;Sprint Demo Slides&quot; to tomorrow morning — your energy dips after 6 PM.</>
    }
  ];

  return (
    <div className={`${styles.card} ai-glow`}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <Sparkles size={18} className="text-primary-color" />
          <h3 className={styles.title}>AI Recommendations</h3>
        </div>
        <span className="ai-badge">AI</span>
      </div>

      <div className={styles.list}>
        {recs.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <div key={i} className={styles.item}>
              <div className={`${styles.iconWrapper} ${styles[rec.colorClass]}`}>
                <Icon size={16} />
              </div>
              <div className={styles.text}>{rec.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
