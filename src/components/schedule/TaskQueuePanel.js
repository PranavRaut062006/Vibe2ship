'use client';

import { useState, useEffect } from 'react';
import { GripVertical, Sparkles, CalendarPlus, CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react';
import { fetchTasks, updateTask, deleteTask } from '@/lib/api';
import styles from './TaskQueuePanel.module.css';

export default function TaskQueuePanel({ onScheduleTask }) {
  const [filter, setFilter] = useState('All'); // 'All' | 'Focus' | 'Meetings' | 'Personal'
  const [tasks, setTasks] = useState([]);

  const loadTasks = async () => {
    try {
      const res = await fetchTasks();
      if (res.tasks) {
        const formatted = res.tasks.filter(t => t.status !== 'completed').map(t => {
          const pClass = t.priority ? t.priority.toLowerCase() : 'p2';
          const dotClass = t.category === 'Meetings' ? 'dotTeal' : t.category === 'Personal' ? 'dotBlue' : 'dotPurple';
          return {
            id: t._id || t.id,
            rawTask: t,
            name: t.title,
            category: t.category || 'Focus',
            colorClass: dotClass,
            estimate: `${t.estimatedMinutes || 60} mins`,
            p: t.priority || 'P2',
            pClass
          };
        });
        setTasks(formatted);
      }
    } catch (err) {
      console.error("Failed to load task queue:", err);
    }
  };

  useEffect(() => {
    loadTasks();
    const handleSync = () => loadTasks();
    window.addEventListener('taskCreated', handleSync);
    window.addEventListener('taskUpdated', handleSync);
    window.addEventListener('scheduleUpdated', handleSync);
    window.addEventListener('userAuthChanged', handleSync);
    return () => {
      window.removeEventListener('taskCreated', handleSync);
      window.removeEventListener('taskUpdated', handleSync);
      window.removeEventListener('scheduleUpdated', handleSync);
      window.removeEventListener('userAuthChanged', handleSync);
    };
  }, []);

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.category === filter);

  const handleToggleComplete = async (task) => {
    try {
      await updateTask(task.id, { status: 'completed' });
      setTasks(prev => prev.filter(t => t.id !== task.id));
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  const handleEdit = async (task) => {
    const newTitle = prompt("Edit task title:", task.name);
    if (!newTitle || newTitle.trim() === task.name) return;
    try {
      await updateTask(task.id, { title: newTitle.trim() });
      await loadTasks();
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
    } catch (err) {
      console.error("Failed to edit task:", err);
    }
  };

  const handleDelete = async (task) => {
    if (!confirm(`Delete task "${task.name}"?`)) return;
    try {
      await deleteTask(task.id);
      setTasks(prev => prev.filter(t => t.id !== task.id));
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleSchedule = (task) => {
    if (onScheduleTask) onScheduleTask(task);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Task Queue</h3>
          <span className="ai-badge">AI Sorted</span>
        </div>

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
            <p>No pending tasks in queue. Add tasks via Planner or AI Assistant.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className={styles.queueItem}>
              <div className={styles.itemLeft}>
                <div onClick={() => handleToggleComplete(task)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }} title="Mark Complete">
                  <Circle size={18} />
                </div>
                <div className={`${styles.dot} ${styles[task.colorClass]}`} />
                <span className={styles.taskName}>{task.name}</span>
              </div>

              <div className={styles.itemRight}>
                <span className={styles.estBadge}>{task.estimate}</span>
                <span className={`${styles.pBadge} ${styles[task.pClass]}`}>{task.p}</span>
                
                <button
                  onClick={() => handleEdit(task)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  title="Edit Task"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  onClick={() => handleDelete(task)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  title="Delete Task"
                >
                  <Trash2 size={14} />
                </button>

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
    </div>
  );
}
