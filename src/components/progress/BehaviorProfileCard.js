'use client';

import { useState, useEffect } from 'react';
import { fetchUser, fetchTasks } from '@/lib/api';
import styles from './BehaviorProfileCard.module.css';

export default function BehaviorProfileCard() {
  const [consistency, setConsistency] = useState(0);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetchUser();
        const tRes = await fetchTasks();
        if (res.user?.consistencyScore) {
          setConsistency(res.user.consistencyScore);
        }
        if ((tRes.tasks && tRes.tasks.length > 0) || (res.user?.consistencyScore && res.user.consistencyScore > 0)) {
          setHasData(true);
        }
      } catch (err) {
        console.error("Failed to load user behavior:", err);
      }
    }
    loadUser();
  }, []);

  const dimensions = [
    { label: 'Consistency', val: consistency, colorClass: 'fillPrimary' },
    { label: 'Planning', val: 78, colorClass: 'fillPrimary' },
    { label: 'Follow-through', val: 84, colorClass: 'fillPrimary' },
    { label: 'Focus Quality', val: 91, colorClass: 'fillPrimary' },
    { label: 'Health Balance', val: 68, colorClass: 'fillWarning' }
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Your FocusFlow AI Behavior Profile</h3>
        <p>Based on continuous autonomous executive tracking</p>
      </div>

      <div className={styles.grid}>
        {!hasData ? (
          <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: '#8B8BA0' }}>
            <h4 style={{ color: '#F0F0F5', fontSize: '18px', marginBottom: '8px' }}>No data yet. Complete some tasks to see your insights.</h4>
            <p>FocusFlow AI continuously tracks your work patterns. Add and complete tasks to generate your behavioral profile.</p>
          </div>
        ) : (
          <>
            <div className={styles.insightsCol}>
          <h4>Behavioral Patterns</h4>
          <ul className={styles.insightsList}>
            <li><span>🌅 Peak Hours:</span> <strong>9 AM – 11 AM</strong></li>
            <li><span>⏱ Avg Focus Block:</span> <strong>45 minutes</strong></li>
            <li><span>📅 Most Productive:</span> <strong>Tuesday, Wednesday</strong></li>
            <li><span>🔁 Most Postponed:</span> <strong className="text-warning">DSA Practice</strong></li>
            <li><span>⚡ Average Task Delay:</span> <strong>12 minutes</strong></li>
          </ul>
        </div>

        {/* Right: Archetype Badge & Progress Bars */}
        <div className={styles.archetypeCol}>
          <div className={styles.badgeBox}>
            <span className={styles.badgeTitle}>Deep Focus Strategist</span>
            <p>You execute high-priority tasks during peak biological focus windows with high consistency.</p>
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
