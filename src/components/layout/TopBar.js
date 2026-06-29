'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Plus, Menu, User, LogOut, ExternalLink, Shield } from 'lucide-react';
import AuthModal from '../auth/AuthModal';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import styles from './TopBar.module.css';

export default function TopBar({ onOpenCommandPalette, onOpenNotifications, onOpenQuickAdd, onMobileMenu }) {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const loadSession = () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('lifepilot_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser({ name: 'User', email: 'user@lifepilot.ai' });
      }
    } else {
      // Default clean state or unauth
      setUser(null);
    }
  };

  useEffect(() => {
    loadSession();
    window.addEventListener('userAuthChanged', loadSession);
    return () => window.removeEventListener('userAuthChanged', loadSession);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    localStorage.removeItem('lifepilot_uid');
    localStorage.removeItem('lifepilot_user');
    setUser(null);
    setDropdownOpen(false);
    window.dispatchEvent(new CustomEvent('userAuthChanged'));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

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
          <span className={styles.badge}>Live</span>
        </button>

        <button className={styles.quickAddBtn} onClick={onOpenQuickAdd} aria-label="Quick Add">
          <Plus size={18} />
        </button>

        {/* Top Right User Profile Avatar (ONLY profile avatar in app) */}
        <div style={{ position: 'relative' }}>
          <div
            className={styles.avatar}
            onClick={() => setDropdownOpen(prev => !prev)}
            style={{ cursor: 'pointer', background: user ? 'var(--primary-color)' : '#334155', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }}
          >
            {user ? (user.photoURL ? <img src={user.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : getInitials(user.name)) : <User size={18} />}
          </div>

          {dropdownOpen && (
            <>
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setDropdownOpen(false)} />
              <div style={{ position: 'absolute', right: 0, top: '48px', width: '240px', background: '#1e1e2d', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 999 }}>
                {user ? (
                  <>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                    </div>

                    <button
                      onClick={() => { setDropdownOpen(false); alert(`View Profile:\nName: ${user.name}\nEmail: ${user.email}\nSession: Active`); }}
                      style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: '#fff', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                    >
                      <User size={15} className="text-muted" /> View Profile
                    </button>

                    <button
                      onClick={() => { setDropdownOpen(false); window.open('https://myaccount.google.com', '_blank'); }}
                      style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: '#fff', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                    >
                      <ExternalLink size={15} className="text-muted" /> Google Account
                    </button>

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '13px' }}>Not signed in</div>
                    <button
                      onClick={() => { setDropdownOpen(false); setAuthModalOpen(true); }}
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--primary-color)', border: 'none', color: '#fff', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', marginTop: '4px' }}
                    >
                      Sign In / Connect
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
}
