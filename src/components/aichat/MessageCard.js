'use client';

import { useState } from 'react';
import { Sparkles, Check, ArrowRight, AlertTriangle, HelpCircle, CheckCircle, Clock } from 'lucide-react';
import { approveChatProposals } from '@/lib/api';
import styles from './MessageCard.module.css';

export default function MessageCard({ message, onAction }) {
  const isUser = message.sender === 'user';
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(message.approved || false);

  const handleApprove = async () => {
    if (approved || approving || !message.id) return;
    setApproving(true);
    try {
      await approveChatProposals(message.id);
      setApproved(true);
      window.dispatchEvent(new CustomEvent('taskCreated'));
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
    } catch (err) {
      console.error("Failed to approve proposals:", err);
      alert(err.message || "Failed to approve proposals");
    } finally {
      setApproving(false);
    }
  };

  if (isUser) {
    return (
      <div className={`${styles.userRow} fade-in`}>
        <div className={styles.userBubble}>
          <p>{message.text}</p>
        </div>
      </div>
    );
  }

  const hasProposedTasks = message.proposedTasks && message.proposedTasks.length > 0;
  const hasProposedBlocks = message.proposedScheduleBlocks && message.proposedScheduleBlocks.length > 0;

  return (
    <div className={`${styles.aiRow} fade-in`}>
      <div className={styles.aiHeader}>
        <Sparkles size={14} className="text-primary-color" />
        <span className={styles.aiLabel}>LifePilot AI</span>
      </div>

      <div className={styles.aiCard}>
        <p className={styles.text}>{message.text}</p>

        {/* AI Proposals Preview Box */}
        {(hasProposedTasks || hasProposedBlocks) && (
          <div className={styles.proposalBox}>
            <div className={styles.proposalHeader}>
              <Sparkles size={16} />
              <span>AI Proposed Actions (Require Approval)</span>
            </div>

            <div className={styles.proposalList}>
              {hasProposedTasks && message.proposedTasks.map((t, idx) => (
                <div key={idx} className={styles.proposalItem}>
                  <div className={styles.proposalTitle}>📋 Task: {t.title}</div>
                  <div className={styles.proposalSub}>
                    {t.deadline && `Deadline: ${t.deadline}`} {t.priority && `• ${t.priority}`} {t.estimatedMinutes && `• ${t.estimatedMinutes}m`}
                    {t.recurring && t.recurring !== 'none' && ` • 🔄 ${t.recurring}`}
                  </div>
                  {t.reasoning && <div style={{ fontSize: '12px', color: '#c084fc', marginTop: '4px' }}>💡 {t.reasoning}</div>}
                </div>
              ))}

              {hasProposedBlocks && message.proposedScheduleBlocks.map((b, idx) => (
                <div key={idx} className={styles.proposalItem}>
                  <div className={styles.proposalTitle}>📅 Schedule Block: {b.title}</div>
                  <div className={styles.proposalSub}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {b.startTime} – {b.endTime} • {b.type?.toUpperCase()}
                  </div>
                  {b.why && <div style={{ fontSize: '12px', color: '#c084fc', marginTop: '4px' }}>💡 {b.why}</div>}
                </div>
              ))}
            </div>

            {approved ? (
              <div className={styles.approvedBadge}>
                <CheckCircle size={16} />
                <span>Approved & Saved to Firebase</span>
              </div>
            ) : (
              <button className={styles.approveBtn} onClick={handleApprove} disabled={approving}>
                <Check size={16} />
                <span>{approving ? 'Saving to Firebase...' : 'Approve & Save to Firebase'}</span>
              </button>
            )}
          </div>
        )}

        {/* Inline Action Buttons */}
        {message.actions && message.actions.length > 0 && (
          <div className={styles.actionRow}>
            {message.actions.map((act, idx) => (
              <button
                key={idx}
                className={act.primary ? styles.actionBtnPrimary : styles.actionBtnSecondary}
                onClick={() => onAction(act.label)}
              >
                {act.primary && <Check size={14} />}
                <span>{act.label}</span>
                {!act.primary && <ArrowRight size={13} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
