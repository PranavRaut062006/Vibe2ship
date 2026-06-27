'use client';

import styles from './BehaviorProfileCard.module.css';

export default function BehaviorProfileCard() {
  const dimensions = [
    { label: 'Consistency', val: 82, colorClass: 'fillPrimary' },
    { label: 'Planning', val: 61, colorClass: 'fillPrimary' },
    { label: 'Follow-through', val: 74, colorClass: 'fillPrimary' },
    { label: 'Focus Quality', val: 89, colorClass: 'fillPrimary' },
    { label: 'Health Balance', val: 43, colorClass: 'fillWarning' }
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Your AI Behavior Profile</h3>
        <p>Based on 30 days of behavioral productivity data</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.insightsCol}>
          <h4>Behavioral Patterns</h4>
          <ul className={styles.insightsList}>
            <li><span>🌅 Peak Hours:</span> <strong>9 AM – 11 AM</strong></li>
            <li><span>⏱ Avg Focus Block:</span> <strong>47 minutes</strong></li>
            <li><span>📅 Most Productive:</span> <strong>Tuesday, Wednesday</strong></li>
            <li><span>🔁 Most Postponed:</span> <strong className="text-warning">DSA Practice</strong></li>
            <li><span>⚡ Average Task Delay:</span> <strong>34 minutes</strong></li>
          </ul>
        </div>

        {/* Right: Archetype Badge & Progress Bars */}
        <div className={styles.archetypeCol}>
          <div className={styles.badgeBox}>
            <span className={styles.badgeTitle}>Deadline Sprinter</span>
            <p>You tend to complete work close to deadlines. Your quality is high but stress levels spike.</p>
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
      </div>
    </div>
  );
}
