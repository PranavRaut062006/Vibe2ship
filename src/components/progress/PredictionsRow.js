'use client';

import { TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import styles from './PredictionsRow.module.css';

export default function PredictionsRow() {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>AI Predictions</h3>

      <div className={styles.scrollRow}>
        {/* Card 1: DSA Roadmap */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>DSA Roadmap</span>
            <span className={styles.confidence}>78% conf</span>
          </div>
          <div className={styles.prediction}>Completes in 4 months</div>
          <p className={styles.subtext}>At your current pace of 5.5 hours per week</p>
          
          {/* Mini Sparkline Chart */}
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

        {/* Card 2: Deadline Risk */}
        <div className={`${styles.card} ${styles.cardWarning}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitleWarning}>Deadline Risk</span>
            <span className={styles.confidence}>82% conf</span>
          </div>
          <div className={styles.predictionWarning}>3 deadlines at risk</div>
          <p className={styles.subtext}>Next month if late afternoon delay patterns continue</p>
          <div className={styles.iconFooter}>
            <AlertTriangle size={18} className="text-warning" />
            <span>High probability bottleneck</span>
          </div>
        </div>

        {/* Card 3: Productivity Trend */}
        <div className={`${styles.card} ${styles.cardSuccess}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitleSuccess}>Productivity Trend</span>
            <span className={styles.confidence}>91% conf</span>
          </div>
          <div className={styles.predictionSuccess}>Score reaches 94</div>
          <p className={styles.subtext}>Expected by next month based on streak momentum</p>
          <div className={styles.iconFooter}>
            <TrendingUp size={18} className="text-accent" />
            <span>Top 5% trajectory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
