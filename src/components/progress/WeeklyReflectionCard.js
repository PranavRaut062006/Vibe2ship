'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { fetchTasks } from '@/lib/api';
import styles from './WeeklyReflectionCard.module.css';

export default function WeeklyReflectionCard() {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchTasks();
        if (res.tasks) {
          setCompletedCount(res.tasks.filter(t => t.status === 'completed').length);
        }
      } catch (err) {
        console.error("Failed to load tasks for reflection:", err);
      }
    }
    load();
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Sparkles size={18} className="text-primary-color" />
          <h3>This Week&apos;s AI Reflection</h3>
        </div>
        <span className={styles.dateRange}>Live Tracking</span>
      </div>

      {completedCount === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: '#8B8BA0', fontSize: '14px' }}>
          No weekly reflection generated yet. Complete tasks throughout the week to unlock deep executive insights.
        </div>
      ) : (
        <>
          <div className={styles.narrative}>
            <p>
              You have completed {completedCount} tasks so far. LifePilot AI is monitoring your pacing and peak focus intervals to optimize your upcoming week.
            </p>
          </div>

          <div className={styles.boxesRow}>
            <div className={styles.winsBox}>
              <span className={styles.boxTitleWins}>Executive Wins</span>
              <p>✓ Active execution logged · ✓ Building positive momentum</p>
            </div>

            <div className={styles.improvementsBox}>
              <span className={styles.boxTitleImprovements}>AI Focus Areas</span>
              <p>• Maintain continuous task tracking · • Log completion status daily</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
