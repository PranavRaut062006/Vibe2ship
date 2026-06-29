'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Video, HelpCircle, Move, Edit3, Plus, Sparkles, Clock, Circle, CheckCircle2, Trash2 } from 'lucide-react';
import { fetchSchedule, generateSchedule, updateScheduleBlocks } from '@/lib/api';
import styles from './TimelineView.module.css';

const parseTimeToDecimal = (timeStr) => {
  if (!timeStr) return 9;
  const [h, m] = timeStr.split(':').map(Number);
  return h + (m || 0) / 60;
};

const decimalToTime = (dec) => {
  const h = Math.floor(dec);
  const m = Math.round((dec - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export default function TimelineView({ onTriggerReplan, scheduledItems }) {
  const [view, setView] = useState('Day'); // 'Day' | 'Week'
  const [activeWhy, setActiveWhy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rawBlocks, setRawBlocks] = useState([]);
  const [blocks, setBlocks] = useState([]);

  // Drag and drop state
  const [draggedBlockIndex, setDraggedBlockIndex] = useState(null);

  // Edit Modal
  const [editingIndex, setEditingIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editDurationMins, setEditDurationMins] = useState(60);

  const hours = Array.from({ length: 16 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

  useEffect(() => {
    loadSchedule();
    window.addEventListener('scheduleUpdated', loadSchedule);
    return () => window.removeEventListener('scheduleUpdated', loadSchedule);
  }, []);

  async function loadSchedule() {
    setLoading(true);
    try {
      const res = await fetchSchedule('today');
      if (res.schedule && res.schedule.blocks && res.schedule.blocks.length > 0) {
        setRawBlocks(res.schedule.blocks);
        formatAndSetBlocks(res.schedule.blocks);
      } else {
        setRawBlocks([]);
        setBlocks([]);
      }
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setLoading(false);
    }
  }

  const formatAndSetBlocks = (dataBlocks) => {
    const formatted = dataBlocks.map((b, idx) => {
      const startDec = parseTimeToDecimal(b.startTime);
      const endDec = parseTimeToDecimal(b.endTime);
      const dur = Math.max(endDec - startDec, 0.25);
      const isBuffer = b.type === 'buffer' || b.type === 'break';
      let colorClass = 'blockPurple';
      if (b.type === 'meeting') colorClass = 'blockTeal';
      else if (b.type === 'assignment') colorClass = 'blockBlue';
      else if (b.title?.toLowerCase().includes('urgent') || b.title?.toLowerCase().includes('sprint')) colorClass = 'blockRed';

      return {
        idx,
        id: b._id || `block_${idx}`,
        start: startDec,
        duration: dur,
        title: b.title || 'Untitled Block',
        category: b.type?.toUpperCase() || 'FOCUS',
        colorClass,
        isBuffer,
        isMeeting: b.type === 'meeting',
        canJoin: b.type === 'meeting',
        why: b.why || `Scheduled from ${b.startTime} to ${b.endTime}.`
      };
    });
    setBlocks(formatted);
  };

  const saveToFirebase = async (newRawBlocks) => {
    setRawBlocks(newRawBlocks);
    formatAndSetBlocks(newRawBlocks);
    try {
      await updateScheduleBlocks('today', newRawBlocks);
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (err) {
      console.error("Error saving updated blocks to Firebase:", err);
    }
  };

  const handleDeleteBlock = async (index) => {
    if (!confirm("Delete this calendar block?")) return;
    const updated = rawBlocks.filter((_, i) => i !== index);
    await saveToFirebase(updated);
  };

  const handleCompleteBlock = async (index) => {
    const updated = rawBlocks.filter((_, i) => i !== index);
    await saveToFirebase(updated);
  };

  // Move block start time by deltaMins (+15 or -15)
  const handleMoveTime = async (index, deltaMins) => {
    const b = rawBlocks[index];
    if (!b) return;
    const startDec = parseTimeToDecimal(b.startTime) + deltaMins / 60;
    const durDec = parseTimeToDecimal(b.endTime) - parseTimeToDecimal(b.startTime);
    const newStart = Math.max(7, Math.min(22, startDec));
    const newEnd = newStart + durDec;

    const updated = [...rawBlocks];
    updated[index] = { ...b, startTime: decimalToTime(newStart), endTime: decimalToTime(newEnd) };
    await saveToFirebase(updated);
  };

  // Resize block duration by deltaMins (+15 or -15)
  const handleResizeDuration = async (index, deltaMins) => {
    const b = rawBlocks[index];
    if (!b) return;
    const startDec = parseTimeToDecimal(b.startTime);
    let durDec = parseTimeToDecimal(b.endTime) - startDec + deltaMins / 60;
    durDec = Math.max(0.25, durDec); // min 15 mins
    const newEnd = startDec + durDec;

    const updated = [...rawBlocks];
    updated[index] = { ...b, endTime: decimalToTime(newEnd) };
    await saveToFirebase(updated);
  };

  const handleOpenEdit = (index) => {
    const b = rawBlocks[index];
    if (!b) return;
    setEditingIndex(index);
    setEditTitle(b.title || '');
    setEditStartTime(b.startTime || '09:00');
    const dur = Math.round((parseTimeToDecimal(b.endTime) - parseTimeToDecimal(b.startTime)) * 60);
    setEditDurationMins(dur > 0 ? dur : 60);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (editingIndex === null) return;
    const startDec = parseTimeToDecimal(editStartTime);
    const endDec = startDec + Number(editDurationMins) / 60;

    const updated = [...rawBlocks];
    updated[editingIndex] = {
      ...updated[editingIndex],
      title: editTitle,
      startTime: editStartTime,
      endTime: decimalToTime(endDec)
    };
    setEditingIndex(null);
    await saveToFirebase(updated);
  };

  const handleAddBlockAtHour = async (hourNum) => {
    const startTime = `${String(hourNum).padStart(2, '0')}:00`;
    const endTime = `${String(hourNum + 1).padStart(2, '0')}:00`;
    const newBlock = {
      title: 'New Calendar Block',
      type: 'focus',
      startTime,
      endTime,
      why: 'Manually added to calendar.'
    };
    const updated = [...rawBlocks, newBlock];
    await saveToFirebase(updated);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, idx) => {
    setDraggedBlockIndex(idx);
    e.dataTransfer.setData('text/plain', idx);
  };

  const handleDropOnHour = async (e, hourNum) => {
    e.preventDefault();
    if (draggedBlockIndex === null) return;
    const b = rawBlocks[draggedBlockIndex];
    if (!b) return;

    const durDec = parseTimeToDecimal(b.endTime) - parseTimeToDecimal(b.startTime);
    const newStart = hourNum;
    const newEnd = newStart + durDec;

    const updated = [...rawBlocks];
    updated[draggedBlockIndex] = { ...b, startTime: decimalToTime(newStart), endTime: decimalToTime(newEnd) };
    setDraggedBlockIndex(null);
    await saveToFirebase(updated);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const weekDays = [
    { day: 'Mon', date: '23', load: 70, loadColor: 'barWarning' },
    { day: 'Tue', date: '24', load: 85, loadColor: 'barDanger' },
    { day: 'Wed', date: '25', load: 60, loadColor: 'barTeal' },
    { day: 'Thu', date: '26', load: 90, loadColor: 'barDanger' },
    { day: 'Fri', date: '27', load: 50, loadColor: 'barTeal' },
    { day: 'Sat', date: '28', load: 20, loadColor: 'barTeal' },
    { day: 'Sun', date: '29', load: 30, loadColor: 'barTeal' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.viewTabs}>
          <button
            className={`${styles.viewTab} ${view === 'Day' ? styles.activeTab : ''}`}
            onClick={() => setView('Day')}
          >
            Day View
          </button>
          <button
            className={`${styles.viewTab} ${view === 'Week' ? styles.activeTab : ''}`}
            onClick={() => setView('Week')}
          >
            Week Overview
          </button>
        </div>

        <div className={styles.controlsRight}>
          <div className={styles.dateNav}>
            <button className={styles.navBtn}><ChevronLeft size={16} /></button>
            <span className={styles.dateText}>Today, Jun 28</span>
            <button className={styles.navBtn}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {view === 'Day' ? (
        <div className={styles.timelineScroll}>
          <div className={styles.timelineGrid}>
            {hours.map((hourStr, idx) => {
              const hourNum = idx + 7;
              return (
                <div
                  key={hourStr}
                  className={styles.hourSlot}
                  style={{ top: `${idx * 60}px` }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnHour(e, hourNum)}
                >
                  <span className={styles.hourLabel}>{hourStr}</span>
                  <div className={styles.hourLine}>
                    <div className={styles.addSlotHover} onClick={() => handleAddBlockAtHour(hourNum)}>
                      + Add Block at {hourStr}
                    </div>
                  </div>
                </div>
              );
            })}

            {blocks.length === 0 && !loading && (
              <div style={{ position: 'absolute', top: '180px', left: '70px', right: '20px', padding: '32px', background: 'rgba(26, 26, 36, 0.95)', border: '1px dashed #6C63FF', borderRadius: '16px', textAlign: 'center', zIndex: 5 }}>
                <Clock size={32} color="#6C63FF" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '18px', color: '#F0F0F5', margin: '0 0 8px' }}>No calendar blocks yet</h4>
                <p style={{ fontSize: '14px', color: '#8B8BA0', margin: '0 0 16px' }}>Hover over any time line and click &quot;+ Add Block&quot; to manually build your schedule, or use your Planner tasks.</p>
              </div>
            )}

            {blocks.map((b) => {
              const topPx = (b.start - 7) * 60;
              const heightPx = Math.max(b.duration * 60, 40);

              if (b.isBuffer) {
                return (
                  <div
                    key={b.id}
                    className={styles.bufferBlock}
                    style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                  >
                    <span>⚡ Buffer Zone (Cognitive Rest)</span>
                  </div>
                );
              }

              return (
                <div
                  key={b.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, b.idx)}
                  className={`${styles.eventBlock} ${styles[b.colorClass]}`}
                  style={{ top: `${topPx}px`, height: `${heightPx}px`, cursor: 'grab' }}
                >
                  <div className={styles.eventHeader}>
                    <div className={styles.eventTitleRow}>
                      <span className={styles.eventTitle}>{b.title}</span>
                      {b.isMeeting && b.canJoin && (
                        <button className={styles.joinBtn} onClick={() => alert('Joining meeting...')}>
                          <Video size={12} />
                          <span>Join</span>
                        </button>
                      )}
                    </div>

                    <div className={styles.eventActions}>
                      <button className={styles.actionIconBtn} onClick={() => handleCompleteBlock(b.idx)} title="Mark Complete"><Circle size={14} /></button>
                      <button className={styles.actionIconBtn} onClick={() => handleMoveTime(b.idx, -15)} title="Move earlier 15m">⬆</button>
                      <button className={styles.actionIconBtn} onClick={() => handleMoveTime(b.idx, 15)} title="Move later 15m">⬇</button>
                      <button className={styles.actionIconBtn} onClick={() => handleResizeDuration(b.idx, 15)} title="Extend duration +15m">+15m</button>
                      <button className={styles.actionIconBtn} onClick={() => handleOpenEdit(b.idx)} title="Edit block directly"><Edit3 size={14} /></button>
                      <button className={styles.actionIconBtn} onClick={() => handleDeleteBlock(b.idx)} title="Delete Block" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className={styles.eventBody}>
                    <span className={styles.eventCategory}>{b.category}</span>
                    <span className={styles.eventDuration}>{decimalToTime(b.start)} ({Math.round(b.duration * 60)} mins)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={styles.weekView}>
          <div className={styles.weekGrid}>
            {weekDays.map((col) => (
              <div key={col.day} className={`${styles.weekCol} ${col.active ? styles.weekColActive : ''}`}>
                <div className={styles.weekColHeader}>
                  <span className={styles.colDay}>{col.day}</span>
                  <span className={styles.colDate}>{col.date}</span>
                </div>
                <div className={styles.workloadBarContainer}>
                  <div className={`${styles.workloadBar} ${styles[col.loadColor]}`} style={{ height: `${col.load}%` }} />
                </div>
                <span className={styles.loadPercent}>{col.load}% Load</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingIndex !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', width: '400px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#fff' }}>Edit Calendar Block</h3>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Title</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} required style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Start Time</label>
                <input type="time" value={editStartTime} onChange={e => setEditStartTime(e.target.value)} required style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Duration (Minutes)</label>
                <input type="number" value={editDurationMins} onChange={e => setEditDurationMins(e.target.value)} required min="15" step="15" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', marginTop: '4px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setEditingIndex(null)} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 14px', background: 'var(--primary-color)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
