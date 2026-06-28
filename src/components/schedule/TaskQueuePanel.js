'use client';

import { useState, useEffect } from 'react';
import { GripVertical, Sparkles, CalendarPlus } from 'lucide-react';
import { fetchTasks } from '@/lib/api';
import styles from './TaskQueuePanel.module.css';

export default function TaskQueuePanel({ onScheduleTask }) {
  const [filter, setFilter] = useState('All'); // 'All' | 'Focus' | 'Meetings' | 'Personal'
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetchTasks();
        if (res.tasks) {
          const formatted = res.tasks.filter(t => t.status === 'approved').map(t => {
            const pClass = t.priority ? t.priority.toLowerCase() : 'p2';
            const dotClass = t.category === 'Meetings' ? 'dotTeal' : t.category === 'Personal' ? 'dotBlue' : 'dotPurple';
            return {
              id: t._id || t.id,
              name: t.title,
              category: t.category || 'Focus',
              colorClass: dotClass,
              estimate: `${t.estimatedMinutes || 45} mins`,
              p: t.priority || 'P2',
              pClass
            };
          });
          setTasks(formatted);
        }
      } catch (err) {
        console.error("Failed to load task queue:", err);
      }
    }
    loadTasks();
    window.addEventListener('taskCreated', loadTasks);
    return () => window.removeEventListener('taskCreated', loadTasks);
  }, []);

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.category === filter);

  const handleSchedule = (task) => {
    onScheduleTask(task);
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Task Queue</h3>
          <span className="ai-badge">AI Sorted</span>
        </div>

        {/* Filter row */}
        <div className={styles.filters}>
          {['All', 'Focus', 'Meetings', 'Personal'].map((f) => (
            <button
              key={f}
              className={`${styles.filterPill} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.queueList}>
        {filteredTasks.length === 0 ? (
          <div className={styles.emptyQueue}>
            <p>No approved tasks in queue. Add tasks via Quick Add or Inbox scanner.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className={styles.queueItem}>
              <div className={styles.itemLeft}>
                <GripVertical size={16} className={styles.dragHandle} />
                <div className={`${styles.dot} ${styles[task.colorClass]}`} />
                <span className={styles.taskName}>{task.name}</span>
              </div>

              <div className={styles.itemRight}>
                <span className={styles.estBadge}>{task.estimate}</span>
                <span className={`${styles.pBadge} ${styles[task.pClass]}`}>{task.p}</span>
                <button
                  className={styles.scheduleBtn}
                  onClick={() => handleSchedule(task)}
                  title="Place into timeline"
                >
                  <CalendarPlus size={14} />
                  <span>Schedule</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Footer Section */}
      <div className={styles.footer}>
        <div className={styles.unscheduledCount}>
          Unscheduled: <strong>{tasks.length} tasks</strong>
        </div>

        <div className={`${styles.aiSuggestion} ai-glow`}>
          <div className={styles.sugHeader}>
            <Sparkles size={14} className="text-primary-color" />
            <span>AI Suggestion</span>
          </div>
          <p>
            Schedule P1 priority focus items before 11 AM for best cognitive flow.
          </p>
        </div>
      </div>
    </div>
  );
}
