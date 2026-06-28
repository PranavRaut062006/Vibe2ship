'use client';

import { useState, useEffect } from 'react';
import BehaviorProfileCard from '@/components/progress/BehaviorProfileCard';
import WeeklyReflectionCard from '@/components/progress/WeeklyReflectionCard';
import PredictionsRow from '@/components/progress/PredictionsRow';
import AchievementBadges from '@/components/progress/AchievementBadges';
import AIMemoryPanel from '@/components/progress/AIMemoryPanel';
import { fetchUser, fetchTasks } from '@/lib/api';
import styles from './page.module.css';

export default function ProgressPage() {
  const [consistency, setConsistency] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const uRes = await fetchUser();
        const tRes = await fetchTasks();
        if (uRes.user) {
          setConsistency(uRes.user.consistencyScore || 0);
          setStreak(uRes.user.streak || 0);
        }
        if (tRes.tasks) {
          setTotalTasks(tRes.tasks.length);
          const comp = tRes.tasks.filter(t => t.status === 'completed').length;
          setCompletedTasks(comp);
        }
      } catch (err) {
        console.error("Failed to load progress data:", err);
      }
    }
    loadData();
  }, []);

  const stats = [
    { label: 'Focus Hours Today', val: completedTasks > 0 ? `${(completedTasks * 0.75).toFixed(1)}h` : '0.0h', trend: completedTasks > 0 ? 'Active tracked time' : 'No focus yet', trendColor: 'text-accent' },
    { label: 'Tasks Completed', val: `${completedTasks} / ${totalTasks}`, trend: totalTasks > 0 ? `${Math.round((completedTasks/totalTasks)*100)}% efficiency` : '0% efficiency', trendColor: 'text-primary-color' },
    { label: 'Planning Accuracy', val: totalTasks > 0 ? `${Math.round((completedTasks/totalTasks)*100)}%` : '0%', trend: totalTasks > 0 ? 'Live completion rate' : 'No tasks planned', trendColor: 'text-accent' },
    { label: 'Current Streak', val: `${streak} days 🔥`, trend: streak > 0 ? 'Keep it up!' : 'Start streak today', trendColor: 'text-warning font-bold' }
  ];

  return (
    <div className={styles.container}>
      {/* Section 1: Consistency Score Hero */}
      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.scoreRow}>
            <span className={styles.bigNumber}>{consistency}</span>
            <span className={styles.scoreSub}>/ 100 Consistency Score</span>
          </div>
          <div className={styles.badgeRow}>
            <span className={styles.heroBadge}>{consistency > 0 ? 'Consistent Performer' : 'Getting Started'}</span>
            <span className={styles.trendText}>{consistency > 0 ? 'Live AI score' : 'Complete tasks to build score'}</span>
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
                strokeDashoffset={326.7 * (1 - (consistency / 100))}
                strokeLinecap="round"
                fill="transparent"
                r="52"
                cx="60"
                cy="60"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span className={styles.ringText}>{consistency}%</span>
          </div>
        </div>

        <div className={styles.heroRight}>
          <span className={styles.sparkLabel}>7-Day Sparkline Trend</span>
          {consistency === 0 ? (
            <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B8BA0', fontSize: '12px' }}>
              No trend data yet
            </div>
          ) : (
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
          )}
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
