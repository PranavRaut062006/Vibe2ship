'use client';

import { Plus, Trash2, MessageSquare } from 'lucide-react';
import styles from './ChatSidebar.module.css';

export default function ChatSidebar({ conversations, activeId, onSelect, onNewChat, onDelete }) {
  const grouped = {
    Today: conversations.filter(c => c.time.includes('h ago') || c.time.includes('m ago')),
    Yesterday: conversations.filter(c => c.time.includes('1d ago')),
    Earlier: conversations.filter(c => !c.time.includes('h ago') && !c.time.includes('m ago') && !c.time.includes('1d ago'))
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h3 className={styles.title}>Conversations</h3>
        <button className={styles.newBtn} onClick={onNewChat} title="Start new chat">
          <Plus size={16} />
          <span>New</span>
        </button>
      </div>

      <div className={styles.list}>
        {Object.entries(grouped).map(([groupName, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={groupName} className={styles.group}>
              <div className={styles.groupHeader}>{groupName}</div>
              {items.map(c => (
                <div
                  key={c.id}
                  className={`${styles.item} ${activeId === c.id ? styles.itemActive : ''}`}
                  onClick={() => onSelect(c.id)}
                >
                  <MessageSquare size={14} className="text-muted" />
                  <div className={styles.itemContent}>
                    <span className={styles.itemTitle}>{c.title}</span>
                    <span className={styles.itemTime}>{c.time}</span>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(c.id);
                    }}
                    title="Delete conversation"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
