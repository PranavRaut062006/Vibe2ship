'use client';

import { useState, useEffect } from 'react';
import { fetchUser, fetchTasks } from '@/lib/api';
import styles from './BehaviorProfileCard.module.css';

export default function BehaviorProfileCard() {
  const [consistency, setConsistency] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetchUser();
        const tRes = await fetchTasks();
        if (res.user?.consistencyScore !== undefined) {
          setConsistency(res.user.consistencyScore);
        }
        if (tRes.tasks) {
          setTotalCount(tRes.tasks.length);
          setCompletedCount(tRes.tasks.filter(t => t.status === 'completed').length);
        }
      } catch (err) {
        console.error("Failed to load user behavior:", err);
      }
    }
    loadUser();
  }, []);

  const dimensions = [
    { label: 'Consistency', val: consistency, colorClass: 'fillPrimary' },
    { label: 'Planning Efficiency', val: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0, colorClass: 'fillPrimary' },
    { label: 'Follow-through', val: completedCount > 0 ? Math.min(100, consistency + 10) : 0, colorClass: 'fillPrimary' },
    { label: 'Focus Quality', val: completedCount > 0 ? Math.min(100, consistency + 5) : 0, colorClass: 'fillPrimary' }
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Your LifePilot AI Behavior Profile</h3>
        <p>Based on continuous autonomous executive tracking</p>
      </div>

      <div className={styles.grid}>
        {completedCount === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: '#8B8BA0' }}>
            <h4 style={{ color: '#F0F0F5', fontSize: '18px', marginBottom: '8px' }}>No completed tasks yet. Complete your first task to unlock behavior analysis.</h4>
            <p>LifePilot AI continuously tracks your work patterns. Add and finish tasks to generate your executive behavioral profile.</p>
          </div>
        ) : (
          <>
            <div className={styles.insightsCol}>
              <h4>Behavioral Patterns</h4>
              <ul className={styles.insightsList}>
                <li><span>Tasks Completed:</span> <strong>{completedCount} / {totalCount}</strong></li>
                <li><span>Consistency Score:</span> <strong>{consistency}/100</strong></li>
                <li><span>Executive Status:</span> <strong className="text-primary-color">Active Tracking</strong></li>
              </ul>
            </div>

            {/* Right: Archetype Badge & Progress Bars */}
            <div className={styles.archetypeCol}>
              <div className={styles.badgeBox}>
                <span className={styles.badgeTitle}>{consistency >= 80 ? 'Executive Performer' : 'Building Momentum'}</span>
                <p>You are developing your executive productivity rhythm with AI guidance.</p>
              </div>

              <div className={styles.barsList}>
                {dimensions.map((d, idx) => (
                  <div key={idx} className={styles.barItem}>
                    <div className={styles.barHeader}>
                      <span>{d.label}</span>
                      <span className="mono font-bold">{d.val}%</span>
                    </div>
                    <div className={styles.track}>
                      <div className={`${styles.fill} ${styles[d.colorClass]}`} style={{ width: `${d.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
