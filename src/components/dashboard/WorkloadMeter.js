'use client';

import styles from './WorkloadMeter.module.css';

export default function WorkloadMeter() {
  const bars = [
    { label: 'Today', percentage: 72, colorClass: 'barWarning', textClass: 'text-warning', desc: 'Moderate' },
    { label: 'Tomorrow', percentage: 45, colorClass: 'barSuccess', textClass: 'text-accent', desc: 'Light' },
    { label: 'This Week', percentage: 88, colorClass: 'barDanger', textClass: 'text-danger', desc: 'Heavy' }
  ];

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Workload</h3>

      <div className={styles.barsList}>
        {bars.map((bar, i) => (
          <div key={i} className={styles.barItem}>
            <div className={styles.barHeader}>
              <span className={styles.barLabel}>{bar.label}</span>
              <span className={`mono ${bar.textClass}`}>
                {bar.percentage}% · {bar.desc}
              </span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${styles[bar.colorClass]}`}
                style={{ width: `${bar.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className={styles.advice}>
        Tomorrow looks lighter. Consider moving some tasks forward.
      </p>
    </div>
  );
}
