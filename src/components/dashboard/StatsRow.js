'use client';

import styles from './StatsRow.module.css';

export default function StatsRow() {
  const stats = [
    {
      label: "Today's Tasks",
      value: "8",
      sub: <><span className="text-accent">3 done</span> · 5 remaining</>
    },
    {
      label: "Focus Score",
      value: <span className="text-primary-color">92</span>,
      unit: "/100",
      sub: <><span className="text-accent">↑ 5</span> from yesterday</>
    },
    {
      label: "Streak",
      value: "14",
      unit: " days",
      sub: "Personal best! 🔥"
    },
    {
      label: "Deadline Risks",
      value: <span className="text-warning">2</span>,
      sub: <><span className="text-danger">1 urgent</span> · 1 moderate</>
    }
  ];

  return (
    <div className={`${styles.row} fade-in`}>
      {stats.map((stat, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.label}>{stat.label}</div>
          <div className={styles.valueWrapper}>
            <span className="mono">{stat.value}</span>
            {stat.unit && <span className={styles.unit}>{stat.unit}</span>}
          </div>
          <div className={styles.sub}>{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}
