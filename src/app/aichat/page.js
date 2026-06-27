'use client';

import { useState } from 'react';
import { Sparkles, Paperclip, Send, Mic, Menu } from 'lucide-react';
import ChatSidebar from '@/components/aichat/ChatSidebar';
import MessageCard from '@/components/aichat/MessageCard';
import styles from './page.module.css';

export default function AIChatPage() {
  const [conversations, setConversations] = useState([
    { id: 'c1', title: 'Why am I falling behind?', time: '2h ago' },
    { id: 'c2', title: 'Plan my week', time: '1d ago' },
    { id: 'c3', title: 'DSA recovery plan', time: '3d ago' }
  ]);
  const [activeId, setActiveId] = useState('c1');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [messages, setMessages] = useState([
    { id: 'm1', sender: 'user', text: 'Why am I falling behind on today\'s goals?' },
    {
      id: 'm2',
      sender: 'ai',
      text: 'You\'re 34% behind on today\'s schedule. Here\'s why and what I recommend:',
      embedType: 'progress_breakdown',
      actions: [
        { label: 'Accept Reschedule', primary: true },
        { label: 'View New Schedule', primary: false },
        { label: 'Tell me more', primary: false }
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const chips = [
    "📊 How am I doing today?",
    "📅 Plan my week",
    "⚠️ What do I risk missing?",
    "💡 What should I do now?"
  ];

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim() && !attachedFile) return;

    const userMsg = {
      id: `m_${Date.now()}`,
      sender: 'user',
      text: attachedFile ? `[Attached Timetable: ${attachedFile.name}] ${textToSend}` : textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachedFile(null);
    setThinking(true);

    setTimeout(() => {
      setThinking(false);
      let aiResp = {
        id: `m_ai_${Date.now()}`,
        sender: 'ai',
        text: 'I\'ve analyzed your updated query against your 14 pending tasks and peak productivity windows.'
      };

      if (textToSend.includes('risk') || textToSend.includes('missing')) {
        aiResp.embedType = 'warning';
      } else if (textToSend.includes('Plan') || textToSend.includes('week')) {
        aiResp.embedType = 'question';
      } else {
        aiResp.actions = [{ label: 'Apply AI Suggestions', primary: true }];
      }

      setMessages(prev => [...prev, aiResp]);
    }, 2000);
  };

  const handleNewChat = () => {
    const newId = `c_${Date.now()}`;
    setConversations(prev => [{ id: newId, title: 'New Conversation', time: 'Just now' }, ...prev]);
    setActiveId(newId);
    setMessages([]);
  };

  const handleDeleteChat = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) {
      setMessages([]);
    }
  };

  const handleSimulateAttach = () => {
    setAttachedFile({ name: 'college_timetable_semester_6.png' });
  };

  return (
    <div className={styles.container}>
      {/* Mobile Sidebar Toggle Header */}
      <div className={styles.mobileHeader}>
        <button onClick={() => setMobileSidebarOpen(true)} className={styles.mobileMenuBtn}>
          <Menu size={20} />
          <span>Conversations</span>
        </button>
      </div>

      {/* Left Sidebar */}
      <div className={`${styles.sidebarWrapper} ${mobileSidebarOpen ? styles.mobileOpen : ''}`}>
        {mobileSidebarOpen && (
          <div className={styles.mobileCloseBar}>
            <span>Past Chats</span>
            <button onClick={() => setMobileSidebarOpen(false)}>Close ✕</button>
          </div>
        )}
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setMobileSidebarOpen(false); }}
          onNewChat={() => { handleNewChat(); setMobileSidebarOpen(false); }}
          onDelete={handleDeleteChat}
        />
      </div>

      {/* Right Chat Area */}
      <div className={styles.chatArea}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.titleRow}>
            <div className={styles.readyDot} title="AI Ready" />
            <h2 className={styles.title}>AI Assistant</h2>
          </div>
          <div className={styles.contextPill}>
            Context: 14 tasks · 3 calendar events
          </div>
        </div>

        {/* Messages List Area */}
        <div className={styles.messagesList}>
          {messages.length === 0 ? (
            <div className={`${styles.onboardingState} fade-in`}>
              <div className={styles.sparklesIconWrapper}>
                <Sparkles size={48} className="text-primary-color" />
              </div>
              <h3>Your AI Executive Assistant</h3>
              <p>Ask me anything about your schedule, productivity, or upcoming deadlines. I know your tasks and calendar.</p>
              
              <div className={styles.onboardingChips}>
                {chips.map((c, i) => (
                  <button key={i} className={styles.chipBtn} onClick={() => handleSend(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageCard
                  key={msg.id}
                  message={msg}
                  onAction={(actLabel) => handleSend(`User clicked action: ${actLabel}`)}
                />
              ))}

              {thinking && (
                <div className={`${styles.thinkingRow} fade-in`}>
                  <div className={styles.dotsBox}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                  <span className={styles.thinkingText}>Analyzing your schedule and history...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Suggestion Chips (when messages exist) */}
        {messages.length > 0 && !thinking && (
          <div className={styles.chipsRow}>
            {chips.map((c, i) => (
              <button key={i} className={styles.chipBtn} onClick={() => handleSend(c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Sticky Input Area */}
        <div className={styles.inputArea}>
          {attachedFile && (
            <div className={styles.attachmentChip}>
              <span>📎 Attached: {attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)}>✕</button>
            </div>
          )}

          <div className={styles.inputRow}>
            <button
              className={styles.iconBtn}
              onClick={handleSimulateAttach}
              title="Attach timetable screenshot for Vision analysis"
            >
              <Paperclip size={18} />
            </button>

            <textarea
              className={styles.textarea}
              placeholder="Ask your AI assistant..."
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <button
              className={styles.iconBtn}
              onClick={() => alert('Voice listening mode activated...')}
              title="Voice Input"
            >
              <Mic size={18} />
            </button>

            <button
              className={styles.sendBtn}
              disabled={!input.trim() && !attachedFile}
              onClick={() => handleSend()}
            >
              <Send size={16} />
            </button>
          </div>

          <div className={styles.disclaimer}>
            AI has context of your tasks, schedule, and behavior
          </div>
        </div>
      </div>
    </div>
  );
}
