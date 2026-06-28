'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock, AlertTriangle, CheckCircle, Target, Award, RefreshCw } from 'lucide-react';
import AIMemoryPanel from '@/components/progress/AIMemoryPanel';
import { fetchInsights } from '@/lib/api';
import styles from './page.module.css';

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    consistencyScore: 0,
    taskCompletionRate: 0,
    completedCount: 0,
    pendingCount: 0,
    delayedCount: 0,
    avgHabitProgress: 0,
    avgGoalProgress: 0,
    streak: 0,
    productivityMode: 'Balanced',
    mostPostponed: 'None',
    mostProductiveHours: '09:00 - 11:00 AM',
    weeklyImprovement: 'Awaiting initial activity'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchInsights();
      if (res) setData(res);
    } catch (err) {
      console.error("Failed to load insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hasActivity = data.completedCount > 0 || data.pendingCount > 0 || data.avgHabitProgress > 0 || data.avgGoalProgress > 0;

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Executive Insights & Consistency</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0 }}>Real-time biological performance metrics derived from your live Firebase data.</p>
        </div>
        <button
          onClick={loadData}
          style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Hero Consistency Card */}
      <div className={styles.heroCard} style={{ background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.15) 0%, rgba(18, 18, 26, 0.9) 100%)', border: '1px solid rgba(108, 99, 255, 0.4)', borderRadius: '20px', padding: '32px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '56px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{data.consistencyScore}</span>
            <span style={{ fontSize: '20px', color: '#c084fc', fontWeight: 600 }}>/ 100 Consistency Score</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ background: 'var(--primary-color)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              Mode: {data.productivityMode}
            </span>
            <span style={{ color: '#34d399', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} /> {data.weeklyImprovement}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', background: 'rgba(0,0,0,0.3)', padding: '20px 28px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{data.streak} 🔥</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Day Streak</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399' }}>{data.taskCompletionRate}%</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Task Completion</div>
          </div>
        </div>
      </div>

      {!hasActivity ? (
        <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: '16px', padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Sparkles size={40} className="text-primary-color" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>No Performance Data Recorded Yet</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 20px', fontSize: '14px' }}>Complete tasks in the Planner or follow scheduled blocks to allow Gemini AI to map your executive productivity patterns.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {/* Card 1: Task Execution */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c084fc', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>
              <CheckCircle size={18} />
              <span>Task Execution Rate</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>{data.completedCount} / {data.completedCount + data.pendingCount}</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Tasks completed on time out of total active items.</p>
            {data.delayedCount > 0 && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={13} /> {data.delayedCount} task(s) currently delayed or past deadline.
              </div>
            )}
          </div>

          {/* Card 2: Habit & Goal Progress */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>
              <Target size={18} />
              <span>Habits & Goals Adherence</span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Habit Consistency</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{data.avgHabitProgress}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${data.avgHabitProgress}%`, background: '#34d399', height: '100%' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Long-Term Goal Progress</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{data.avgGoalProgress}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${data.avgGoalProgress}%`, background: '#6c63ff', height: '100%' }} />
              </div>
            </div>
          </div>

          {/* Card 3: Biological Peak & Postponements */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>
              <Clock size={18} />
              <span>Behavioral Patterns</span>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Most Productive Hours</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>⚡ {data.mostProductiveHours}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Frequently Postponed</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#ef4444', marginTop: '2px' }}>⚠️ {data.mostPostponed}</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Learned Memory Section */}
      <AIMemoryPanel />
    </div>
  );
}
