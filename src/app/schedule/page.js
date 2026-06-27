'use client';

import { useState } from 'react';
import { Sparkles, Layers } from 'lucide-react';
import TaskQueuePanel from '@/components/schedule/TaskQueuePanel';
import TimelineView from '@/components/schedule/TimelineView';
import ReplanningDrawer from '@/components/schedule/ReplanningDrawer';
import ActiveVerificationToast from '@/components/schedule/ActiveVerificationToast';
import styles from './page.module.css';

export default function SchedulePage() {
  const [replanOpen, setReplanOpen] = useState(false);
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  const handleScheduleTask = (task) => {
    setScheduledCount(prev => prev + 1);
    // Open replanning drawer briefly or notify
  };

  const handleVerificationResponse = (resp) => {
    if (resp === 'not_started') {
      setReplanOpen(true);
    }
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Today / Schedule</h1>
          <p className={styles.pageSubtitle}>Smarter than Google Calendar · Dynamic executive timeline</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.replanBtn} onClick={() => setReplanOpen(true)}>
            <Sparkles size={16} />
            <span>Simulate AI Replan</span>
          </button>

          <button className={styles.mobileQueueToggle} onClick={() => setMobileQueueOpen(true)}>
            <Layers size={16} />
            <span>Queue ({5 - scheduledCount})</span>
          </button>
        </div>
      </div>

      {/* Main 2-Panel Layout */}
      <div className={styles.splitLayout}>
        {/* Left Panel: 340px (Hidden on mobile unless opened) */}
        <div className={`${styles.leftPanelWrapper} ${mobileQueueOpen ? styles.mobileOpen : ''}`}>
          {mobileQueueOpen && (
            <div className={styles.mobileSheetHeader}>
              <h3>Task Queue</h3>
              <button onClick={() => setMobileQueueOpen(false)}>Close ✕</button>
            </div>
          )}
          <TaskQueuePanel onScheduleTask={handleScheduleTask} />
        </div>

        {/* Right Panel: Timeline Flex */}
        <div className={styles.rightPanelWrapper}>
          <TimelineView onTriggerReplan={() => setReplanOpen(true)} />
        </div>
      </div>

      {/* Replanning Drawer Overlay */}
      <ReplanningDrawer
        isOpen={replanOpen}
        onClose={() => setReplanOpen(false)}
        onAccept={() => setReplanOpen(false)}
      />

      {/* Verification Toast at bottom */}
      <ActiveVerificationToast onResponse={handleVerificationResponse} />
    </div>
  );
}
