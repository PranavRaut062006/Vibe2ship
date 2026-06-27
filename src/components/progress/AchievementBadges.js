'use client';

import { Trophy, Zap, BookOpen, Lock, ShieldCheck, Flame, Star, Award } from 'lucide-react';
import styles from './AchievementBadges.module.css';

export default function AchievementBadges() {
  const badges = [
    { id: 'b1', icon: Trophy, title: '12-Day Streak', date: 'Earned today', earned: true, recent: true },
    { id: 'b2', icon: Zap, title: 'Deadline Master', date: 'Earned 5 days ago', earned: true },
    { id: 'b3', icon: BookOpen, title: 'Study Beast', date: 'Earned 2 weeks ago', earned: true },
    { id: 'b4', icon: ShieldCheck, title: 'Inbox Zero AI', date: 'Earned 3 weeks ago', earned: true },
    { id: 'b5', icon: Flame, title: 'Deep Focus 100h', date: 'Locked · 82/100 hrs', earned: false },
    { id: 'b6', icon: Star, title: 'Perfect Sprint', date: 'Locked · Complete 10 P1s', earned: false },
    { id: 'b7', icon: Award, title: 'Early Riser 7am', date: 'Locked · 3/5 mornings', earned: false },
    { id: 'b8', icon: Lock, title: 'Zen Master', date: 'Locked · Take all breaks', earned: false }
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
