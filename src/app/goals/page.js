'use client';

import { useState, useEffect } from 'react';
import { Target, Flame, Plus, Trash2, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { fetchGoals, createGoal, updateGoal, deleteGoal, fetchHabits, createHabit, updateHabit, deleteHabit } from '@/lib/api';
import styles from './page.module.css';

export default function GoalsHabitsPage() {
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

  // Goal Form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('Career');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalTargetVal, setGoalTargetVal] = useState(100);
  const [goalCurrentVal, setGoalCurrentVal] = useState(0);

  // Habit Form
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState('Health');
  const [habitFrequency, setHabitFrequency] = useState('daily');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [gRes, hRes] = await Promise.all([fetchGoals(), fetchHabits()]);
      setGoals(gRes.goals || []);
      setHabits(hRes.habits || []);
    } catch (err) {
      console.error("Failed to load goals/habits:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await createGoal({
        title: goalTitle,
        category: goalCategory,
        targetDate: goalTargetDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        targetValue: Number(goalTargetVal),
        currentValue: Number(goalCurrentVal),
        progress: Math.min(100, Math.round((Number(goalCurrentVal) / Number(goalTargetVal)) * 100))
      });
      setIsGoalModalOpen(false);
      setGoalTitle('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGoalProgress = async (goal, increment) => {
    const newVal = Math.min(goal.targetValue, Math.max(0, (goal.currentValue || 0) + increment));
    const newProg = Math.round((newVal / goal.targetValue) * 100);
    try {
      await updateGoal(goal._id || goal.id, { currentValue: newVal, progress: newProg });
      setGoals(prev => prev.map(g => (g._id || g.id) === (goal._id || goal.id) ? { ...g, currentValue: newVal, progress: newProg } : g));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm("Delete this goal?")) return;
    await deleteGoal(id);
    setGoals(prev => prev.filter(g => (g._id || g.id) !== id));
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    try {
      await createHabit({
        title: habitTitle,
        category: habitCategory,
        frequency: habitFrequency,
        streak: 0
      });
      setIsHabitModalOpen(false);
      setHabitTitle('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckinHabit = async (habit) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const completed = habit.completedDates || [];
    let newStreak = habit.streak || 0;
    let newDates;

    if (completed.includes(todayStr)) {
      newDates = completed.filter(d => d !== todayStr);
      newStreak = Math.max(0, newStreak - 1);
    } else {
      newDates = [...completed, todayStr];
      newStreak += 1;
    }

    try {
      await updateHabit(habit._id || habit.id, { completedDates: newDates, streak: newStreak });
      setHabits(prev => prev.map(h => (h._id || h.id) === (habit._id || habit.id) ? { ...h, completedDates: newDates, streak: newStreak } : h));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!confirm("Delete this habit?")) return;
    await deleteHabit(id);
    setHabits(prev => prev.filter(h => (h._id || h.id) !== id));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Goals & Habits</h1>
          <p>Set long-term executive milestones and build high-performance daily habits tracked in Firebase.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading goals and habits...</div>
      ) : (
        <>
          {/* Goals Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Target size={24} className="text-primary-color" />
                <span>Executive Goals</span>
              </div>
              <button className={styles.addBtn} onClick={() => setIsGoalModalOpen(true)}>
                <Plus size={16} /> New Goal
              </button>
            </div>

            {goals.length === 0 ? (
              <div className={styles.emptyState}>No executive goals set yet. Click &quot;New Goal&quot; to establish milestones.</div>
            ) : (
              <div className={styles.grid}>
                {goals.map(goal => (
                  <div key={goal._id || goal.id} className={styles.card}>
                    <div>
                      <div className={styles.cardHeader}>
                        <div>
                          <div className={styles.cardTitle}>{goal.title}</div>
                          <div className={styles.cardSub}>{goal.category} • Target: {goal.targetDate}</div>
                        </div>
                        <button className={styles.iconBtn} onClick={() => handleDeleteGoal(goal._id || goal.id)}><Trash2 size={16} /></button>
                      </div>

                      <div className={styles.progressContainer}>
                        <div className={styles.progressLabel}>
                          <span>Progress ({goal.currentValue} / {goal.targetValue})</span>
                          <span>{goal.progress || 0}%</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${goal.progress || 0}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button className={styles.actionBtn} onClick={() => handleUpdateGoalProgress(goal, 10)}>+10 Progress</button>
                      {goal.progress >= 100 && <span style={{ color: 'var(--accent-color)', fontWeight: 600, fontSize: '13px' }}>🎉 Completed!</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Habits Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Flame size={24} style={{ color: '#f59e0b' }} />
                <span>Daily Habits & Streaks</span>
              </div>
              <button className={styles.addBtn} onClick={() => setIsHabitModalOpen(true)}>
                <Plus size={16} /> New Habit
              </button>
            </div>

            {habits.length === 0 ? (
              <div className={styles.emptyState}>No habits tracked yet. Click &quot;New Habit&quot; to start tracking daily streaks.</div>
            ) : (
              <div className={styles.grid}>
                {habits.map(habit => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isCheckedToday = (habit.completedDates || []).includes(todayStr);

                  return (
                    <div key={habit._id || habit.id} className={styles.card}>
                      <div>
                        <div className={styles.cardHeader}>
                          <div>
                            <div className={styles.cardTitle}>{habit.title}</div>
                            <div className={styles.cardSub}>{habit.category} • {habit.frequency}</div>
                          </div>
                          <button className={styles.iconBtn} onClick={() => handleDeleteHabit(habit._id || habit.id)}><Trash2 size={16} /></button>
                        </div>

                        <div className={styles.streakBox}>
                          <Flame size={18} fill="#f59e0b" />
                          <span>{habit.streak || 0} Day Streak</span>
                        </div>
                      </div>

                      <div className={styles.cardActions}>
                        <button
                          className={styles.actionBtn}
                          style={{ background: isCheckedToday ? 'var(--accent-color)' : '', color: isCheckedToday ? '#fff' : '' }}
                          onClick={() => handleCheckinHabit(habit)}
                        >
                          <CheckCircle size={14} style={{ display: 'inline', marginRight: '6px' }} />
                          {isCheckedToday ? 'Checked in Today!' : 'Check in Today'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Goal Modal */}
      {isGoalModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsGoalModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Create Executive Goal</h2>
            <form onSubmit={handleCreateGoal}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Goal Title *</label>
                <input type="text" className={styles.input} value={goalTitle} onChange={e => setGoalTitle(e.target.value)} required placeholder="e.g. Ship Vibe2Ship Product" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <select className={styles.select} value={goalCategory} onChange={e => setGoalCategory(e.target.value)}>
                  <option value="Career">Career</option>
                  <option value="Product">Product</option>
                  <option value="Academic">Academic</option>
                  <option value="Financial">Financial</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Target Date</label>
                <input type="date" className={styles.input} value={goalTargetDate} onChange={e => setGoalTargetDate(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Target Units / Points</label>
                <input type="number" className={styles.input} value={goalTargetVal} onChange={e => setGoalTargetVal(e.target.value)} required min="1" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className={styles.actionBtn} onClick={() => setIsGoalModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.addBtn}>Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Habit Modal */}
      {isHabitModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsHabitModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Create Daily Habit</h2>
            <form onSubmit={handleCreateHabit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Habit Name *</label>
                <input type="text" className={styles.input} value={habitTitle} onChange={e => setHabitTitle(e.target.value)} required placeholder="e.g. 45m Uninterrupted Coding" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <select className={styles.select} value={habitCategory} onChange={e => setHabitCategory(e.target.value)}>
                  <option value="Focus">Focus</option>
                  <option value="Health">Health</option>
                  <option value="Learning">Learning</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className={styles.actionBtn} onClick={() => setIsHabitModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.addBtn}>Save Habit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
