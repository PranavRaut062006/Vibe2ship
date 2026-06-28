'use client';

import { useState } from 'react';
import { Sparkles, X, Send } from 'lucide-react';
import styles from './AIChatPanel.module.css';

export default function AIChatPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Good afternoon! I've analyzed your schedule. You have **3 high-priority tasks** due today and a meeting at 4 PM. Want me to replan your afternoon for maximum flow?",
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), sender: 'user', text: input, time: 'Just now' };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "I've updated your priority queue. Moved 'Sprint Demo Slides' to tomorrow morning when your energy levels are historically higher.",
          time: 'Just now'
        }
      ]);
    }, 1000);
  };

  const handleSuggestion = (text) => {
    setInput(text);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.panel} slide-in-right glass`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.thinkingDot} />
            <h3>FocusFlow AI</h3>
            <span className="ai-badge">AI</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close AI Chat">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.sender === 'ai' ? styles.aiMessage : styles.userMessage} fade-in`}
            >
              {msg.sender === 'ai' && (
                <div className={styles.aiAvatar}>
                  <Sparkles size={16} />
                </div>
              )}
              <div className={`${styles.bubble} ${msg.sender === 'ai' ? 'ai-glow' : ''}`}>
                <p>{msg.text}</p>
                <span className={styles.time}>{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className={styles.inputArea}>
          <div className={styles.suggestions}>
            <button className={styles.chip} onClick={() => handleSuggestion('Replan my day')}>Replan my day</button>
            <button className={styles.chip} onClick={() => handleSuggestion("What's most urgent?")}>What&apos;s most urgent?</button>
            <button className={styles.chip} onClick={() => handleSuggestion('Summarize progress')}>Summarize progress</button>
          </div>

          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.input}
              placeholder="Ask AI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className={styles.sendBtn} onClick={handleSend} aria-label="Send">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
