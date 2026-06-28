'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, Video, AlertTriangle, RefreshCw, Coffee, Trophy, TrendingUp, CheckCircle } from 'lucide-react';
import styles from './NotificationPanel.module.css';

export default function NotificationPanel({ isOpen, onClose }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Urgent' | 'AI Updates' | 'Reminders'
  const [notifications, setNotifications] = useState([]);

  if (!isOpen) return null;

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter(n => n.category === activeTab || (activeTab === 'Urgent' && n.unread));

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleDismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAction = (route) => {
    onClose();
    if (route) router.push(route);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.drawer} slide-in`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>Notifications</h3>
            {notifications.some(n => n.unread) && <span className={styles.unreadBadge}>New</span>}
          </div>
          <div className={styles.headerRight}>
            <button className={styles.markReadBtn} onClick={handleMarkAllRead}>Mark All Read</button>
            <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {['All', 'Urgent', 'AI Updates', 'Reminders'].map(t => (
            <button
              key={t}
              className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className={styles.list}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle size={36} className="text-accent" />
              <h4>You&apos;re all caught up</h4>
              <p>No new notifications in this filter view.</p>
            </div>
          ) : (
            filtered.map((n) => {
              const IconComp = n.icon;
              return (
                <div
                  key={n.id}
                  className={`${styles.card} ${styles[n.borderClass]} ${n.unread ? styles.cardUnread : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIconTitle}>
                      <IconComp size={16} className={styles.iconColor} />
                      <span className={styles.cardTitle}>{n.title}</span>
                    </div>
                    <span className={styles.time}>{n.time}</span>
                  </div>

                  {n.source && <span className={styles.source}>Source: {n.source}</span>}

                  {/* Specific Action Buttons for each type */}
                  <div className={styles.cardActions}>
                    {n.type === 'meeting' && (
                      <>
                        <button
                          className={styles.giantJoinBtn}
                          onClick={() => alert('Joining Google Meet video call...')}
                        >
                          <Video size={16} />
                          <span>Join Meeting</span>
                        </button>
                        <button className={styles.ghostBtn} onClick={() => handleDismiss(n.id)}>Snooze 5min</button>
                        <button className={styles.ghostBtn} onClick={() => handleDismiss(n.id)}>Dismiss</button>
                      </>
                    )}

                    {n.type === 'morning_brief' && (
                      <button className={styles.primaryBtnSmall} onClick={() => handleAction('/')}>Open Brief</button>
                    )}

                    {n.type === 'deadline_risk' && (
                      <>
                        <button className={styles.primaryBtnSmall} onClick={() => handleAction('/schedule')}>View Task</button>
                        <button className={styles.ghostBtn} onClick={() => handleAction('/schedule')}>Reschedule</button>
                      </>
                    )}

                    {n.type === 'schedule_updated' && (
                      <>
                        <button className={styles.primaryBtnSmall} onClick={() => handleAction('/schedule')}>See Changes</button>
                        <button className={styles.ghostBtn} onClick={() => handleDismiss(n.id)}>Revert</button>
                      </>
                    )}

                    {n.type === 'break_reminder' && (
                      <>
                        <button className={styles.primaryBtnSmall} onClick={() => alert('Break timer started!')}>Take Break</button>
                        <button className={styles.ghostBtn} onClick={() => handleDismiss(n.id)}>Keep Working</button>
                      </>
                    )}

                    {n.type === 'achievement' && (
                      <button className={styles.primaryBtnSmall} onClick={() => handleAction('/progress')}>View Achievement</button>
                    )}

                    {n.type === 'recovery' && (
                      <>
                        <button className={styles.primaryBtnSmall} onClick={() => handleAction('/aichat')}>Review Plan</button>
                        <button className={styles.ghostBtn} onClick={() => handleDismiss(n.id)}>Dismiss</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
