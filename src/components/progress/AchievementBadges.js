'use client';

import { useState, useEffect } from 'react';
import { Trophy, Zap, BookOpen, Lock, ShieldCheck, Flame, Star, Award } from 'lucide-react';
import { fetchUser, fetchTasks } from '@/lib/api';
import styles from './AchievementBadges.module.css';

export default function AchievementBadges() {
  const [streak, setStreak] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const uRes = await fetchUser();
        const tRes = await fetchTasks();
        if (uRes.user) setStreak(uRes.user.streak || 0);
        if (tRes.tasks) setCompletedCount(tRes.tasks.filter(t => t.status === 'completed').length);
      } catch (err) {
        console.error("Failed to load achievement badges:", err);
      }
    }
    load();
  }, []);

  const badges = [
    { id: 'b1', icon: Trophy, title: '3-Day Streak', date: streak >= 3 ? 'Unlocked!' : `Locked · ${streak}/3 days`, earned: streak >= 3, recent: streak >= 3 },
    { id: 'b2', icon: Zap, title: 'Execution Starter', date: completedCount >= 1 ? 'Unlocked!' : 'Locked · Complete 1 task', earned: completedCount >= 1 },
    { id: 'b3', icon: BookOpen, title: 'Task Master', date: completedCount >= 10 ? 'Unlocked!' : `Locked · ${completedCount}/10 tasks`, earned: completedCount >= 10 },
    { id: 'b4', icon: ShieldCheck, title: 'Consistent Pilot', date: streak >= 7 ? 'Unlocked!' : `Locked · ${streak}/7 days`, earned: streak >= 7 },
    { id: 'b5', icon: Flame, title: 'Deep Focus 50h', date: 'Locked · Complete focus sessions', earned: false },
    { id: 'b6', icon: Star, title: 'Perfect Sprint', date: 'Locked · Complete 5 P1 tasks', earned: false },
    { id: 'b7', icon: Award, title: 'Early Riser', date: 'Locked · Schedule morning focus', earned: false },
    { id: 'b8', icon: Lock, title: 'Zen Master', date: 'Locked · Take scheduled breaks', earned: false }
  ];

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Achievements</h3>

      <div className={styles.grid}>
        {badges.map((b) => {
          const IconComp = b.icon;
          return (
            <div
              key={b.id}
              className={`${styles.card} ${!b.earned ? styles.cardLocked : ''} ${b.recent ? styles.cardRecent : ''}`}
            >
              <div className={styles.iconWrapper}>
                <IconComp size={24} className={b.earned ? 'text-primary-color' : 'text-muted'} />
              </div>
              <span className={styles.title}>{b.title}</span>
              <span className={styles.date}>{b.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
