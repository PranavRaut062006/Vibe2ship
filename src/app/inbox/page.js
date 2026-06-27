'use client';

import { useState } from 'react';
import { Mail, Check, RefreshCw, RotateCcw, Trash2, ExternalLink } from 'lucide-react';
import ScanningState from '@/components/inbox/ScanningState';
import AIReviewCard from '@/components/inbox/AIReviewCard';
import BatchActionBar from '@/components/inbox/BatchActionBar';
import styles from './page.module.css';

export default function InboxPage() {
  const [connected, setConnected] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'ignored'
  const [selectedIds, setSelectedIds] = useState([]);

  // Mock initial tasks
  const [pendingTasks, setPendingTasks] = useState([
    {
      id: 'p1',
      priority: 'P1',
      title: 'Finalize API Integration',
      confidence: '94%',
      deadline: 'Tomorrow, 11:59 PM',
      effort: '~2 hours',
      category: 'Development',
      sender: 'professor@college.edu — Assignment Submission Tomorrow',
      snippet: 'Please make sure all REST endpoints are connected and verified before tomorrow night submission.',
      reasoning: 'Detected deadline language and assignment keyword'
    },
    {
      id: 'p2',
      priority: 'P2',
      title: 'Review PR #42 — Auth Module',
      confidence: '89%',
      deadline: 'Friday, 5:00 PM',
      effort: '~45 mins',
      category: 'Code Review',
      sender: 'github-notifications@github.com — PR Review Request',
      snippet: 'Pranav has requested your review on PR #42: Implementing JWT authentication headers.',
      reasoning: 'Direct review request from teammate'
    },
    {
      id: 'p3',
      priority: 'P3',
      title: 'Prepare Sprint Demo Slides',
      confidence: '82%',
      deadline: 'Monday, 10:00 AM',
      effort: '~1 hour',
      category: 'Meeting Prep',
      sender: 'manager@company.com — Upcoming Sprint Demo Prep',
      snippet: 'Can you put together 3 slides summarizing our hackathon deliverables for the demo?',
      reasoning: 'Action item identified in email body'
    }
  ]);

  const [approvedTasks, setApprovedTasks] = useState([
    { id: 'a1', title: 'Design system color tokens', deadline: 'Completed today', source: 'design-team@company.com' },
    { id: 'a2', title: 'Morning standup notes', deadline: 'Due Today', source: 'slack-digest@slack.com' }
  ]);

  const [ignoredTasks, setIgnoredTasks] = useState([
    { id: 'i1', title: 'Optional Newsletter Reading', deadline: 'No deadline', source: 'digest@techcrunch.com' }
  ]);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      // Add a simulated new task found
      const newTask = {
        id: `p_${Date.now()}`,
        priority: 'P1',
        title: 'Fix Security Vulnerability reported in CORS',
        confidence: '98%',
        deadline: 'Today, 6:00 PM',
        effort: '~1 hour',
        category: 'Security',
        sender: 'security-alert@github.com — Automated Vulnerability Scan',
        snippet: 'Critical security warning: CORS misconfiguration detected on API endpoint.',
        reasoning: 'Urgent security keyword detected'
      };
      setPendingTasks(prev => [newTask, ...prev]);
    }, 3500);
  };

  const handleApprove = (id) => {
    const task = pendingTasks.find(t => t.id === id);
    if (task) {
      setPendingTasks(prev => prev.filter(t => t.id !== id));
      setApprovedTasks(prev => [{ id: task.id, title: task.title, deadline: task.deadline, source: task.sender }, ...prev]);
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleIgnore = (id) => {
    const task = pendingTasks.find(t => t.id === id);
    if (task) {
      setPendingTasks(prev => prev.filter(t => t.id !== id));
      setIgnoredTasks(prev => [{ id: task.id, title: task.title, deadline: task.deadline, source: task.sender }, ...prev]);
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleSaveEdit = (id, updatedFields) => {
    setPendingTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
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
          <p>LifeSaver AI securely scans subject lines and deadlines to build your executive priority queue without lifting a finger.</p>
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
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>AI Inbox</h1>
            <button className={styles.toggleConnectBtn} onClick={() => setConnected(false)} title="Disconnect Gmail demo">
              Gmail Connected ✓
            </button>
          </div>
          <p className={styles.statusBar}>
            Last scanned 4 minutes ago · {pendingTasks.length + approvedTasks.length} tasks found · {pendingTasks.length} pending review
          </p>
        </div>

        <div className={styles.topActions}>
          <button className={styles.scanBtn} onClick={handleScan} disabled={scanning}>
            <RefreshCw size={16} className={scanning ? 'spin' : ''} />
            <span>{scanning ? 'Scanning...' : 'Scan Gmail Now'}</span>
          </button>
          <button
            className={styles.approveAllBtn}
            onClick={() => pendingTasks.forEach(t => handleApprove(t.id))}
            disabled={pendingTasks.length === 0 || scanning}
          >
            <Check size={16} />
            <span>Approve All</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsRow}>
        <button
          className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Review ({pendingTasks.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'approved' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved ({approvedTasks.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'ignored' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('ignored')}
        >
          Ignored ({ignoredTasks.length})
        </button>
      </div>

      {/* Main Content Area */}
      {scanning ? (
        <ScanningState />
      ) : activeTab === 'pending' ? (
        <div className={styles.cardsList}>
          {pendingTasks.length === 0 ? (
            <div className={styles.emptyCard}>
              <Mail size={32} className="text-muted" />
              <h4>No tasks waiting for review</h4>
              <p>Scan your Gmail inbox to discover and extract new action items.</p>
              <button className={styles.scanBtn} onClick={handleScan}>Scan Now</button>
            </div>
          ) : (
            pendingTasks.map((task) => (
              <AIReviewCard
                key={task.id}
                task={task}
                selected={selectedIds.includes(task.id)}
                onSelect={handleToggleSelect}
                onApprove={handleApprove}
                onIgnore={handleIgnore}
                onSaveEdit={handleSaveEdit}
              />
            ))
          )}

          {pendingTasks.length >= 2 && (
            <BatchActionBar
              count={pendingTasks.length}
              selectedCount={selectedIds.length}
              allSelected={selectedIds.length === pendingTasks.length && pendingTasks.length > 0}
              onToggleSelectAll={handleSelectAll}
              onApproveSelected={handleApproveSelected}
              onIgnoreSelected={handleIgnoreSelected}
            />
          )}
        </div>
      ) : activeTab === 'approved' ? (
        <div className={styles.simpleList}>
          {approvedTasks.length === 0 ? (
            <div className={styles.emptyCard}>
              <p>No approved tasks yet.</p>
            </div>
          ) : (
            approvedTasks.map((t) => (
              <div key={t.id} className={styles.simpleRow}>
                <div className={styles.simpleLeft}>
                  <Mail size={16} className="text-primary-color" />
                  <span className={styles.simpleTitle}>{t.title}</span>
                  <span className="ai-badge">AI Added</span>
                </div>
                <div className={styles.simpleRight}>
                  <span className={styles.simpleMeta}>📅 {t.deadline}</span>
                  <button
                    className={styles.actionIconBtn}
                    onClick={() => {
                      setApprovedTasks(prev => prev.filter(item => item.id !== t.id));
                      setPendingTasks(prev => [{ id: t.id, title: t.title, priority: 'P2', confidence: '90%', deadline: t.deadline, effort: '~1 hr', category: 'General', sender: t.source, snippet: 'Re-reviewed task.', reasoning: 'Restored for review' }, ...prev]);
                    }}
                    title="Re-review"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className={styles.simpleList}>
          {ignoredTasks.length === 0 ? (
            <div className={styles.emptyCard}>
              <p>No ignored tasks.</p>
            </div>
          ) : (
            ignoredTasks.map((t) => (
              <div key={t.id} className={styles.simpleRow}>
                <div className={styles.simpleLeft}>
                  <span className={`${styles.simpleTitle} text-muted`}>{t.title}</span>
                </div>
                <div className={styles.simpleRight}>
                  <button
                    className={styles.restoreBtn}
                    onClick={() => {
                      setIgnoredTasks(prev => prev.filter(item => item.id !== t.id));
                      setPendingTasks(prev => [{ id: t.id, title: t.title, priority: 'P3', confidence: '85%', deadline: 'Next week', effort: '~30 mins', category: 'General', sender: t.source, snippet: 'Restored from ignored list.', reasoning: 'Manual user restore' }, ...prev]);
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Restore</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
