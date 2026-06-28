'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Check, RefreshCw, RotateCcw, Trash2, ExternalLink, Sparkles } from 'lucide-react';
import ScanningState from '@/components/inbox/ScanningState';
import AIReviewCard from '@/components/inbox/AIReviewCard';
import BatchActionBar from '@/components/inbox/BatchActionBar';
import { fetchTasks, scanInboxEmail, approveInboxTask, updateTask } from '@/lib/api';
import styles from './page.module.css';

export default function InboxPage() {
  const [connected, setConnected] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'ignored'
  const [selectedIds, setSelectedIds] = useState([]);
  const [customText, setCustomText] = useState('');
  const [showScannerInput, setShowScannerInput] = useState(true);
  const [fetchMessage, setFetchMessage] = useState(null);

  const [pendingTasks, setPendingTasks] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [ignoredTasks, setIgnoredTasks] = useState([]);

  const loadAllTasks = useCallback(async () => {
    try {
      const res = await fetchTasks();
      const all = res.tasks || [];
      
      const formatTask = (t) => ({
        id: t._id || t.id,
        _id: t._id || t.id,
        priority: t.priority || 'P2',
        title: t.title,
        confidence: `${t.aiConfidence || 92}%`,
        deadline: t.deadline || 'Today',
        effort: `~${t.estimatedMinutes || 45} mins`,
        category: t.category || 'Focus',
        sender: t.sourceEmail || 'gmail-auto-extractor@focusflow.ai',
        snippet: `Extracted from AI scan with ${t.aiConfidence || 92}% confidence.`,
        reasoning: 'Action item identified by Gemini AI engine'
      });

      setPendingTasks(all.filter(t => t.status === 'pending').map(formatTask));
      setApprovedTasks(all.filter(t => t.status === 'approved').map(t => ({ id: t._id || t.id, title: t.title, deadline: t.deadline, source: t.sourceEmail || 'Gmail' })));
      setIgnoredTasks(all.filter(t => t.status === 'ignored').map(t => ({ id: t._id || t.id, title: t.title, deadline: t.deadline, source: t.sourceEmail || 'Gmail' })));
    } catch (err) {
      console.error("Failed to load inbox tasks:", err);
    }
  }, []);

  useEffect(() => {
    loadAllTasks();
    const handleCreated = () => loadAllTasks();
    window.addEventListener('taskCreated', handleCreated);
    return () => window.removeEventListener('taskCreated', handleCreated);
  }, [loadAllTasks]);

  const handleScan = async (textToScan) => {
    setFetchMessage(null);
    if (!textToScan || !textToScan.trim()) {
      setFetchMessage("Can't fetch data from actual email. Please paste real email content below to scan.");
      return;
    }
    setScanning(true);
    try {
      const res = await scanInboxEmail(textToScan);
      if (res && res.message) {
        setFetchMessage(res.message);
      } else if (!res || !res.extractedTasks || res.extractedTasks.length === 0) {
        setFetchMessage("Can't fetch data from actual email.");
      }
      await loadAllTasks();
      window.dispatchEvent(new CustomEvent('taskCreated'));
      if (res && res.extractedTasks && res.extractedTasks.length > 0) {
        setCustomText('');
      }
    } catch (err) {
      console.error("Error scanning email:", err);
      setFetchMessage("Can't fetch data from actual email.");
    } finally {
      setScanning(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveInboxTask(id);
      await loadAllTasks();
      window.dispatchEvent(new CustomEvent('taskCreated'));
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (err) {
      console.error("Failed to approve task:", err);
    }
  };

  const handleIgnore = async (id) => {
    try {
      await updateTask(id, { status: 'ignored' });
      await loadAllTasks();
      window.dispatchEvent(new CustomEvent('taskCreated'));
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (err) {
      console.error("Failed to ignore task:", err);
    }
  };

  const handleSaveEdit = async (id, updatedFields) => {
    try {
      const parsedMinutes = parseInt(updatedFields.effort?.replace(/\D/g, '')) || 45;
      await updateTask(id, {
        title: updatedFields.title,
        deadline: updatedFields.deadline,
        estimatedMinutes: parsedMinutes,
        priority: updatedFields.priority
      });
      await loadAllTasks();
      window.dispatchEvent(new CustomEvent('taskCreated'));
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === pendingTasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingTasks.map(t => t.id));
    }
  };

  const handleApproveSelected = () => {
    selectedIds.forEach(id => handleApprove(id));
    setSelectedIds([]);
  };

  const handleIgnoreSelected = () => {
    selectedIds.forEach(id => handleIgnore(id));
    setSelectedIds([]);
  };

  if (!connected) {
    return (
      <div className={styles.container}>
        <div className={styles.disconnectCard}>
          <div className={styles.googleIcon}>
            <Mail size={36} className="text-primary-color" />
          </div>
          <h2>Connect Gmail to let AI extract your tasks automatically</h2>
          <p>FocusFlow AI securely scans subject lines and deadlines to build your executive priority queue without lifting a finger.</p>
          <button className={styles.connectBtn} onClick={() => setConnected(true)}>
            <span>Connect Gmail Account</span>
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>AI Task Extraction Engine</h1>
          <span className={styles.subtitle}>Gemini 2.5 Flash Autonomous Scanner</span>
        </div>

        <div className={styles.headerActions} style={{ display: 'flex', gap: '12px' }}>
          <button className={styles.scanBtn} onClick={() => setShowScannerInput(!showScannerInput)} style={{ background: '#1A1A24', border: '1px solid #1E1E2E' }}>
            <Mail size={16} />
            <span>{showScannerInput ? 'Hide Scanner Box' : 'Paste Email / Syllabus'}</span>
          </button>

          <button className={styles.scanBtn} onClick={() => handleScan(customText)} disabled={scanning}>
            <RefreshCw size={16} className={scanning ? 'spin' : ''} />
            <span>{scanning ? 'Scanning AI...' : 'Scan Live Inbox'}</span>
          </button>
        </div>
      </div>

      {/* Custom Text Scanner Input Box */}
      {showScannerInput && (
        <div className="glass scale-in" style={{ padding: '20px', borderRadius: '16px', border: '1px solid #1E1E2E', marginBottom: '24px', background: '#111118' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#6C63FF" />
            <span>Paste Any Email, Syllabus, or Project Specification</span>
          </h4>
          <textarea
            style={{ width: '100%', height: '100px', background: '#0A0A0F', border: '1px solid #1E1E2E', borderRadius: '12px', padding: '12px', color: '#F0F0F5', fontFamily: 'inherit', resize: 'vertical', marginBottom: '12px' }}
            placeholder="Paste text here... e.g. 'Submit draft by Thursday 3pm. Review chapter 4 before Monday.'"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => setShowScannerInput(false)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid #1E1E2E', color: '#8B8BA0', cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => { if (customText.trim()) handleScan(customText); }} disabled={!customText.trim()} style={{ padding: '8px 16px', borderRadius: '8px', background: '#6C63FF', border: 'none', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Extract Tasks</button>
          </div>
        </div>
      )}

      {/* Connection Status Banner */}
      {fetchMessage && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', color: '#F59E0B', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>⚠️ {fetchMessage}</span>
        </div>
      )}

      <div className={styles.statusBanner}>
        <div className={styles.statusLeft}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>Connected to Pranav&apos;s Gmail · Gemini AI Active</span>
        </div>
        <span className={styles.lastSync}>Auto-sync enabled</span>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span>Pending AI Review</span>
          <span className={styles.badge}>{pendingTasks.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'approved' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <span>Approved Queue</span>
          <span className={styles.badge}>{approvedTasks.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'ignored' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('ignored')}
        >
          <span>Ignored</span>
          <span className={styles.badge}>{ignoredTasks.length}</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <div className={styles.content}>
        {scanning ? (
          <ScanningState />
        ) : activeTab === 'pending' ? (
          pendingTasks.length === 0 ? (
            <div className={styles.emptyQueue}>
              <Check size={48} className="text-accent" />
              <h3>{fetchMessage || "All caught up!"}</h3>
              <p>No pending tasks extracted. Paste actual email text above and click Extract Tasks to scan.</p>
            </div>
          ) : (
            <div className={styles.queueList}>
              {pendingTasks.map(task => (
                <AIReviewCard
                  key={task.id}
                  task={task}
                  selected={selectedIds.includes(task.id)}
                  onSelect={() => handleToggleSelect(task.id)}
                  onApprove={() => handleApprove(task.id)}
                  onIgnore={() => handleIgnore(task.id)}
                  onSaveEdit={handleSaveEdit}
                />
              ))}
            </div>
          )
        ) : activeTab === 'approved' ? (
          <div className={styles.simpleList}>
            {approvedTasks.length === 0 ? (
              <p className={styles.emptyText}>No approved tasks yet.</p>
            ) : (
              approvedTasks.map(task => (
                <div key={task.id} className={styles.simpleRow}>
                  <div>
                    <h4>{task.title}</h4>
                    <span>{task.source}</span>
                  </div>
                  <span className={styles.simpleDeadline}>{task.deadline}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className={styles.simpleList}>
            {ignoredTasks.length === 0 ? (
              <p className={styles.emptyText}>No ignored tasks.</p>
            ) : (
              ignoredTasks.map(task => (
                <div key={task.id} className={styles.simpleRow}>
                  <div>
                    <h4 className={styles.ignoredTitle}>{task.title}</h4>
                    <span>{task.source}</span>
                  </div>
                  <span className={styles.simpleDeadline}>{task.deadline}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedIds.length}
        totalCount={pendingTasks.length}
        onSelectAll={handleSelectAll}
        onApproveAll={handleApproveSelected}
        onIgnoreAll={handleIgnoreSelected}
      />
    </div>
  );
}
