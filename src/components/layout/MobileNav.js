'use client';

import { Home, Calendar, Mail, MessageSquare, User } from 'lucide-react';
import styles from './MobileNav.module.css';

export default function MobileNav({ activePage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'inbox', label: 'Inbox', icon: Mail },
    { id: 'aichat', label: 'Chat', icon: MessageSquare, isAi: true },
    { id: 'settings', label: 'Profile', icon: User },
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
