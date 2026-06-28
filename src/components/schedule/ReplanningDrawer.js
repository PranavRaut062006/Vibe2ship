'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X, Clock, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { triggerDynamicReplan, updateScheduleBlocks } from '@/lib/api';
import styles from './ReplanningDrawer.module.css';

export default function ReplanningDrawer({ isOpen, onClose, delayedTask, onConfirmReplan }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [proposedBlocks, setProposedBlocks] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    async function getProposals() {
      setLoading(true);
      try {
        const reason = delayedTask ? `Delay in ${delayedTask.title || 'Task'}` : "User requested dynamic schedule re-optimization";
        const res = await triggerDynamicReplan('today', reason);
        if (res) {
          setSummary(res.summary || "AI dynamically shifted blocks to protect priority items.");
          setProposedBlocks(res.proposedBlocks || []);
        }
      } catch (err) {
        console.error("Failed to generate dynamic replan:", err);
        setSummary("Failed to generate dynamic schedule optimization.");
      } finally {
        setLoading(false);
      }
    }
    getProposals();
  }, [isOpen, delayedTask]);

  if (!isOpen) return null;

  const handleApproveSave = async () => {
    if (proposedBlocks.length === 0) return;
    setSaving(true);
    try {
      await updateScheduleBlocks('today', proposedBlocks);
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
      if (onConfirmReplan) onConfirmReplan(proposedBlocks);
      onClose();
    } catch (err) {
      console.error("Failed to save replanned schedule:", err);
      alert("Failed to save schedule to Firebase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.drawer} slide-in`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <Sparkles size={20} className="text-primary-color" />
            <h3 className={styles.title}>AI Dynamic Replanning (Preview)</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} disabled={saving}>
            <X size={18} />
          </button>
        </div>

        <p className={styles.subtitle}>
          Strict Human-in-the-Loop Governance: LifePilot AI calculated a new schedule to accommodate unexpected delays or mode changes. Review proposals and reasoning before saving.
        </p>

        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#c084fc' }}>
            <RefreshCw size={36} className="spin" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h4>Gemini analyzing biological pacing & priorities...</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Calculating downstream shifts without overwriting your current data.</p>
          </div>
        ) : (
          <>
            <div style={{ background: 'rgba(108, 99, 255, 0.1)', border: '1px solid rgba(108, 99, 255, 0.3)', padding: '14px', borderRadius: '10px', fontSize: '14px', color: '#fff', marginBottom: '20px' }}>
              💡 <strong>Executive Summary:</strong> {summary}
            </div>

            <div className={styles.changesList} style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {proposedBlocks.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No changes proposed.</div>
              ) : (
                proposedBlocks.map((b, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px', color: '#fff' }}>{b.title}</span>
                      <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', color: '#c084fc' }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {b.startTime} – {b.endTime}
                      </span>
                    </div>
                    {b.why && (
                      <div style={{ fontSize: '12px', color: '#34d399', background: 'rgba(52, 211, 153, 0.08)', padding: '6px 10px', borderRadius: '6px', marginTop: '6px' }}>
                        🧠 <strong>AI Decision Reasoning:</strong> {b.why}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className={styles.footer}>
          <button className={styles.rejectBtn} onClick={onClose} disabled={saving}>Discard Changes</button>
          <button
            className={styles.acceptBtn}
            onClick={handleApproveSave}
            disabled={saving || loading || proposedBlocks.length === 0}
            style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Check size={16} />
            <span>{saving ? 'Saving to Firebase...' : 'Approve & Save AI Replan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
