'use client';

import { Zap, Home, Calendar, CheckSquare, Target, MessageSquare, BarChart2, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar({ collapsed, onToggle, activePage, onNavigate, currentMode = 'Balanced', onOpenModesModal }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'planner', label: 'Planner', icon: CheckSquare },
    { id: 'schedule', label: 'Calendar', icon: Calendar },
    { id: 'goals', label: 'Goals & Habits', icon: Target },
    { id: 'aichat', label: 'AI Chat', icon: MessageSquare, isAi: true },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
  ];

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

      {/* Bottom Section */}
      <div className={styles.userSection}>
        <button
          className={styles.modeTrigger}
          onClick={onOpenModesModal}
          title="Switch Adaptive Mode"
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(108, 99, 255, 0.15)', border: '1px solid rgba(108, 99, 255, 0.3)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
        >
          {!collapsed ? (
            <>
              <span style={{ fontSize: '13px' }}>Mode: <strong style={{ color: '#c084fc' }}>{currentMode}</strong></span>
              <span>⚙️</span>
            </>
          ) : (
            <span style={{ fontSize: '16px', margin: '0 auto' }}>⚙️</span>
          )}
        </button>
      </div>
    </aside>
  );
}
