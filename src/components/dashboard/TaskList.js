'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchTasks } from '@/lib/api';
import styles from './TaskList.module.css';

export default function TaskList({ state = 'default', onConnectGmail, onViewAll }) {
  const [status, setStatus] = useState('loading');
  const [tasks, setTasks] = useState([]);

  const loadTasks = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetchTasks();
      const loaded = res.tasks || [];
      setTasks(loaded);
      setStatus(loaded.length === 0 ? 'empty' : 'default');
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadTasks();
    const handleCreated = () => loadTasks();
    window.addEventListener('taskCreated', handleCreated);
    return () => window.removeEventListener('taskCreated', handleCreated);
  }, [loadTasks]);

  if (status === 'loading') {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>Top Priorities</h3>
          <span className="ai-badge">AI Ranked</span>
        </div>
        <div className={styles.shimmerList}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.shimmerItem}>
              <div className={styles.shimmerCircle} />
              <div className={styles.shimmerLines}>
                <div className={styles.shimmerLineLong} />
                <div className={styles.shimmerLineShort} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>Top Priorities</h3>
          <span className="ai-badge">AI Ranked</span>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Mail size={24} className="text-primary-color" />
          </div>
          <h4>No tasks yet. Add your first task or scan Gmail.</h4>
          <p>Your executive priority queue is empty. Use Quick Add or scan your emails.</p>
          <button className={styles.connectBtn} onClick={onConnectGmail}>
            <span>Scan Inbox</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>Top Priorities</h3>
          <span className="ai-badge">AI Ranked</span>
        </div>
        <div className={styles.errorState}>
          <AlertCircle size={24} className="text-danger" />
          <p>Failed to sync top priorities from API server.</p>
          <button className={styles.retryBtn} onClick={loadTasks}>
            <RefreshCw size={14} />
            <span>Retry Sync</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Top Priorities</h3>
        <span className="ai-badge">AI Ranked</span>
      </div>

      <div className={styles.list}>
        {tasks.slice(0, 5).map((task) => {
          const pClass = task.priority ? task.priority.toLowerCase() : 'p2';
          return (
            <div key={task._id || task.id} className={styles.item}>
              <div className={`${styles.pCircle} ${styles[pClass]}`} title={`Priority ${task.priority}`} />

              <div className={styles.content}>
                <span className={styles.name}>{task.title}</span>
                <div className={styles.chips}>
                  <span className={styles.chip}>{task.deadline}</span>
                  <span className={styles.chip}>~{task.estimatedMinutes}m</span>
                </div>
              </div>

              <div className={styles.probWrapper}>
                <span className={`mono text-accent ${styles.prob}`}>{task.aiConfidence || 92}%</span>
                <span className={styles.probLabel}>prob.</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <button className={styles.viewAllBtn} onClick={onViewAll}>
          <span>View All ({tasks.length}) Tasks</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
