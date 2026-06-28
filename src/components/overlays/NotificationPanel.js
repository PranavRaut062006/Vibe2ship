'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, AlertTriangle, RefreshCw, Coffee, Trophy, TrendingUp, CheckCircle, Bell } from 'lucide-react';
import { fetchNotifications, resolveNotification } from '@/lib/api';
import styles from './NotificationPanel.module.css';

export default function NotificationPanel({ isOpen, onClose }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    async function loadAlerts() {
      setLoading(true);
      try {
        const res = await fetchNotifications();
        if (res && res.notifications) {
          setNotifications(res.notifications);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter(n => n.priority === 'high' || n.type?.toLowerCase().includes(activeTab.toLowerCase()));

  const handleDismiss = async (id) => {
    try {
      await resolveNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
    }
  };

  const handleAction = (url, id) => {
    if (id) handleDismiss(id);
    onClose();
    if (url) router.push(url);
  };

  const getIcon = (type) => {
    if (type?.includes('Approval')) return Sparkles;
    if (type?.includes('Burnout')) return Coffee;
    if (type?.includes('Deadline') || type?.includes('Overdue')) return AlertTriangle;
    return Bell;
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.drawer} slide-in`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>Notification Center</h3>
            {notifications.length > 0 && <span className={styles.unreadBadge}>{notifications.length} Live</span>}
          </div>
          <div className={styles.headerRight}>
            <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        <div className={styles.tabs}>
          {['All', 'Pending Approval', 'Burnout Warning', 'Deadline Alert'].map(t => (
            <button
              key={t}
              className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.emptyState}>
              <RefreshCw size={24} className="spin text-primary-color" />
              <p style={{ marginTop: '12px' }}>Checking AI engine and live schedules...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle size={36} className="text-accent" />
              <h4>You&apos;re all caught up</h4>
              <p>No active alerts, schedule conflicts, or burnout warnings detected.</p>
            </div>
          ) : (
            filtered.map((n) => {
              const IconComp = getIcon(n.type);
              const isUrgent = n.priority === 'high';
              return (
                <div
                  key={n.id}
                  className={`${styles.card} ${isUrgent ? styles.cardUnread : ''}`}
                  style={{ borderLeft: `4px solid ${isUrgent ? '#ef4444' : '#6c63ff'}` }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIconTitle}>
                      <IconComp size={16} style={{ color: isUrgent ? '#ef4444' : '#c084fc' }} />
                      <span className={styles.cardTitle}>{n.title}</span>
                    </div>
                    <span className={styles.time}>{n.type}</span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: '8px 0 12px', lineHeight: 1.5 }}>{n.message}</p>

                  <div className={styles.cardActions}>
                    {n.actionUrl && (
                      <button
                        className={styles.giantJoinBtn}
                        style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                        onClick={() => handleAction(n.actionUrl, n.id)}
                      >
                        Take Action
                      </button>
                    )}
                    <button
                      className={styles.ghostBtn}
                      style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                      onClick={() => handleDismiss(n.id)}
                    >
                      Dismiss
                    </button>
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
