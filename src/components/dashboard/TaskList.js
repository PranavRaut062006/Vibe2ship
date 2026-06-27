'use client';

import { useState } from 'react';
import { ArrowRight, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import styles from './TaskList.module.css';

export default function TaskList({ state = 'default', onConnectGmail, onViewAll }) {
  const [status, setStatus] = useState(state); // 'default' | 'loading' | 'empty' | 'error'
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Finalize API Integration', p: 'P1', pClass: 'p1', deadline: 'Due 3:00 PM', estimate: '1.5 hrs', prob: '94%' },
    { id: 2, name: 'Review PR #42 — Auth Module', p: 'P2', pClass: 'p2', deadline: 'Due 5:00 PM', estimate: '45 mins', prob: '88%' },
    { id: 3, name: 'Prepare Sprint Demo Slides', p: 'P3', pClass: 'p3', deadline: 'Due Tomorrow', estimate: '2 hrs', prob: '98%' }
  ]);

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
          <h4>Connect Gmail to get started</h4>
          <p>Let AI analyze your inbox and rank your most critical tasks.</p>
          <button className={styles.connectBtn} onClick={onConnectGmail}>
            <span>Connect Gmail</span>
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
          <p>Failed to sync top priorities from AI service.</p>
          <button className={styles.retryBtn} onClick={() => setStatus('default')}>
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
        {tasks.map((task) => (
          <div key={task.id} className={styles.item}>
            <div className={`${styles.pCircle} ${styles[task.pClass]}`} title={`Priority ${task.p}`} />

            <div className={styles.content}>
              <span className={styles.name}>{task.name}</span>
              <div className={styles.chips}>
                <span className={styles.chip}>{task.deadline}</span>
                <span className={styles.chip}>{task.estimate}</span>
              </div>
            </div>

            <div className={styles.probWrapper}>
              <span className={`mono text-accent ${styles.prob}`}>{task.prob}</span>
              <span className={styles.probLabel}>prob.</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.viewAllBtn} onClick={onViewAll}>
          <span>View All 8 Tasks</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
