'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import CommandPalette from '../overlays/CommandPalette';
import QuickAddModal from '../overlays/QuickAddModal';
import NotificationPanel from '../overlays/NotificationPanel';
import AdaptiveModesModal from '../common/AdaptiveModesModal';
import { fetchUser } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './AppShell.module.css';

export default function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modesModalOpen, setModesModalOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState('Balanced');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const storedUid = localStorage.getItem('lifepilot_uid');
      if (!storedUid && pathname !== '/login') {
        router.push('/login');
      }
      setAuthChecked(true);
    };

    checkAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('lifepilot_uid', user.uid);
      } else {
        const storedUid = localStorage.getItem('lifepilot_uid');
        if (!storedUid && pathname !== '/login') {
          router.push('/login');
        }
      }
      setAuthChecked(true);
    });

    window.addEventListener('userAuthChanged', checkAuth);
    return () => {
      unsubscribe();
      window.removeEventListener('userAuthChanged', checkAuth);
    };
  }, [pathname, router]);

  useEffect(() => {
    if (pathname !== '/login') {
      fetchUser().then(res => {
        if (res && res.user && res.user.productivityMode) {
          setCurrentMode(res.user.productivityMode);
        }
      }).catch(err => console.error(err));
    }
  }, [pathname]);

  if (pathname === '/login') {
    return <main className={styles.mainContent} style={{ padding: 0 }}>{children}</main>;
  }

  const activePage = pathname === '/' ? 'dashboard' : pathname.replace('/', '');

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const navigateTo = useCallback((page) => {
    setMobileMenuOpen(false);
    if (page === 'dashboard') {
      router.push('/');
    } else {
      router.push(`/${page}`);
    }
  }, [router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setQuickAddOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.shell}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        activePage={activePage}
        onNavigate={navigateTo}
        currentMode={currentMode}
        onOpenModesModal={() => setModesModalOpen(true)}
      />

      <div className={`${styles.mainWrapper} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <TopBar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotifOpen(prev => !prev)}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
          onMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        <main className={styles.mainContent}>
          {children}
        </main>
      </div>

      <MobileNav activePage={activePage} onNavigate={navigateTo} />

      {/* Overlays */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={navigateTo}
      />
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onAdd={() => window.dispatchEvent(new CustomEvent('taskCreated'))}
      />
      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
      <AdaptiveModesModal
        isOpen={modesModalOpen}
        onClose={() => setModesModalOpen(false)}
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
      />
    </div>
  );
}
