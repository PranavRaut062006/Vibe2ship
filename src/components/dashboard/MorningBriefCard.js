'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Mail, Calendar as CalendarIcon, AlertTriangle, X } from 'lucide-react';
import { fetchTasks, fetchUser } from '@/lib/api';
import styles from './MorningBriefCard.module.css';

export default function MorningBriefCard({ onOrganize }) {
  const [dismissed, setDismissed] = useState(false);
  const [userName, setUserName] = useState('New User');
  const [taskCount, setTaskCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetchUser();
        if (userRes.user?.name) {
          setUserName(userRes.user.name.split(' ')[0]);
        }
        const tasksRes = await fetchTasks();
        if (tasksRes.tasks) {
          setTaskCount(tasksRes.tasks.length);
          const urgent = tasksRes.tasks.filter(t => t.priority === 'P1' || t.deadline?.toLowerCase().includes('today') || t.deadline?.toLowerCase().includes('tomorrow'));
          setUrgentCount(urgent.length);
        }
      } catch (err) {
        console.error("Failed to load morning brief data:", err);
      }
    }
    loadData();
    window.addEventListener('taskCreated', loadData);
    return () => window.removeEventListener('taskCreated', loadData);
  }, []);

  if (dismissed) return null;

  return (
    <div className={`${styles.card} fade-in`}>
      <div className={styles.headerRow}>
        <div className={styles.greetingWrapper}>
          <h2 className={styles.greeting}>Good morning, {userName} 👋</h2>
        </div>
        <div className={styles.badgeWrapper}>
          <span className="ai-badge">AI Brief</span>
          <button className={styles.closeBtn} onClick={() => setDismissed(true)} aria-label="Dismiss brief">
            <X size={16} />
          </button>
        </div>
      </div>

      <p className={styles.summary}>
        {taskCount === 0 
          ? "No tasks yet. Add your first task or scan Gmail to generate your daily AI briefing." 
          : "I've reviewed your active executive database. Here's what needs your attention today."}
      </p>

      <div className={styles.chipsRow}>
        <div className={styles.chip}>
          <Mail size={14} className="text-primary-color" />
          <span>{taskCount} active tasks</span>
        </div>
        <div className={styles.chip}>
          <CalendarIcon size={14} className="text-accent" />
          <span>3 scheduled blocks</span>
        </div>
        <div className={styles.chip}>
          <AlertTriangle size={14} className="text-warning" />
          <span>{urgentCount} priority deadline(s)</span>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button className={styles.primaryBtn} onClick={onOrganize}>
          <Sparkles size={16} />
          <span>Organize My Day</span>
        </button>
        <div className={styles.textBtns}>
          <button className={styles.textBtn} onClick={onOrganize}>Review First</button>
          <span className={styles.separator}>|</span>
          <button className={styles.textBtn} onClick={() => setDismissed(true)}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}
