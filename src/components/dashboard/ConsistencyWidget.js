'use client';

import { TrendingUp } from 'lucide-react';
import styles from './ConsistencyWidget.module.css';

export default function ConsistencyWidget() {
  const score = 87;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.categoryPill}>Consistent Performer</span>
      </div>

      <div className={styles.scoreArea}>
        <div className={styles.ringContainer}>
          <svg className={styles.svgRing} width="140" height="140" viewBox="0 0 140 140">
            {/* Background Track */}
            <circle
              className={styles.ringTrack}
              cx="70"
              cy="70"
              r={radius}
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              className={styles.ringProgress}
              cx="70"
              cy="70"
              r={radius}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className={styles.scoreText}>
            <span className="mono">{score}</span>
          </div>
        </div>

        <div className={styles.label}>/100 Consistency Score</div>
        
        <div className={styles.trend}>
          <TrendingUp size={14} className="text-accent" />
          <span className="text-accent">↑ 4 points this week</span>
        </div>
      </div>

      {/* Sparkline chart */}
      <div className={styles.sparklineContainer}>
        <div className={styles.sparklineLabel}>Last 7 Days Trend</div>
        <svg className={styles.sparkline} viewBox="0 0 200 40" preserveAspectRatio="none">
          <path
            d="M 0 32 L 33 28 L 66 34 L 100 20 L 133 15 L 166 22 L 200 8"
            fill="none"
            stroke="#00D4AA"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 0 32 L 33 28 L 66 34 L 100 20 L 133 15 L 166 22 L 200 8 L 200 40 L 0 40 Z"
            fill="url(#sparklineGrad)"
            opacity="0.2"
          />
          <defs>
            <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D4AA" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
