'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, CheckSquare, Clock, ArrowRight, Target, Plus, AlertCircle, Circle, CheckCircle2, Edit2, Trash2, Zap, Award } from 'lucide-react';
import { fetchTasks, fetchSchedule, updateTask, deleteTask, fetchInsights, fetchHabits, fetchGoals, updateScheduleBlocks } from '@/lib/api';
import styles from './page.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [scheduleBlocks, setScheduleBlocks] = useState([]);
  const [insights, setInsights] = useState(null);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [tRes, sRes, iRes, hRes, gRes] = await Promise.all([
        fetchTasks(),
        fetchSchedule('today'),
        fetchInsights(),
        fetchHabits(),
        fetchGoals()
      ]);
      setTasks(tRes.tasks || []);
      setScheduleBlocks((sRes.schedule && sRes.schedule.blocks) ? sRes.schedule.blocks : []);
      if (iRes) setInsights(iRes);
      setHabits(hRes.habits || []);
      setGoals(gRes.goals || []);
    } catch (err) {
      console.error("Failed to load dashboard summaries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const handleSync = () => loadDashboardData();
    window.addEventListener('taskCreated', handleSync);
    window.addEventListener('taskUpdated', handleSync);
    window.addEventListener('scheduleUpdated', handleSync);
    window.addEventListener('userAuthChanged', handleSync);
    return () => {
      window.removeEventListener('taskCreated', handleSync);
      window.removeEventListener('taskUpdated', handleSync);
      window.removeEventListener('scheduleUpdated', handleSync);
      window.removeEventListener('userAuthChanged', handleSync);
    };
  }, []);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const upcomingDeadlines = [...pendingTasks].sort((a, b) => new Date(a.deadline || '2099') - new Date(b.deadline || '2099')).slice(0, 5);
  const todayBlocks = scheduleBlocks.filter(b => b.type !== 'buffer').slice(0, 5);

  const navigateTo = (path) => {
    router.push(path);
  };

  const handleToggleComplete = async (task) => {
    try {
      await updateTask(task._id || task.id, { status: 'completed' });
      setTasks(prev => prev.map(t => (t._id || t.id) === (task._id || task.id) ? { ...t, status: 'completed' } : t));
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleEdit = async (task) => {
    const newTitle = prompt("Edit task title:", task.title);
    if (!newTitle || newTitle.trim() === task.title) return;
    try {
      await updateTask(task._id || task.id, { title: newTitle.trim() });
      await loadDashboardData();
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
    } catch (err) {
      console.error("Failed to edit task:", err);
    }
  };

  const handleDelete = async (task) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      await deleteTask(task._id || task.id);
      setTasks(prev => prev.filter(t => (t._id || t.id) !== (task._id || task.id)));
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleCompleteBlock = async (block) => {
    const updated = scheduleBlocks.filter(b => (b._id || b.title) !== (block._id || block.title));
    setScheduleBlocks(updated);
    await updateScheduleBlocks('today', updated);
    window.dispatchEvent(new CustomEvent('scheduleUpdated'));
  };

  const handleEditBlock = async (block) => {
    const newTitle = prompt("Edit schedule block:", block.title);
    if (!newTitle || newTitle.trim() === block.title) return;
    const updated = scheduleBlocks.map(b => (b._id || b.title) === (block._id || block.title) ? { ...b, title: newTitle.trim() } : b);
    setScheduleBlocks(updated);
    await updateScheduleBlocks('today', updated);
    window.dispatchEvent(new CustomEvent('scheduleUpdated'));
  };

  const handleDeleteBlock = async (block) => {
    if (!confirm(`Delete calendar block "${block.title}"?`)) return;
    const updated = scheduleBlocks.filter(b => (b._id || b.title) !== (block._id || block.title));
    setScheduleBlocks(updated);
    await updateScheduleBlocks('today', updated);
    window.dispatchEvent(new CustomEvent('scheduleUpdated'));
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
                <div key={block._id || idx} className={styles.listItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
                    <div onClick={() => handleCompleteBlock(block)} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }} title="Mark Complete">
                      <Circle size={18} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div className={styles.itemTitle} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{block.title}</div>
                      <div className={styles.itemSub}>
                        <Clock size={13} /> {block.startTime} – {block.endTime} • {block.type?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => handleEditBlock(block)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} title="Edit Block">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteBlock(block)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete Block">
                      <Trash2 size={14} />
                    </button>
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
                  <div key={task._id || task.id} className={styles.listItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
                      <div onClick={() => handleToggleComplete(task)} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }} title="Mark Complete">
                        <Circle size={18} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div className={styles.itemTitle} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                        <div className={styles.itemSub}>
                          <span>Deadline: {task.deadline || 'Today'}</span>
                          {task.category && <span> • {task.category}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`${styles.badge} ${badgeClass}`}>{task.priority || 'P2'}</span>
                      <button onClick={() => handleEdit(task)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} title="Edit Task">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(task)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete Task">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Consistency Score & Goals Summary */}
        <div className={styles.card} style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(26, 26, 38, 0.9) 100%)', border: '1px solid rgba(108, 99, 255, 0.3)' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Award size={20} color="#6C63FF" />
              <span>Consistency Score & Habit Tracking</span>
            </div>
            <button className={styles.viewAllBtn} onClick={() => navigateTo('/progress')}>
              <span>View Insights</span> <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '16px 0' }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Real Consistency Score</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#a5b4fc' }}>{insights?.consistencyScore ?? 100}%</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Based on task & habit adherence</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Active Habits Tracked</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#34d399' }}>{habits.length}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Building daily momentum</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Long-term Goals</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#fbbcfc', color: '#f472b6' }}>{goals.length}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Executive milestones</div>
            </div>
          </div>
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
              <Target size={22} style={{ color: '#10b981' }} />
              <span className={styles.actionTitle}>Track Goals & Habits</span>
              <span className={styles.actionSub}>Build streaks and maintain consistency scores</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
