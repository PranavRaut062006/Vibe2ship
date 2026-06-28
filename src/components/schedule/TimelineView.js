'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Video, HelpCircle, Move, Edit3, Plus, Sparkles } from 'lucide-react';
import { fetchSchedule, generateSchedule } from '@/lib/api';
import styles from './TimelineView.module.css';

const parseTimeToDecimal = (timeStr) => {
  if (!timeStr) return 9;
  const [h, m] = timeStr.split(':').map(Number);
  return h + (m || 0) / 60;
};

export default function TimelineView({ onTriggerReplan, scheduledItems }) {
  const [view, setView] = useState('Day'); // 'Day' | 'Week'
  const [activeWhy, setActiveWhy] = useState(null);
  const [loading, setLoading] = useState(false);

  const hours = Array.from({ length: 16 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true);
      try {
        const res = await fetchSchedule('today');
        if (res.schedule && res.schedule.blocks && res.schedule.blocks.length > 0) {
          const formatted = res.schedule.blocks.map((b, idx) => {
            const startDec = parseTimeToDecimal(b.startTime);
            const endDec = parseTimeToDecimal(b.endTime);
            const dur = Math.max(endDec - startDec, 0.25);
            const isBuffer = b.type === 'buffer' || b.type === 'break';
            let colorClass = 'blockPurple';
            if (b.type === 'meeting') colorClass = 'blockTeal';
            else if (b.type === 'assignment') colorClass = 'blockBlue';
            else if (b.title?.toLowerCase().includes('urgent') || b.title?.toLowerCase().includes('sprint')) colorClass = 'blockRed';

            return {
              id: b._id || `block_${idx}`,
              start: startDec,
              duration: dur,
              title: b.title,
              category: b.type?.toUpperCase() || 'FOCUS',
              colorClass,
              isBuffer,
              isMeeting: b.type === 'meeting',
              canJoin: b.type === 'meeting',
              why: `AI scheduled from ${b.startTime} to ${b.endTime} based on executive priority.`
            };
          });
          setBlocks(formatted);
        } else {
          setBlocks([]);
        }
      } catch (err) {
        console.error("Failed to load schedule:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
    window.addEventListener('scheduleUpdated', loadSchedule);
    return () => window.removeEventListener('scheduleUpdated', loadSchedule);
  }, []);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await generateSchedule('today');
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
    } catch (err) {
      console.error("Failed to regenerate schedule:", err);
    } finally {
      setLoading(false);
    }
  };

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
          <span className={styles.currentDate}>Today&apos;s Executive Timeline</span>
          <button className={styles.navIconBtn}><ChevronRight size={18} /></button>
          <button className={styles.todayPill} onClick={handleRegenerate} disabled={loading}>
            <Sparkles size={14} style={{ marginRight: '4px' }} />
            {loading ? 'AI Optimizing...' : 'Re-Optimize AI'}
          </button>
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
              <span className={styles.currentTimeLabel}>Live</span>
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
            {blocks.length === 0 && (
              <div style={{ position: 'absolute', top: '180px', left: '70px', right: '20px', padding: '32px', background: 'rgba(26, 26, 36, 0.9)', border: '1px dashed #6C63FF', borderRadius: '16px', textAlign: 'center', zIndex: 5, backdropFilter: 'blur(8px)' }}>
                <Sparkles size={32} color="#6C63FF" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '18px', color: '#F0F0F5', margin: '0 0 8px' }}>No schedule yet. Add tasks first, then generate your schedule.</h4>
                <p style={{ fontSize: '14px', color: '#8B8BA0', margin: '0 0 16px' }}>Your daily timeline is currently empty. Add tasks via Quick Add or Inbox scanner, then click Re-Optimize AI above.</p>
                <button onClick={handleRegenerate} disabled={loading} style={{ padding: '10px 20px', borderRadius: '10px', background: '#6C63FF', border: 'none', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  {loading ? 'Generating AI Schedule...' : 'Generate AI Schedule Now'}
                </button>
              </div>
            )}

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
                    <span>⚡ AI Buffer Zone (Cognitive Rest)</span>
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
                      <button className={styles.actionIconBtn} title="Move block"><Move size={14} /></button>
                      <button className={styles.actionIconBtn} title="Edit block"><Edit3 size={14} /></button>
                    </div>
                  </div>

                  <div className={styles.eventBody}>
                    <span className={styles.eventCategory}>{b.category}</span>
                    <span className={styles.eventDuration}>{Math.round(b.duration * 60)} mins</span>
                  </div>

                  {/* AI Explainability Tooltip / Popover */}
                  {activeWhy === b.id && (
                    <div className={`${styles.whyPopover} scale-in`}>
                      <div className={styles.whyHeader}>
                        <Sparkles size={14} className="text-primary-color" />
                        <span>AI Reasoning</span>
                      </div>
                      <p>{b.why}</p>
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
            {weekDays.map((col) => (
              <div key={col.day} className={`${styles.weekCol} ${col.active ? styles.weekColActive : ''}`}>
                <div className={styles.weekColHeader}>
                  <span className={styles.colDay}>{col.day}</span>
                  <span className={styles.colDate}>{col.date}</span>
                </div>

                <div className={styles.loadMeterContainer}>
                  <div className={styles.loadBarBg}>
                    <div
                      className={`${styles.loadBarFill} ${styles[col.loadColor]}`}
                      style={{ height: `${col.load}%` }}
                    />
                  </div>
                  <span className={styles.loadValue}>{col.load}% Load</span>
                </div>

                <div className={styles.weekMiniBlocks}>
                  <div className={styles.miniBlock}>Focus (3h)</div>
                  <div className={styles.miniBlock}>Meetings (2h)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
