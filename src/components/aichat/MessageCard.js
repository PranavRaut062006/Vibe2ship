'use client';

import { Sparkles, Check, ArrowRight, AlertTriangle, HelpCircle } from 'lucide-react';
import styles from './MessageCard.module.css';

export default function MessageCard({ message, onAction }) {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className={`${styles.userRow} fade-in`}>
        <div className={styles.userBubble}>
          <p>{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.aiRow} fade-in`}>
      <div className={styles.aiHeader}>
        <Sparkles size={14} className="text-primary-color" />
        <span className={styles.aiLabel}>LifeSaver AI</span>
      </div>

      <div className={styles.aiCard}>
        <p className={styles.text}>{message.text}</p>

        {/* Embedded UI Card: Progress breakdown */}
        {message.embedType === 'progress_breakdown' && (
          <div className={styles.embedCard}>
            <div className={styles.embedHeader}>Progress Breakdown</div>
            <div className={styles.statRow}>
              <span>Completed</span>
              <span className="mono">3/8 tasks (38%)</span>
            </div>
            <div className={styles.statBarTrack}><div className={styles.statBarFill} style={{ width: '38%' }} /></div>

            <div className={styles.statRow}>
              <span>Time Used</span>
              <span className="mono">5.5/8 hrs (68%)</span>
            </div>
            <div className={styles.statBarTrack}><div className={styles.statBarFillWarning} style={{ width: '68%' }} /></div>

            <div className={styles.statRow}>
              <span>On Track</span>
              <span className="text-danger font-bold">No (34% behind pace)</span>
            </div>
          </div>
        )}

        {/* Embedded UI Card: Warning Card */}
        {message.embedType === 'warning' && (
          <div className={styles.warningCard}>
            <AlertTriangle size={18} className="text-warning" />
            <div>
              <strong>Deadline Risk Detected</strong>
              <p>Assignment is due in 14 hours. Delaying DSA Practice will push completion past midnight.</p>
            </div>
          </div>
        )}

        {/* Embedded UI Card: Question Card */}
        {message.embedType === 'question' && (
          <div className={styles.questionCard}>
            <div className={styles.questionTitle}>
              <HelpCircle size={16} className="text-primary-color" />
              <span>Would you like to shift evening personal items to tomorrow?</span>
            </div>
            <div className={styles.optionButtons}>
              <button onClick={() => onAction('Yes, shift personal items')}>Yes, shift personal items</button>
              <button onClick={() => onAction('No, keep my evening clear')}>No, keep my evening clear</button>
            </div>
          </div>
        )}

        {/* Inline Action Buttons */}
        {message.actions && (
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
