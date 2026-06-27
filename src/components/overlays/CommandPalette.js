'use client';

import { useEffect, useRef } from 'react';
import { Search, Home, Calendar, Plus, Sparkles, Zap, ShieldAlert, Mail, Clock, BarChart2, Settings } from 'lucide-react';
import styles from './CommandPalette.module.css';

export default function CommandPalette({ isOpen, onClose, onNavigate }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = (action) => {
    onClose();
    if (typeof action === 'function') action();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.container} scale-in glass`}>
        <div className={styles.inputWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Type a command or search..."
          />
          <kbd className={styles.kbd}>ESC</kbd>
        </div>

        <div className={styles.body}>
          {/* Recent */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Recent</div>
            <button className={styles.item} onClick={() => handleAction(() => onNavigate('dashboard'))}>
              <Home size={16} />
              <span>Go to Dashboard</span>
              <span className={styles.shortcut}>⌘ D</span>
            </button>
            <button className={styles.item} onClick={() => handleAction(() => onNavigate('today'))}>
              <Calendar size={16} />
              <span>View Today&apos;s Plan</span>
              <span className={styles.shortcut}>⌘ T</span>
            </button>
            <button className={styles.item}>
              <Plus size={16} />
              <span>Quick Add Task</span>
              <span className={styles.shortcut}>⌘ N</span>
            </button>
          </div>

          {/* AI Actions */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>AI Actions</div>
            <button className={styles.item}>
              <Sparkles size={16} className="text-primary-color" />
              <span className="ai-badge">AI</span>
              <span>Replan my day</span>
            </button>
            <button className={styles.item}>
              <Zap size={16} className="text-accent" />
              <span className="ai-badge">AI</span>
              <span>Summarize my progress</span>
            </button>
            <button className={styles.item}>
              <ShieldAlert size={16} className="text-warning" />
              <span className="ai-badge">AI</span>
              <span>Predict deadline risks</span>
            </button>
          </div>

          {/* Navigation */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Navigation</div>
            <button className={styles.item} onClick={() => handleAction(() => onNavigate('inbox'))}>
              <Mail size={16} />
              <span>Inbox</span>
            </button>
            <button className={styles.item} onClick={() => handleAction(() => onNavigate('schedule'))}>
              <Clock size={16} />
              <span>Schedule</span>
            </button>
            <button className={styles.item} onClick={() => handleAction(() => onNavigate('progress'))}>
              <BarChart2 size={16} />
              <span>Progress</span>
            </button>
            <button className={styles.item} onClick={() => handleAction(() => onNavigate('settings'))}>
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
