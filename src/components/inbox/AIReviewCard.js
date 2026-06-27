'use client';

import { useState } from 'react';
import { Check, Edit3, X, ChevronDown, ChevronUp, Mail, Sparkles } from 'lucide-react';
import styles from './AIReviewCard.module.css';

export default function AIReviewCard({ task, selected, onSelect, onApprove, onIgnore, onSaveEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  // Edit form state
  const [name, setName] = useState(task.title);
  const [deadline, setDeadline] = useState(task.deadline);
  const [estimate, setEstimate] = useState(task.effort);
  const [priority, setPriority] = useState(task.priority);

  const handleSave = () => {
    onSaveEdit(task.id, { title: name, deadline, effort: estimate, priority });
    setEditing(false);
  };

  return (
    <div className={`${styles.card} ${selected ? styles.cardSelected : ''} ai-glow-hover fade-in`}>
      {/* Selection checkbox + Header */}
      <div className={styles.topRow}>
        <div className={styles.topLeft}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={selected || false}
            onChange={() => onSelect(task.id)}
          />
          <span className={`${styles.pBadge} ${styles[priority.toLowerCase()]}`}>
            {priority}
          </span>
          <h4 className={styles.title}>{task.title}</h4>
        </div>
        <div className={styles.confidenceChip}>
          <span>AI Confidence: {task.confidence}</span>
        </div>
      </div>

      {/* Second row: Chips */}
      <div className={styles.chipsRow}>
        <span className={styles.chip}>📅 {task.deadline}</span>
        <span className={styles.chip}>⏱ {task.effort}</span>
        <span className={styles.chip}>📂 {task.category}</span>
      </div>

      {/* Expandable Source Section */}
      <div className={styles.sourceSection}>
        <div className={styles.sourceTrigger} onClick={() => setExpanded(!expanded)}>
          <Mail size={14} className="text-muted" />
          <span className={styles.sourceSender}>{task.sender}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {expanded && (
          <div className={`${styles.sourceDetails} fade-in`}>
            <div className={styles.snippet}>
              &quot;{task.snippet}&quot;
            </div>
            <div className={styles.reasoning}>
              <Sparkles size={12} />
              <span>AI extracted this because: {task.reasoning}</span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Inline Form */}
      {editing ? (
        <div className={`${styles.editForm} fade-in`}>
          <div className={styles.formGroup}>
            <label>Task Name</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Deadline</label>
              <input
                type="text"
                className={styles.input}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Estimate</label>
              <select
                className={styles.select}
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
              >
                <option value="30 mins">30 mins</option>
                <option value="1 hr">1 hr</option>
                <option value="2 hrs">2 hrs</option>
                <option value="3 hrs">3 hrs</option>
                <option value="4+ hrs">4+ hrs</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Priority</label>
              <select
                className={styles.select}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="P1">P1 (Urgent)</option>
                <option value="P2">P2 (High)</option>
                <option value="P3">P3 (Normal)</option>
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      ) : (
        /* Action Row */
        <div className={styles.actionRow}>
          <button className={styles.addBtn} onClick={() => onApprove(task.id)}>
            <Check size={16} />
            <span>Add Task</span>
          </button>
          <button className={styles.editBtn} onClick={() => setEditing(true)}>
            <Edit3 size={16} />
            <span>Edit</span>
          </button>
          <button className={styles.ignoreBtn} onClick={() => onIgnore(task.id)}>
            <X size={16} />
            <span>Ignore</span>
          </button>
        </div>
      )}
    </div>
  );
}
