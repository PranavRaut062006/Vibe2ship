'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Circle, Clock, AlertTriangle, Calendar, Repeat, Tag, FileText, Bell } from 'lucide-react';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/lib/api';
import styles from './page.module.css';

export default function PlannerPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // All, Pending, Completed, Recurring
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('P2');
  const [deadline, setDeadline] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [reminder, setReminder] = useState('none');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState('none');
  const [customInterval, setCustomInterval] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTasks();
    const handleSync = () => loadTasks();
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

  async function loadTasks() {
    try {
      setLoading(true);
      const res = await fetchTasks();
      setTasks(res.tasks || []);
    } catch (err) {
      console.error("Failed to load planner tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title || '');
      setDescription(task.description || '');
      setCategory(task.category || 'Work');
      setPriority(task.priority || 'P2');
      setDeadline(task.deadline || task.scheduledDate || '');
      setScheduledTime(task.scheduledTime || '09:00');
      setEstimatedMinutes(task.estimatedMinutes || 60);
      setReminder(task.reminder || 'none');
      setNotes(task.notes || '');
      setRecurring(task.recurring || 'none');
      setCustomInterval(task.customInterval || 1);
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setCategory('Work');
      setPriority('P2');
      setDeadline(new Date().toISOString().split('T')[0]);
      setScheduledTime('09:00');
      setEstimatedMinutes(60);
      setReminder('none');
      setNotes('');
      setRecurring('none');
      setCustomInterval(1);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title, description, category, priority, deadline, scheduledDate: deadline, scheduledTime,
      estimatedMinutes: Number(estimatedMinutes), reminder, notes, recurring, customInterval: Number(customInterval)
    };

    try {
      if (editingTask) {
        await updateTask(editingTask._id || editingTask.id, payload);
      } else {
        await createTask(payload);
      }
      setIsModalOpen(false);
      await loadTasks();
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
    } catch (err) {
      console.error("Error saving task:", err);
      alert("Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask(task._id || task.id, { status: newStatus });
      setTasks(prev => prev.map(t => (t._id || t.id) === (task._id || task.id) ? { ...t, status: newStatus } : t));
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => (t._id || t.id) !== id));
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'Pending') return task.status !== 'completed';
    if (activeTab === 'Completed') return task.status === 'completed';
    if (activeTab === 'Recurring') return task.recurring && task.recurring !== 'none';
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Executive Planner</h1>
          <p>Manually organize, schedule, and track your tasks and recurring workflows with deterministic time conflict detection.</p>
        </div>
        <button className={styles.addBtn} onClick={() => openModal()}>
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>

      <div className={styles.tabs}>
        {['All', 'Pending', 'Completed', 'Recurring'].map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} {tab === 'Recurring' ? '🔄' : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className={styles.emptyState}>
          <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3>No tasks found</h3>
          <p>Click &quot;Add Task&quot; above to create your first planner item.</p>
        </div>
      ) : (
        <div className={styles.taskList}>
          {filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            const badgeClass = task.priority === 'P1' ? styles.badgeP1 : task.priority === 'P2' ? styles.badgeP2 : styles.badgeP3;

            return (
              <div key={task._id || task.id} className={styles.taskCard}>
                <div className={styles.taskLeft}>
                  <div className={styles.checkbox} onClick={() => handleToggleComplete(task)}>
                    {isCompleted ? <CheckCircle2 size={22} className={styles.checkboxCompleted} /> : <Circle size={22} />}
                  </div>
                  <div className={styles.taskInfo}>
                    <div className={`${styles.taskTitle} ${isCompleted ? styles.taskTitleCompleted : ''}`}>
                      <span>{task.title}</span>
                      <span className={`${styles.badge} ${badgeClass}`}>{task.priority || 'P2'}</span>
                      {task.recurring && task.recurring !== 'none' && (
                        <span className="ai-badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontSize: '11px' }}>
                          🔄 {task.recurring} {task.recurring === 'custom' ? `(Every ${task.customInterval} days)` : ''}
                        </span>
                      )}
                    </div>

                    {task.description && <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>{task.description}</p>}

                    <div className={styles.metaRow}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={14} /> {task.category || 'Work'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {task.deadline || task.scheduledDate || 'Today'}</span>
                      {task.scheduledTime && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {task.scheduledTime} ({task.estimatedMinutes || 60}m)</span>}
                      {task.reminder && task.reminder !== 'none' && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bell size={14} /> {task.reminder}</span>}
                    </div>

                    {task.notes && (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', marginTop: '6px' }}>
                        <FileText size={12} style={{ display: 'inline', marginRight: '6px' }} />
                        {task.notes}
                      </div>
                    )}

                    {task.conflictWarning && !isCompleted && (
                      <div className={styles.conflictBanner}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px' }}>
                          <AlertTriangle size={16} />
                          <span>Time Conflict Detected</span>
                        </div>
                        <div>{task.conflictWarning}</div>
                        {task.suggestedSlots && task.suggestedSlots.length > 0 && (
                          <div style={{ marginTop: '6px', fontSize: '12px' }}>
                            💡 Suggested Alternative Slots: <strong>{task.suggestedSlots.join(', ')}</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.taskActions}>
                  <button className={styles.iconBtn} onClick={() => openModal(task)} title="Edit Task"><Edit2 size={16} /></button>
                  <button className={styles.iconBtn} onClick={() => handleDelete(task._id || task.id)} title="Delete Task"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button className={styles.iconBtn} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className={styles.formGrid}>
                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Task Title *</label>
                  <input type="text" className={styles.input} value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Prepare Board Deck" />
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Description</label>
                  <input type="text" className={styles.input} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short summary of goals" />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
                  <select className={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Work">Work</option>
                    <option value="Meetings">Meetings</option>
                    <option value="Academic">Academic</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Priority</label>
                  <select className={styles.select} value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="P1">P1 — Urgent & Critical</option>
                    <option value="P2">P2 — Important</option>
                    <option value="P3">P3 — Low Priority</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Scheduled Date / Deadline</label>
                  <input type="date" className={styles.input} value={deadline} onChange={e => setDeadline(e.target.value)} required />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Scheduled Start Time</label>
                  <input type="time" className={styles.input} value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} required />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Estimated Duration (Minutes)</label>
                  <input type="number" className={styles.input} value={estimatedMinutes} onChange={e => setEstimatedMinutes(e.target.value)} min="5" step="5" required />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Reminder</label>
                  <select className={styles.select} value={reminder} onChange={e => setReminder(e.target.value)}>
                    <option value="none">None</option>
                    <option value="5m">5 mins before</option>
                    <option value="15m">15 mins before</option>
                    <option value="1h">1 hour before</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Recurring Schedule</label>
                  <select className={styles.select} value={recurring} onChange={e => setRecurring(e.target.value)}>
                    <option value="none">None (One-time)</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom Interval</option>
                  </select>
                </div>

                {recurring === 'custom' && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Repeat Every (Days)</label>
                    <input type="number" className={styles.input} value={customInterval} onChange={e => setCustomInterval(e.target.value)} min="1" required />
                  </div>
                )}

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Notes & Reference Links</label>
                  <textarea className={styles.textarea} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add specific notes, agendas, or document links..." />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.addBtn} disabled={saving}>{saving ? 'Saving...' : 'Save Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
