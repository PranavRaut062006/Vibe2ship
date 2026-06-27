'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MorningBriefCard from '@/components/dashboard/MorningBriefCard';
import BurnoutCard from '@/components/dashboard/BurnoutCard';
import TaskList from '@/components/dashboard/TaskList';
import ScheduleCard from '@/components/dashboard/ScheduleCard';
import ConsistencyWidget from '@/components/dashboard/ConsistencyWidget';
import WorkloadMeter from '@/components/dashboard/WorkloadMeter';
import QuickActionsGrid from '@/components/dashboard/QuickActionsGrid';
import styles from './page.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [taskState, setTaskState] = useState('default'); // 'default' | 'loading' | 'empty' | 'error'
  const [showBurnout, setShowBurnout] = useState(true);

  const navigateTo = (path) => {
    router.push(path === 'dashboard' ? '/' : `/${path}`);
  };

  return (
    <div className={styles.container}>
      {/* Top Section — Morning AI Brief Card */}
      <MorningBriefCard onOrganize={() => navigateTo('schedule')} />

      {/* Burnout Detection Intervention Card */}
      {showBurnout && (
        <BurnoutCard
          onDismiss={() => setShowBurnout(false)}
          onScheduleBreak={(breakLabel) => alert(`Scheduled ${breakLabel} into timeline!`)}
        />
      )}

      {/* Main Desktop Grid: 65% Left / 35% Right */}
      <div className={styles.execGrid}>
        {/* Left Column (65%) */}
        <div className={styles.leftCol}>
          <TaskList
            state={taskState}
            onConnectGmail={() => navigateTo('inbox')}
            onViewAll={() => navigateTo('inbox')}
          />
          <ScheduleCard onOpenSchedule={() => navigateTo('schedule')} />
        </div>

        {/* Right Column (35%) */}
        <div className={styles.rightCol}>
          <ConsistencyWidget />
          <WorkloadMeter />
          <QuickActionsGrid
            onNavigate={navigateTo}
            onQuickAdd={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
