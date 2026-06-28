'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Layers, Upload, Check, X, Clock, Calendar as CalendarIcon, AlertTriangle, ShieldAlert } from 'lucide-react';
import TaskQueuePanel from '@/components/schedule/TaskQueuePanel';
import TimelineView from '@/components/schedule/TimelineView';
import ReplanningDrawer from '@/components/schedule/ReplanningDrawer';
import RecoveryModal from '@/components/schedule/RecoveryModal';
import { extractTimetableImage, updateScheduleBlocks, fetchSchedule, checkScheduleBurnout } from '@/lib/api';
import styles from './page.module.css';

export default function SchedulePage() {
  const [replanOpen, setReplanOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  // Burnout detection state
  const [burnout, setBurnout] = useState(null);

  // Timetable OCR state
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [extractedSummary, setExtractedSummary] = useState('');
  const [extractedBlocks, setExtractedBlocks] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [savingOcr, setSavingOcr] = useState(false);

  const fileInputRef = useRef(null);

  const checkBurnoutState = async () => {
    try {
      const res = await checkScheduleBurnout('today');
      if (res && res.burnoutDetected) {
        setBurnout(res);
      } else {
        setBurnout(null);
      }
    } catch (err) {
      console.error("Failed to check burnout:", err);
    }
  };

  useEffect(() => {
    checkBurnoutState();
    const handleUpdate = () => checkBurnoutState();
    window.addEventListener('scheduleUpdated', handleUpdate);
    return () => window.removeEventListener('scheduleUpdated', handleUpdate);
  }, []);

  const handleScheduleTask = (task) => {
    setScheduledCount(prev => prev + 1);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrError(null);
    setOcrLoading(true);
    setOcrModalOpen(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result;
      try {
        const res = await extractTimetableImage(base64String, file.type || 'image/png');
        setExtractedSummary(res.summary || "Extracted timetable schedule");
        const blocks = res.extractedBlocks || [];
        setExtractedBlocks(blocks);
        setSelectedIndices(new Set(blocks.map((_, i) => i)));
      } catch (err) {
        console.error("Timetable OCR extraction error:", err);
        setOcrError(err.message || "Failed to analyze timetable image. Please make sure image text is clear.");
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSelectBlock = (idx) => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleApproveOcr = async () => {
    const blocksToSave = extractedBlocks.filter((_, i) => selectedIndices.has(i));
    if (blocksToSave.length === 0) return;

    setSavingOcr(true);
    try {
      const res = await fetchSchedule('today');
      const existing = (res.schedule && res.schedule.blocks) ? res.schedule.blocks : [];
      
      const formattedNew = blocksToSave.map(b => ({
        title: `${b.subject || 'Class'} (${b.day || 'Daily'})`,
        startTime: b.startTime || '09:00',
        endTime: b.endTime || '10:00',
        type: 'assignment',
        why: `OCR extracted from timetable (${b.location || 'Online'}) • Recurring: ${b.recurring || 'weekly'}`
      }));

      const combined = [...existing, ...formattedNew];
      await updateScheduleBlocks('today', combined);
      
      setOcrModalOpen(false);
      setExtractedBlocks([]);
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
      alert(`✔ Successfully approved and merged ${blocksToSave.length} timetable block(s) into Firebase!`);
    } catch (err) {
      console.error("Error saving OCR blocks:", err);
      alert("Failed to save timetable blocks to Firebase.");
    } finally {
      setSavingOcr(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Today / Schedule</h1>
          <p className={styles.pageSubtitle}>Smarter than Google Calendar • Dynamic timeline & Burnout prevention</p>
        </div>

        <div className={styles.headerActions}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileSelect}
          />
          <button
            className={styles.replanBtn}
            style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            <span>Upload Timetable (OCR)</span>
          </button>

          <button
            className={styles.replanBtn}
            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}
            onClick={() => setRecoveryOpen(true)}
          >
            <ShieldAlert size={16} />
            <span>Multi-Option Recovery</span>
          </button>

          <button className={styles.replanBtn} onClick={() => setReplanOpen(true)}>
            <Sparkles size={16} />
            <span>Trigger Dynamic Replan</span>
          </button>

          <button className={styles.mobileQueueToggle} onClick={() => setMobileQueueOpen(true)}>
            <Layers size={16} />
            <span>Queue ({5 - scheduledCount})</span>
          </button>
        </div>
      </div>

      {/* Burnout Warning Banner */}
      {burnout && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px', padding: '20px', marginBottom: '24px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
            <AlertTriangle />
            <span>Cognitive Burnout Risk Detected ({burnout.totalFocusHours} Focus Hours Today)</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: '0 0 12px', lineHeight: 1.5 }}>
            🧠 <strong>AI Decision Reasoning:</strong> {burnout.reasoning}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {burnout.recommendations?.map((rec, i) => (
              <button
                key={i}
                onClick={() => { alert(`✔ Recommended Action "${rec.title}" scheduled! (${rec.why})`); setBurnout(null); }}
                style={{ background: 'var(--bg-card)', border: '1px solid #ef4444', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                ⚡ {rec.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.splitLayout}>
        <div className={`${styles.leftPanelWrapper} ${mobileQueueOpen ? styles.mobileOpen : ''}`}>
          {mobileQueueOpen && (
            <div className={styles.mobileSheetHeader}>
              <h3>Task Queue</h3>
              <button onClick={() => setMobileQueueOpen(false)}>Close ✕</button>
            </div>
          )}
          <TaskQueuePanel onScheduleTask={handleScheduleTask} />
        </div>

        <div className={styles.rightPanelWrapper}>
          <TimelineView onTriggerReplan={() => setReplanOpen(true)} />
        </div>
      </div>

      <ReplanningDrawer
        isOpen={replanOpen}
        onClose={() => setReplanOpen(false)}
        delayedTask={{ title: 'Sprint Deliverable', delay: '45 mins' }}
        onConfirmReplan={() => {
          setReplanOpen(false);
          window.dispatchEvent(new CustomEvent('scheduleUpdated'));
        }}
      />

      <RecoveryModal
        isOpen={recoveryOpen}
        onClose={() => setRecoveryOpen(false)}
      />

      {/* Timetable OCR Modal */}
      {ocrModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 700, color: '#fff' }}>
                <Sparkles className="text-primary-color" />
                <span>Timetable OCR & Schedule Extraction</span>
              </div>
              <button onClick={() => setOcrModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>

            {ocrLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#c084fc' }}>
                <Sparkles size={40} className="spin" style={{ margin: '0 auto 16px', display: 'block' }} />
                <h3>Gemini Vision analyzing timetable image...</h3>
                <p style={{ color: 'var(--text-muted)' }}>Extracting days, timings, subjects, and recurring rules.</p>
              </div>
            ) : ocrError ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ef4444' }}>
                <p>{ocrError}</p>
                <button onClick={() => setOcrModalOpen(false)} style={{ marginTop: '16px', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>{extractedSummary}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '13px', color: '#c084fc' }}>
                  <span>Select sessions to approve and save to Firebase:</span>
                  <span>{selectedIndices.size} of {extractedBlocks.length} selected</span>
                </div>

                {extractedBlocks.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>No class blocks detected in image.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {extractedBlocks.map((b, idx) => {
                      const isSelected = selectedIndices.has(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleSelectBlock(idx)}
                          style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '10px', padding: '14px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center' }}
                        >
                          <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>{b.subject || 'Class Session'}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarIcon size={13} /> {b.day || 'Daily'}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {b.startTime} – {b.endTime}</span>
                              {b.location && <span>📍 {b.location}</span>}
                              {b.recurring && <span style={{ color: '#c084fc' }}>🔄 {b.recurring}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button onClick={() => setOcrModalOpen(false)} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                  <button
                    onClick={handleApproveOcr}
                    disabled={savingOcr || selectedIndices.size === 0}
                    style={{ padding: '10px 20px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Check size={16} />
                    <span>{savingOcr ? 'Saving to Firebase...' : `Approve & Save ${selectedIndices.size} Block(s) to Firebase`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
