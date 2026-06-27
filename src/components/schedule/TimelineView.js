'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, HelpCircle, Move, Edit3, Plus, Sparkles } from 'lucide-react';
import styles from './TimelineView.module.css';

export default function TimelineView({ onTriggerReplan, scheduledItems }) {
  const [view, setView] = useState('Day'); // 'Day' | 'Week'
  const [activeWhy, setActiveWhy] = useState(null);

  const hours = Array.from({ length: 16 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

  const [blocks, setBlocks] = useState([
    { id: 't1', start: 9, duration: 2, title: '🎯 Deep Focus — DSA Practice', category: 'Focus Session', colorClass: 'blockPurple', why: "You're most productive 9–11 AM, and this task is P1 with a tomorrow deadline." },
    { id: 'b1', start: 11, duration: 0.25, title: 'Buffer', isBuffer: true },
    { id: 't2', start: 11.25, duration: 0.75, title: '📝 Assignment Review', category: 'Assignment', colorClass: 'blockBlue', why: "Scheduled after cognitive rest buffer while concentration is still high." },
    { id: 't3', start: 13, duration: 1, title: '📞 Team Meeting', category: 'Meeting', colorClass: 'blockTeal', isMeeting: true, canJoin: true, why: "Synced from Google Calendar." },
    { id: 't4', start: 16, duration: 1.5, title: '🔥 API Integration Sprint', category: 'Urgent', colorClass: 'blockRed', why: "Critical backend connection due by 6 PM." },
    { id: 'd1', start: 21, duration: 0.5, title: '🟡 Assignment Due Deadline Marker', category: 'Deadline', colorClass: 'blockAmber' }
  ]);

  const weekDays = [
    { day: 'Mon', date: '23', load: 70, loadColor: 'barWarning' },
    { day: 'Tue', date: '24', load: 85, loadColor: 'barDanger' },
    { day: 'Wed', date: '25', load: 45, loadColor: 'barSuccess' },
    { day: 'Thu', date: '26', load: 90, loadColor: 'barDanger' },
    { day: 'Fri (Today)', date: '27', load: 72, loadColor: 'barWarning', active: true },
    { day: 'Sat', date: '28', load: 20, loadColor: 'barSuccess' },
    { day: 'Sun', date: '29', load: 10, loadColor: 'barSuccess' }
  ];

  return (
    <div className={styles.container}>
      {/* Top Nav Header */}
      <div className={styles.navHeader}>
        <div className={styles.dateNav}>
          <button className={styles.navIconBtn}><ChevronLeft size={18} /></button>
          <span className={styles.currentDate}>Friday, June 27</span>
          <button className={styles.navIconBtn}><ChevronRight size={18} /></button>
          <button className={styles.todayPill} onClick={() => setView('Day')}>Today</button>
        </div>

        <div className={styles.viewToggles}>
          <button
            className={`${styles.toggleBtn} ${view === 'Day' ? styles.toggleActive : ''}`}
            onClick={() => setView('Day')}
          >
            Day
          </button>
          <button
            className={`${styles.toggleBtn} ${view === 'Week' ? styles.toggleActive : ''}`}
            onClick={() => setView('Week')}
          >
            Week
          </button>
        </div>
      </div>

      {/* View Content */}
      {view === 'Day' ? (
        <div className={styles.dayView}>
          <div className={styles.timelineGrid}>
            {/* Current Time Indicator Line (~14:55) */}
            <div className={styles.currentTimeLine} style={{ top: `${(14.9 - 7) * 60}px` }}>
              <div className={styles.currentTimeDot} />
              <span className={styles.currentTimeLabel}>14:55</span>
            </div>

            {hours.map((hourStr, idx) => (
              <div key={hourStr} className={styles.hourSlot} style={{ top: `${idx * 60}px` }}>
                <span className={styles.hourLabel}>{hourStr}</span>
                <div className={styles.hourLine}>
                  <div className={styles.addSlotHover}>+ Add Block</div>
                </div>
              </div>
            ))}

            {/* Render Blocks */}
            {blocks.map((b) => {
              const topPx = (b.start - 7) * 60;
              const heightPx = Math.max(b.duration * 60, 24);

              if (b.isBuffer) {
                return (
                  <div
                    key={b.id}
                    className={styles.bufferBlock}
                    style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                  >
                    <span>⚡ AI Buffer Zone (15 min rest)</span>
                  </div>
                );
              }

              return (
                <div
                  key={b.id}
                  className={`${styles.eventBlock} ${styles[b.colorClass]}`}
                  style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                >
                  <div className={styles.eventHeader}>
                    <div className={styles.eventTitleRow}>
                      <span className={styles.eventTitle}>{b.title}</span>
                      {b.isMeeting && b.canJoin && (
                        <button
                          className={styles.joinBtn}
                          onClick={() => alert('Joining Google Meet video call...')}
                        >
                          <Video size={12} />
                          <span>Join Video</span>
                        </button>
                      )}
                    </div>

                    <div className={styles.eventActions}>
                      {b.why && (
                        <button
                          className={styles.whyBtn}
                          onClick={() => setActiveWhy(activeWhy === b.id ? null : b.id)}
                        >
                          <HelpCircle size={14} />
                          <span>Why?</span>
                        </button>
                      )}
                      <button className={styles.iconAction} title="Move"><Move size={14} /></button>
                      <button className={styles.iconAction} title="Edit"><Edit3 size={14} /></button>
                    </div>
                  </div>

                  <div className={styles.eventMeta}>
                    <span>{`${Math.floor(b.start)}:${((b.start % 1) * 60).toString().padStart(2, '0')}`}</span>
                    <span>·</span>
                    <span>{b.category}</span>
                  </div>

                  {activeWhy === b.id && (
                    <div className={`${styles.whyPopover} scale-in`}>
                      <div className={styles.whyTitle}>
                        <Sparkles size={14} className="text-primary-color" />
                        <span>Why did AI schedule this here?</span>
                      </div>
                      <p>{b.why}</p>
                      <button className={styles.gotItBtn} onClick={() => setActiveWhy(null)}>Got it</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Week View */
        <div className={styles.weekView}>
          <div className={styles.weekGrid}>
            {weekDays.map((wd, i) => (
              <div
                key={i}
                className={`${styles.dayCol} ${wd.active ? styles.dayColActive : ''}`}
                onClick={() => setView('Day')}
              >
                <div className={styles.dayColHeader}>
                  <span className={styles.dayName}>{wd.day}</span>
                  <span className={styles.dayDate}>{wd.date}</span>
                </div>
                <div className={styles.loadTrack}>
                  <div className={`${styles.loadFill} ${styles[wd.loadColor]}`} style={{ width: `${wd.load}%` }} />
                </div>

                <div className={styles.dayCards}>
                  <div className={styles.miniCardPurple}>DSA Practice</div>
                  <div className={styles.miniCardBlue}>Assignment</div>
                  <div className={styles.miniCardTeal}>Team Meeting</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
