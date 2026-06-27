'use client';

import { Plus, Mail, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import styles from './QuickActionsGrid.module.css';

export default function QuickActionsGrid({ onNavigate, onQuickAdd }) {
  const actions = [
    { label: 'Add Task', icon: Plus, onClick: onQuickAdd },
    { label: 'Scan Gmail', icon: Mail, colorClass: 'iconPurple', onClick: () => onNavigate('inbox') },
    { label: 'Chat with AI', icon: Sparkles, colorClass: 'iconPurple', onClick: () => onNavigate('aichat') },
    { label: 'View Calendar', icon: CalendarIcon, onClick: () => onNavigate('schedule') }
  ];

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Quick Actions</h3>

      <div className={styles.grid}>
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <button key={i} className={styles.actionBtn} onClick={act.onClick}>
              <div className={`${styles.iconWrapper} ${act.colorClass ? styles[act.colorClass] : ''}`}>
                <Icon size={18} />
              </div>
              <span className={styles.label}>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
