'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, CheckSquare, Clock, ArrowRight, Target, Plus, AlertCircle } from 'lucide-react';
import { fetchTasks, fetchSchedule } from '@/lib/api';
import styles from './page.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [scheduleBlocks, setScheduleBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [tRes, sRes] = await Promise.all([fetchTasks(), fetchSchedule('today')]);
        setTasks(tRes.tasks || []);
        if (sRes.schedule && sRes.schedule.blocks) {
          setScheduleBlocks(sRes.schedule.blocks);
        } else {
          setScheduleBlocks([]);
        }
      } catch (err) {
        console.error("Failed to load dashboard summaries:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const upcomingDeadlines = [...pendingTasks].sort((a, b) => new Date(a.deadline || '2099') - new Date(b.deadline || '2099')).slice(0, 5);
  const todayBlocks = scheduleBlocks.filter(b => b.type !== 'buffer').slice(0, 5);

  const navigateTo = (path) => {
    router.push(path);
  };

  return (
    <div className={styles.container}>
      <div className={styles.heroHeader}>
        <h1>Executive Overview</h1>
        <p>Your manual productivity control center summarizing Today&apos;s schedule, priority tasks, and quick navigation.</p>
      </div>

      <div className={styles.execGrid}>
        {/* Today's Schedule Summary */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Calendar size={20} className="text-primary-color" />
              <span>Today&apos;s Schedule</span>
            </div>
            <button className={styles.viewAllBtn} onClick={() => navigateTo('/schedule')}>
              <span>View Calendar</span> <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className={styles.emptyState}>Loading schedule...</div>
          ) : todayBlocks.length === 0 ? (
            <div className={styles.emptyState}>No scheduled calendar blocks today. Open Calendar to add or drag tasks.</div>
          ) : (
            <div className={styles.list}>
              {todayBlocks.map((block, idx) => (
                <div key={block._id || idx} className={styles.listItem}>
                  <div>
                    <div className={styles.itemTitle}>{block.title}</div>
                    <div className={styles.itemSub}>
                      <Clock size={13} /> {block.startTime} – {block.endTime} • {block.type?.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks & Deadlines Summary */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <CheckSquare size={20} className="text-accent" />
              <span>Pending Tasks ({pendingTasks.length})</span>
            </div>
            <button className={styles.viewAllBtn} onClick={() => navigateTo('/planner')}>
              <span>Open Planner</span> <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className={styles.emptyState}>Loading tasks...</div>
          ) : upcomingDeadlines.length === 0 ? (
            <div className={styles.emptyState}>No pending tasks. You&apos;re all caught up!</div>
          ) : (
            <div className={styles.list}>
              {upcomingDeadlines.map(task => {
                const badgeClass = task.priority === 'P1' ? styles.badgeP1 : task.priority === 'P2' ? styles.badgeP2 : styles.badgeP3;
                return (
                  <div key={task._id || task.id} className={styles.listItem}>
                    <div>
                      <div className={styles.itemTitle}>{task.title}</div>
                      <div className={styles.itemSub}>
                        <span>Deadline: {task.deadline || 'Today'}</span>
                        {task.category && <span>• {task.category}</span>}
                      </div>
                    </div>
                    <span className={`${styles.badge} ${badgeClass}`}>{task.priority || 'P2'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.card} style={{ gridColumn: 'span 2' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Target size={20} style={{ color: '#f59e0b' }} />
              <span>Quick Actions & Manual Management</span>
            </div>
          </div>

          <div className={styles.quickActionsGrid}>
            <button className={styles.actionBtn} onClick={() => navigateTo('/planner')}>
              <Plus size={22} className={styles.actionIcon} />
              <span className={styles.actionTitle}>Add Planner Task</span>
              <span className={styles.actionSub}>Create manual tasks, deadlines, or recurring workflows</span>
            </button>

            <button className={styles.actionBtn} onClick={() => navigateTo('/schedule')}>
              <Calendar size={22} className={styles.actionIcon} />
              <span className={styles.actionTitle}>Manage Calendar</span>
              <span className={styles.actionSub}>Drag, drop, resize, and edit blocks directly on timeline</span>
            </button>

            <button className={styles.actionBtn} onClick={() => navigateTo('/goals')}>
              <Target size={22} style={{ color: '#f59e0b' }} />
              <span className={styles.actionTitle}>Set Goals & Habits</span>
              <span className={styles.actionSub}>Track executive milestones and daily habit streaks</span>
            </button>

            <button className={styles.actionBtn} onClick={() => navigateTo('/inbox')}>
              <AlertCircle size={22} style={{ color: '#ec4899' }} />
              <span className={styles.actionTitle}>Check Inbox Queue</span>
              <span className={styles.actionSub}>Review parsed tasks before adding to your queue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
