'use client';

import { useState, useEffect } from 'react';
import { User, Settings as SettingsIcon, Save, Check } from 'lucide-react';
import { fetchUser, updateUser } from '@/lib/api';
import styles from './page.module.css';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const storedVoice = localStorage.getItem('lifepilot_voice_enabled');
        if (storedVoice !== null) {
          setVoiceEnabled(storedVoice === 'true');
        }
        const res = await fetchUser();
        if (res.user) {
          setName(res.user.name || '');
          setEmail(res.user.email || '');
          if (res.user.voiceEnabled !== undefined) {
            setVoiceEnabled(res.user.voiceEnabled);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      localStorage.setItem('lifepilot_voice_enabled', String(voiceEnabled));
      await updateUser({ name, email, voiceEnabled });
      setStatus('Settings saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error("Failed to update settings:", err);
      setStatus('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'var(--text-muted)' }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Settings & Profile</h1>
        <p>Manage your executive profile and AI preferences for LifePilot AI.</p>
      </div>

      <form onSubmit={handleSave}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <User size={20} className="text-primary-color" />
            <span>Profile Information</span>
          </div>

          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setVoiceEnabled(prev => !prev)}>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>Enable AI Voice Responses (Text-to-Speech)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>LifePilot AI will speak consulting replies aloud using browser speech synthesis.</div>
            </div>
          </div>

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? <Save size={16} /> : <Check size={16} />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          {status && <div className={styles.statusMsg}>{status}</div>}
        </div>
      </form>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <SettingsIcon size={20} className="text-accent" />
          <span>AI Model & Intelligence Configuration</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
          LifePilot AI is configured to run on <strong>Gemini 3.1 Pro (High)</strong> for intelligent executive reasoning, task extraction, schedule replanning, and behavioral memory analysis.
        </p>
      </div>
    </div>
  );
}
