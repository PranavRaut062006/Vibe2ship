'use client';

import { useState } from 'react';
import { GraduationCap, Briefcase, Heart, Scale, Check, X, Sparkles } from 'lucide-react';
import styles from './AdaptiveModesModal.module.css';

export default function AdaptiveModesModal({ isOpen, onClose, currentMode = 'Balanced', onSelectMode }) {
  const [selected, setSelected] = useState(currentMode);
  const [pendingMode, setPendingMode] = useState(null);

  if (!isOpen) return null;

  const modes = [
    {
      id: 'Study First',
      icon: GraduationCap,
      desc: 'Academic tasks take priority. AI schedules study blocks first.',
      preview: [
        '↑ Higher Priority: Study tasks & exams',
        '↑ Higher Priority: College assignments',
        '↓ Lower Priority: Optional side projects',
        '→ Schedule rebuilds around peak focus hours'
      ]
    },
    {
      id: 'Career Mode',
      icon: Briefcase,
      desc: 'Meetings, interviews, and work deadlines prioritized.',
      preview: [
        '↑ Higher Priority: PR reviews & standups',
        '↑ Higher Priority: Hackathon sprint deliverables',
        '↓ Lower Priority: Non-urgent reading',
        '→ Protects 2-hour uninterrupted coding blocks'
      ]
    },
    {
      id: 'Health First',
      icon: Heart,
      desc: 'Rest, recovery, and wellness inserted throughout the day.',
      preview: [
        '↑ Higher Priority: Gym & sleep discipline',
        '↑ Mandatory: 15-min breaks every 90 mins',
        '↓ Prohibits work scheduling after 9:00 PM',
        '→ Automatically buffers high-stress meetings'
      ]
    },
    {
      id: 'Balanced',
      icon: Scale,
      desc: 'Equal weight across all life areas.',
      preview: [
        '→ Equal weight across academics, career, & health',
        '→ Dynamic trade-offs based on urgent deadlines',
        '→ Maintains sustainable daily pacing'
      ]
    }
  ];

  const handleCardClick = (mId) => {
    if (mId === selected) return;
    setPendingMode(modes.find(m => m.id === mId));
  };

  const handleConfirm = () => {
    if (pendingMode) {
      setSelected(pendingMode.id);
      if (onSelectMode) onSelectMode(pendingMode.id);
      setPendingMode(null);
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.modal} scale-in`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <Sparkles size={20} className="text-primary-color" />
            <h3 className={styles.title}>Productivity Mode</h3>
          </div>
          <div className={styles.activePill}>Active: {selected}</div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div className={styles.grid}>
          {modes.map((m) => {
            const IconComp = m.icon;
            const isActive = m.id === selected;
            const isPending = pendingMode && pendingMode.id === m.id;

            return (
              <div
                key={m.id}
                className={`${styles.card} ${isActive ? styles.cardActive : ''} ${isPending ? styles.cardPending : ''}`}
                onClick={() => handleCardClick(m.id)}
              >
                <div className={styles.cardHeader}>
                  <IconComp size={28} className={isActive || isPending ? 'text-primary-color' : 'text-muted'} />
                  {isActive && <span className={styles.badgeActive}>Active</span>}
                  {isPending && <span className={styles.badgePending}>Selected</span>}
                </div>
                <h4 className={styles.modeName}>{m.id}</h4>
                <p className={styles.modeDesc}>{m.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Priority Preview Confirmation Box */}
        {pendingMode && (
          <div className={`${styles.previewBox} slide-up`}>
            <div className={styles.previewHeader}>
              <span>Switching to: <strong>{pendingMode.id}</strong></span>
            </div>
            <ul className={styles.previewList}>
              {pendingMode.preview.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>

            <div className={styles.previewActions}>
              <button className={styles.cancelBtn} onClick={() => setPendingMode(null)}>Cancel</button>
              <button className={styles.confirmBtn} onClick={handleConfirm}>
                <Check size={16} />
                <span>Confirm Switch</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
