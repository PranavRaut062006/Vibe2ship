'use client';

import { useState, useEffect } from 'react';
import { Zap, Home, Calendar, Mail, Clock, MessageSquare, BarChart2, Settings, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { fetchUser } from '@/lib/api';
import styles from './Sidebar.module.css';

export default function Sidebar({ collapsed, onToggle, activePage, onNavigate, currentMode = 'Balanced', onOpenModesModal }) {
  const [userProfile, setUserProfile] = useState({ name: 'New User', consistencyScore: 0 });

  useEffect(() => {
    async function getProfile() {
      try {
        const res = await fetchUser();
        if (res.user) {
          setUserProfile({
            name: res.user.name || 'New User',
            consistencyScore: res.user.consistencyScore || 0
          });
        }
      } catch (err) {
        console.error("Failed to load user in sidebar:", err);
      }
    }
    getProfile();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'inbox', label: 'Inbox', icon: Mail },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'aichat', label: 'AI Chat', icon: MessageSquare, isAi: true },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
  ];

  const getInitials = (name) => {
    if (!name) return 'NU';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Top Section */}
      <div className={styles.top}>
        <div className={styles.logo} onClick={() => onNavigate('dashboard')}>
          <div className={styles.logoIcon}>
            <Zap size={20} color="#6C63FF" fill="#6C63FF" />
          </div>
          {!collapsed && (
            <span className={styles.logoText}>
              LifePilot<span className={styles.logoAi}>AI</span>
            </span>
          )}
        </div>
        <button className={styles.collapseBtn} onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navGroup}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <div className={styles.navIconWrapper}>
                  <Icon size={20} className={isActive ? styles.activeIcon : styles.icon} />
                </div>
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                {!collapsed && item.badge && <span className={styles.badge}>{item.badge}</span>}
                {!collapsed && item.isAi && <span className="ai-badge">AI</span>}
              </button>
            );
          })}
        </div>

        <div className={styles.divider} />

        <button
          className={`${styles.navItem} ${activePage === 'settings' ? styles.active : ''}`}
          onClick={() => onNavigate('settings')}
          title={collapsed ? 'Settings' : undefined}
        >
          <div className={styles.navIconWrapper}>
            <Settings size={20} className={activePage === 'settings' ? styles.activeIcon : styles.icon} />
          </div>
          {!collapsed && <span className={styles.navLabel}>Settings</span>}
        </button>
      </nav>

      {/* Bottom User Section */}
      <div className={styles.userSection}>
        {!collapsed && (
          <button
            className={styles.modeTrigger}
            onClick={onOpenModesModal}
            title="Switch Adaptive Mode"
          >
            <span>Mode: <strong>{currentMode}</strong></span>
            <span>⚙️</span>
          </button>
        )}

        <div className={styles.userInfo}>
          <div className={styles.avatar}>{getInitials(userProfile.name)}</div>
          {!collapsed && (
            <div className={styles.userDetails}>
              <span className={styles.userName}>{userProfile.name}</span>
              <div className={styles.consistencyPill}>
                <span className="mono">{userProfile.consistencyScore}</span>
                <TrendingUp size={12} className={styles.trendIcon} />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
