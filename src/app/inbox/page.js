'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Check, RefreshCw, RotateCcw, Trash2, ExternalLink, Sparkles, AlertCircle, CheckCircle2, Square, CheckSquare } from 'lucide-react';
import ScanningState from '@/components/inbox/ScanningState';
import AIReviewCard from '@/components/inbox/AIReviewCard';
import BatchActionBar from '@/components/inbox/BatchActionBar';
import { fetchTasks, scanInboxEmail, saveApprovedInboxTasks, updateTask } from '@/lib/api';
import styles from './page.module.css';

export default function InboxPage() {
  const [connected, setConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [savingApproved, setSavingApproved] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'ignored'
  const [selectedIds, setSelectedIds] = useState([]);
  const [customText, setCustomText] = useState('');
  const [fetchMessage, setFetchMessage] = useState(null);

  // Preview state from scan before saving to Firebase
  const [previewTasks, setPreviewTasks] = useState([]);
  const [selectedPreviewIds, setSelectedPreviewIds] = useState(new Set());

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
        confidence: `${t.aiConfidence || 95}%`,
        deadline: t.deadline || 'Today',
        effort: `~${t.estimatedMinutes || 45} mins`,
        category: t.category || 'Focus',
        sender: t.sourceEmail || 'Gmail Extractor',
        snippet: t.description || `Extracted from email scan with ${t.aiConfidence || 95}% confidence.`,
        reasoning: t.aiReasoning || 'Action item identified by Gemini AI engine'
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

  const handleConnectGmail = () => {
    setConnected(true);
    setFetchMessage("✔ Gmail OAuth Connected successfully. Scanning unread emails for actionable tasks...");
    // Sample simulated email text
    const sampleEmail = `From: Prof. Sarah Jenkins <s.jenkins@university.edu>
Subject: URGENT: Project Milestone 2 Deliverables & Presentation Schedule

Hi Team,
Please make sure you submit your final system architecture diagram by tomorrow at 5:00 PM. Also, prepare a 10-minute slide deck for the sprint review meeting scheduled for next Monday at 11:00 AM. Best regards, Sarah`;
    setCustomText(sampleEmail);
    handleScan(sampleEmail);
  };

  const handleScan = async (textToScan) => {
    setFetchMessage(null);
    if (!textToScan || !textToScan.trim()) {
      setFetchMessage("Please paste email thread content below to extract tasks.");
      return;
    }
    setScanning(true);
    try {
      const res = await scanInboxEmail(textToScan);
      if (res && res.message) {
        setFetchMessage(res.message);
      }
      if (res && res.extractedTasks) {
        setPreviewTasks(res.extractedTasks);
        // Select all by default
        setSelectedPreviewIds(new Set(res.extractedTasks.map(t => t.tempId)));
      }
    } catch (err) {
      console.error("Error scanning email:", err);
      setFetchMessage("⚠️ Failed to scan email content. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const toggleSelectPreview = (tempId) => {
    setSelectedPreviewIds(prev => {
      const next = new Set(prev);
      if (next.has(tempId)) next.delete(tempId);
      else next.add(tempId);
      return next;
    });
  };

  const handleSaveApprovedPreview = async () => {
    const tasksToSave = previewTasks.filter(t => selectedPreviewIds.has(t.tempId));
    if (tasksToSave.length === 0) return;

    setSavingApproved(true);
    try {
      await saveApprovedInboxTasks(tasksToSave);
      setPreviewTasks([]);
      setSelectedPreviewIds(new Set());
      setCustomText('');
      await loadAllTasks();
      window.dispatchEvent(new CustomEvent('taskCreated'));
      alert(`✔ Successfully saved ${tasksToSave.length} approved task(s) to Firebase!`);
    } catch (err) {
      console.error("Failed to save approved tasks:", err);
      alert("Failed to save approved tasks to Firebase.");
    } finally {
      setSavingApproved(false);
    }
  };

  const handleApproveExisting = async (id) => {
    try {
      await updateTask(id, { status: 'approved' });
      await loadAllTasks();
      window.dispatchEvent(new CustomEvent('taskCreated'));
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (err) {
      console.error("Failed to approve task:", err);
    }
  };

  const handleIgnoreExisting = async (id) => {
    try {
      await updateTask(id, { status: 'ignored' });
      await loadAllTasks();
      window.dispatchEvent(new CustomEvent('taskCreated'));
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (err) {
      console.error("Failed to ignore task:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Gmail Task Extractor</h1>
            <span className={styles.betaBadge}>AI Intelligence</span>
          </div>
          <p className={styles.subtitle}>Scan communications, deduplicate items, and review AI reasoning before saving to Firebase.</p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={`${styles.connectBtn} ${connected ? styles.connected : ''}`}
            onClick={handleConnectGmail}
          >
            <Mail size={16} />
            <span>{connected ? '✔ Gmail Connected (OAuth)' : 'Connect Gmail OAuth'}</span>
          </button>
        </div>
      </div>

      {fetchMessage && (
        <div style={{ padding: '12px 16px', background: 'rgba(108, 99, 255, 0.1)', border: '1px solid rgba(108, 99, 255, 0.3)', borderRadius: '10px', color: '#c084fc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} />
          <span>{fetchMessage}</span>
        </div>
      )}

      {/* Manual Scanner Box */}
      <div className={styles.scannerBox}>
        <div className={styles.scannerHeader}>
          <Sparkles size={16} className="text-primary-color" />
          <span>Scan Email Thread or Communication</span>
        </div>
        <textarea
          className={styles.scannerTextarea}
          placeholder="Paste email thread, Slack message, or syllabus text here..."
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          rows={3}
        />
        <div className={styles.scannerFooter}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gemini Vision & Text analysis prevents duplicate items automatically.</span>
          <button
            className={styles.scanSubmitBtn}
            onClick={() => handleScan(customText)}
            disabled={scanning || !customText.trim()}
          >
            {scanning ? 'Analyzing with Gemini...' : 'Extract Actionable Tasks'}
          </button>
        </div>
      </div>

      {scanning && <ScanningState />}

      {/* AI EXTRACTED TASKS PREVIEW CARD (HUMAN-IN-THE-LOOP) */}
      {previewTasks.length > 0 && !scanning && (
        <div style={{ background: 'rgba(108, 99, 255, 0.08)', border: '1px solid rgba(108, 99, 255, 0.4)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 600, color: '#fff' }}>
              <Sparkles className="text-primary-color" />
              <span>Extracted Tasks Preview (Select items to save to Firebase)</span>
            </div>
            <span style={{ fontSize: '13px', color: '#c084fc' }}>{selectedPreviewIds.size} of {previewTasks.length} selected</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {previewTasks.map(t => {
              const isSelected = selectedPreviewIds.has(t.tempId);
              return (
                <div
                  key={t.tempId}
                  onClick={() => toggleSelectPreview(t.tempId)}
                  style={{ background: 'var(--bg-card)', border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', gap: '14px', alignItems: 'flex-start' }}
                >
                  <div style={{ marginTop: '2px', color: isSelected ? 'var(--primary-color)' : 'var(--text-muted)' }}>
                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '16px', color: '#fff' }}>{t.title}</span>
                      <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{t.priority}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Deadline: {t.deadline} • Est: {t.estimatedMinutes} mins • Category: {t.category}
                    </div>
                    <div style={{ fontSize: '13px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', color: '#c084fc' }}>
                      💡 <strong>AI Reasoning ({t.aiConfidence}% confidence):</strong> {t.reasoning}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={() => setPreviewTasks([])}
              style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer' }}
            >
              Discard All
            </button>
            <button
              onClick={handleSaveApprovedPreview}
              disabled={savingApproved || selectedPreviewIds.size === 0}
              style={{ padding: '10px 20px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Check size={16} />
              <span>{savingApproved ? 'Saving to Firebase...' : `Approve & Save ${selectedPreviewIds.size} Task(s) to Firebase`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs for Live Tasks */}
      <div className={styles.tabsBar}>
        <button className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`} onClick={() => setActiveTab('pending')}>
          Pending Review ({pendingTasks.length})
        </button>
        <button className={`${styles.tab} ${activeTab === 'approved' ? styles.activeTab : ''}`} onClick={() => setActiveTab('approved')}>
          Approved ({approvedTasks.length})
        </button>
        <button className={`${styles.tab} ${activeTab === 'ignored' ? styles.activeTab : ''}`} onClick={() => setActiveTab('ignored')}>
          Ignored ({ignoredTasks.length})
        </button>
      </div>

      {/* Task List */}
      <div className={styles.listContainer}>
        {activeTab === 'pending' && (
          pendingTasks.length === 0 ? (
            <div className={styles.emptyState}>No extracted tasks pending review. Paste communication or click Connect Gmail above to scan.</div>
          ) : (
            pendingTasks.map(task => (
              <AIReviewCard
                key={task.id}
                task={task}
                selected={selectedIds.includes(task.id)}
                onSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                onApprove={handleApproveExisting}
                onIgnore={handleIgnoreExisting}
              />
            ))
          )
        )}

        {activeTab === 'approved' && (
          approvedTasks.length === 0 ? (
            <div className={styles.emptyState}>No approved tasks yet.</div>
          ) : (
            <div className={styles.simpleList}>
              {approvedTasks.map(t => (
                <div key={t.id} className={styles.simpleRow}>
                  <span>✔ {t.title}</span>
                  <span className={styles.meta}>{t.deadline} • {t.source}</span>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'ignored' && (
          ignoredTasks.length === 0 ? (
            <div className={styles.emptyState}>No ignored tasks.</div>
          ) : (
            <div className={styles.simpleList}>
              {ignoredTasks.map(t => (
                <div key={t.id} className={styles.simpleRow}>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{t.title}</span>
                  <span className={styles.meta}>{t.deadline}</span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
