'use client';

import { Sparkles } from 'lucide-react';
import styles from './WeeklyReflectionCard.module.css';

export default function WeeklyReflectionCard() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Sparkles size={18} className="text-primary-color" />
          <h3>This Week&apos;s Reflection</h3>
        </div>
        <span className={styles.dateRange}>June 20 – June 27</span>
      </div>

      <div className={styles.narrative}>
        <p>
          You completed 34 tasks this week, up from 27 last week. Tuesday was your strongest day — you hit 100% of your scheduled tasks. Your main blocker was DSA Practice, which you postponed 4 times.
        </p>
        <p>
          Your best productive window remains 9–11 AM. Meetings are eating into your afternoon focus time, leading to a slight drop in analytical output after 3 PM.
        </p>
      </div>

      <div className={styles.boxesRow}>
        <div className={styles.winsBox}>
          <span className={styles.boxTitleWins}>Wins</span>
          <p>✓ Maintained 12-day streak · ✓ Completed all P1 tasks · ✓ Zero missed meetings</p>
        </div>

        <div className={styles.improvementsBox}>
          <span className={styles.boxTitleImprovements}>Areas for Improvement</span>
          <p>• DSA consistency needs work · • Health tasks skipped 3 days</p>
        </div>
      </div>
    </div>
  );
}
