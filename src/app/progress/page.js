'use client';

import BehaviorProfileCard from '@/components/progress/BehaviorProfileCard';
import WeeklyReflectionCard from '@/components/progress/WeeklyReflectionCard';
import PredictionsRow from '@/components/progress/PredictionsRow';
import AchievementBadges from '@/components/progress/AchievementBadges';
import AIMemoryPanel from '@/components/progress/AIMemoryPanel';
import styles from './page.module.css';

export default function ProgressPage() {
  const stats = [
    { label: 'Focus Hours Today', val: '3.5h', trend: '↑ 12% vs avg', trendColor: 'text-accent' },
    { label: 'Tasks Completed', val: '6 / 8', trend: '75% efficiency', trendColor: 'text-primary-color' },
    { label: 'Planning Accuracy', val: '78%', trend: '↑ 4% this week', trendColor: 'text-accent' },
    { label: 'Current Streak', val: '12 days 🔥', trend: 'Personal best!', trendColor: 'text-warning font-bold' }
  ];

  return (
    <div className={styles.container}>
      {/* Section 1: Consistency Score Hero */}
      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.scoreRow}>
            <span className={styles.bigNumber}>87</span>
            <span className={styles.scoreSub}>/ 100 Consistency Score</span>
          </div>
          <div className={styles.badgeRow}>
            <span className={styles.heroBadge}>Consistent Performer</span>
            <span className={styles.trendText}>↑ 4 points this week</span>
          </div>
        </div>

        <div className={styles.heroCenter}>
          {/* SVG Circular Progress Ring */}
          <div className={styles.ringWrapper}>
            <svg className={styles.progressRing} width="120" height="120" viewBox="0 0 120 120">
              <circle
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="6"
                fill="transparent"
                r="52"
                cx="60"
                cy="60"
              />
              <circle
                stroke="#00D4AA"
                strokeWidth="6"
                strokeDasharray={326.7}
                strokeDashoffset={326.7 * (1 - 0.87)}
                strokeLinecap="round"
                fill="transparent"
                r="52"
                cx="60"
                cy="60"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span className={styles.ringText}>87%</span>
          </div>
        </div>

        <div className={styles.heroRight}>
          <span className={styles.sparkLabel}>7-Day Sparkline Trend</span>
          <svg viewBox="0 0 120 40" className={styles.sparklineSvg}>
            <defs>
              <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00D4AA" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon fill="url(#sparkGrad)" points="0,40 0,32 20,28 40,30 60,18 80,22 100,12 120,8 120,40" />
            <polyline fill="none" stroke="#00D4AA" strokeWidth="2.5" points="0,32 20,28 40,30 60,18 80,22 100,12 120,8" />
          </svg>
        </div>
      </div>

      {/* Section 2: Stats Row */}
      <div className={styles.statsGrid}>
        {stats.map((s, idx) => (
          <div key={idx} className={styles.statCard}>
            <span className={styles.statVal}>{s.val}</span>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={`${styles.statTrend} ${s.trendColor}`}>{s.trend}</span>
          </div>
        ))}
      </div>

      {/* Section 3: Behavior Profile Card */}
      <BehaviorProfileCard />

      {/* Section 4: Weekly Reflection Card */}
      <WeeklyReflectionCard />

      {/* Section 5: AI Predictions */}
      <PredictionsRow />

      {/* Section 6: Achievement Badges */}
      <AchievementBadges />

      {/* Section 7: AI Memory Panel */}
      <AIMemoryPanel />
    </div>
  );
}
