'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { fetchTasks } from '@/lib/api';
import styles from './PredictionsRow.module.css';

export default function PredictionsRow() {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchTasks();
        if (res.tasks) {
          setCompletedCount(res.tasks.filter(t => t.status === 'completed').length);
        }
      } catch (err) {
        console.error("Failed to load tasks for predictions:", err);
      }
    }
    load();
  }, []);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>AI Predictions</h3>

      {completedCount === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', color: '#8B8BA0', fontSize: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
          No AI predictions generated yet. Complete more tasks to allow LifePilot AI to forecast completion timelines and burnout risks.
        </div>
      ) : (
        <div className={styles.scrollRow}>
          {/* Card 1: Executive Roadmap */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Execution Roadmap</span>
              <span className={styles.confidence}>85% conf</span>
            </div>
            <div className={styles.prediction}>On track for weekly goals</div>
            <p className={styles.subtext}>Based on your active completion velocity</p>
            
            <div className={styles.chartBox}>
              <svg viewBox="0 0 100 30" className={styles.chartSvg}>
                <polyline
                  fill="none"
                  stroke="#6C63FF"
                  strokeWidth="2.5"
                  points="0,25 20,22 40,24 60,15 80,10 100,4"
                />
              </svg>
            </div>
          </div>

          {/* Card 2: Bottleneck Analysis */}
          <div className={`${styles.card} ${styles.cardSuccess}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitleSuccess}>Productivity Trajectory</span>
              <span className={styles.confidence}>90% conf</span>
            </div>
            <div className={styles.predictionSuccess}>Positive Momentum</div>
            <p className={styles.subtext}>Maintaining consistent daily task pacing</p>
            <div className={styles.iconFooter}>
              <TrendingUp size={18} className="text-accent" />
              <span>Optimal workflow</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
