'use client';

import { Search, Bell, Plus, Menu } from 'lucide-react';
import styles from './TopBar.module.css';

export default function TopBar({ onOpenCommandPalette, onOpenNotifications, onOpenQuickAdd, onMobileMenu }) {
  return (
    <header className={styles.topbar}>
      <button className={styles.mobileMenuBtn} onClick={onMobileMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className={styles.searchWrapper}>
        <div className={styles.searchBar} onClick={onOpenCommandPalette}>
          <Search size={16} className={styles.searchIcon} />
          <span className={styles.placeholder}>Search tasks, ask AI anything...</span>
          <kbd className={styles.kbd}>⌘K</kbd>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={onOpenNotifications} aria-label="Notifications">
          <Bell size={18} />
          <span className={styles.badge}>2</span>
        </button>

        <button className={styles.quickAddBtn} onClick={onOpenQuickAdd} aria-label="Quick Add">
          <Plus size={18} />
        </button>

        <div className={styles.avatar}>PR</div>
      </div>
    </header>
  );
}
