'use client';

import { Home, Calendar, CheckSquare, Target, MessageSquare, User } from 'lucide-react';
import styles from './MobileNav.module.css';

export default function MobileNav({ activePage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'planner', label: 'Planner', icon: CheckSquare },
    { id: 'schedule', label: 'Calendar', icon: Calendar },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'aichat', label: 'Chat', icon: MessageSquare, isAi: true },
  ];

  return (
    <nav className={styles.mobileNav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            className={`${styles.item} ${isActive ? styles.active : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <div className={styles.iconWrapper}>
              <Icon size={20} className={isActive ? styles.activeIcon : styles.icon} />
              {item.isAi && <span className={styles.aiDot} />}
            </div>
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
