'use client';

import { useState } from 'react';
import { GripVertical, Sparkles, CalendarPlus } from 'lucide-react';
import styles from './TaskQueuePanel.module.css';

export default function TaskQueuePanel({ onScheduleTask }) {
  const [filter, setFilter] = useState('All'); // 'All' | 'Focus' | 'Meetings' | 'Personal'
  const [tasks, setTasks] = useState([
    { id: 'q1', name: 'DSA Practice — Dynamic Programming', category: 'Focus', colorClass: 'dotPurple', estimate: '2 hrs', p: 'P1', pClass: 'p1' },
    { id: 'q2', name: 'System Architecture Review', category: 'Focus', colorClass: 'dotPurple', estimate: '1 hr', p: 'P2', pClass: 'p2' },
    { id: 'q3', name: '1-on-1 with Mentor', category: 'Meetings', colorClass: 'dotTeal', estimate: '30 mins', p: 'P2', pClass: 'p2' },
    { id: 'q4', name: 'Gym / Workout Session', category: 'Personal', colorClass: 'dotBlue', estimate: '45 mins', p: 'P3', pClass: 'p3' },
    { id: 'q5', name: 'Update LinkedIn Profile & CV', category: 'Personal', colorClass: 'dotBlue', estimate: '30 mins', p: 'P3', pClass: 'p3' }
  ]);

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
            <p>No tasks in this category.</p>
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
            Schedule <strong>DSA Practice</strong> before 11 AM for best cognitive focus.
          </p>
        </div>
      </div>
    </div>
  );
}
