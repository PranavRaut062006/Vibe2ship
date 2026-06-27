'use client';

import { Check, X } from 'lucide-react';
import styles from './BatchActionBar.module.css';

export default function BatchActionBar({ count, selectedCount, allSelected, onToggleSelectAll, onApproveSelected, onIgnoreSelected }) {
  return (
    <div className={`${styles.bar} scale-in`}>
      <div className={styles.left}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={allSelected}
          onChange={onToggleSelectAll}
        />
        <span className={styles.text}>
          {allSelected ? 'Deselect All' : 'Select All'} · <strong>{selectedCount || count} tasks</strong>
        </span>
      </div>

      <div className={styles.actions}>
        <button className={styles.approveBtn} onClick={onApproveSelected}>
          <Check size={16} />
          <span>Approve Selected</span>
        </button>
        <button className={styles.ignoreBtn} onClick={onIgnoreSelected}>
          <X size={16} />
          <span>Ignore Selected</span>
        </button>
      </div>
    </div>
  );
}
