'use client';

import { useState } from 'react';
import { ArrowRight, HelpCircle, Sparkles, X } from 'lucide-react';
import styles from './ScheduleCard.module.css';

export default function ScheduleCard({ onOpenSchedule }) {
  const [activeWhy, setActiveWhy] = useState(null);

  const blocks = [
    { id: 1, time: '09:00–11:00', title: '🎯 Deep Focus — DSA Practice', category: 'Focus Session', colorClass: 'blockPurple', why: "You're most productive 9–11 AM, and this task is P1 with a tomorrow deadline." },
    { id: 2, time: '11:00–11:15', title: '☕ Break', category: 'Recovery', colorClass: 'blockGray', why: "15-minute cognitive buffer to prevent burnout before review." },
    { id: 3, time: '11:15–12:00', title: '📝 Assignment Review', category: 'Assignment', colorClass: 'blockBlue', why: "High focus required while morning mental energy is still elevated." },
    { id: 4, time: '13:00–14:00', title: '📞 Team Meeting', category: 'Meeting', colorClass: 'blockTeal', why: "Synced automatically from Google Calendar invitation." }
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>Today&apos;s Schedule</h3>
          <span className="ai-badge">AI Generated</span>
        </div>

        <div className={styles.timeline}>
          {blocks.map((block) => (
            <div key={block.id} className={styles.item}>
              <div className={styles.timeCol}>
                <span className="mono">{block.time.split('–')[0]}</span>
                <div className={styles.line} />
              </div>

              <div className={`${styles.block} ${styles[block.colorClass]}`}>
                <div className={styles.blockHeader}>
                  <span className={styles.blockTitle}>{block.title}</span>
                  <button
                    className={styles.whyBtn}
                    onClick={() => setActiveWhy(activeWhy === block.id ? null : block.id)}
                    title="Why did AI schedule this here?"
                  >
                    <span>Why?</span>
                    <HelpCircle size={12} />
                  </button>
                </div>
                <div className={styles.blockMeta}>
                  <span>{block.time}</span>
                  <span>·</span>
                  <span>{block.category}</span>
                </div>

                {activeWhy === block.id && (
                  <div className={`${styles.whyPopover} scale-in`}>
                    <div className={styles.whyHeader}>
                      <Sparkles size={12} className="text-primary-color" />
                      <span>AI Scheduling Reasoning</span>
                      <button className={styles.whyClose} onClick={() => setActiveWhy(null)}>
                        <X size={12} />
                      </button>
                    </div>
                    <p>{block.why}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.openFullBtn} onClick={onOpenSchedule}>
            <span>Open Full Schedule</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className={styles.insightCard}>
        <div className={styles.insightHeader}>
          <Sparkles size={14} className="text-primary-color" />
          <span className={styles.insightLabel}>AI Insight</span>
        </div>
        <p className={styles.insightText}>
          You&apos;re most productive between <strong>9–11 AM</strong>. I&apos;ve scheduled your hardest task there.
        </p>
      </div>
    </div>
  );
}
