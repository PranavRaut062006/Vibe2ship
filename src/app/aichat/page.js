'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Paperclip, Send, Mic, Menu } from 'lucide-react';
import ChatSidebar from '@/components/aichat/ChatSidebar';
import MessageCard from '@/components/aichat/MessageCard';
import { fetchChatHistory, sendChatMessage, fetchTasks } from '@/lib/api';
import styles from './page.module.css';

export default function AIChatPage() {
  const [conversations, setConversations] = useState([
    { id: 'c1', title: 'New Executive Chat', time: 'Just now' }
  ]);
  const [activeId, setActiveId] = useState('c1');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [taskCount, setTaskCount] = useState(0);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        const tRes = await fetchTasks();
        if (tRes.tasks) setTaskCount(tRes.tasks.length);

        const cRes = await fetchChatHistory();
        if (cRes.messages && cRes.messages.length > 0) {
          const formatted = cRes.messages.map(m => ({
            id: m._id || m.id,
            sender: m.role === 'user' ? 'user' : 'ai',
            text: m.content,
            embedType: m.embedType || null,
            actions: m.actions || []
          }));
          setMessages(formatted);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    }
    loadInitial();
  }, []);

  const chips = [
    "📊 How am I doing today?",
    "📅 Plan my week",
    "⚠️ What do I risk missing?",
    "💡 What should I do now?"
  ];

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim() && !attachedFile || thinking) return;

    const fullText = attachedFile ? `[Attached Timetable: ${attachedFile.name}] ${textToSend}` : textToSend;
    const userMsg = {
      id: `m_user_${Date.now()}`,
      sender: 'user',
      text: fullText
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachedFile(null);
    setThinking(true);

    try {
      const res = await sendChatMessage(fullText);
      const aiMsg = {
        id: res.assistantMessage?._id || `m_ai_${Date.now()}`,
        sender: 'ai',
        text: res.assistantMessage?.content || "I have analyzed your executive schedule.",
        embedType: res.assistantMessage?.embedType || null,
        actions: res.assistantMessage?.actions || []
      };
      setMessages(prev => [...prev, aiMsg]);
      window.dispatchEvent(new CustomEvent('taskCreated'));
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        id: `m_err_${Date.now()}`,
        sender: 'ai',
        text: "⚠️ Backend API error or rate limit exceeded while contacting Gemini. Please verify Express server is running."
      }]);
    } finally {
      setThinking(false);
    }
  };

  const handleNewChat = () => {
    const newId = `c_${Date.now()}`;
    setConversations(prev => [{ id: newId, title: 'New Executive Chat', time: 'Just now' }, ...prev]);
    setActiveId(newId);
    setMessages([{
      id: `m_start_${Date.now()}`,
      sender: 'ai',
      text: "Starting new executive consulting session. What would you like to focus on?"
    }]);
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
            <h2 className={styles.title}>LifePilot AI Advisor</h2>
          </div>
          <div className={styles.contextPill}>
            Context: {taskCount} tasks · Live Gemini 3.1 Pro
          </div>
        </div>

        {/* Messages List Area */}
        <div className={styles.messagesList}>
          {messages.length === 0 ? (
            <div className={`${styles.onboardingState} fade-in`}>
              <div className={styles.sparklesIconWrapper}>
                <Sparkles size={48} className="text-primary-color" />
              </div>
              <h3>Your AI Executive Advisor</h3>
              <p>Ask me anything about your productivity. Tell me what tasks you need to get done, and I will add them to your schedule.</p>
              
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
                  onAction={(actLabel) => handleSend(`Execute action: ${actLabel}`)}
                />
              ))}

              {thinking && (
                <div className={`${styles.thinkingRow} fade-in`}>
                  <div className={styles.dotsBox}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                  <span className={styles.thinkingText}>LifePilot AI analyzing your schedule and history...</span>
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
              placeholder="Ask your AI advisor..."
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
              disabled={(!input.trim() && !attachedFile) || thinking}
              onClick={() => handleSend()}
            >
              <Send size={16} />
            </button>
          </div>

          <div className={styles.disclaimer}>
            LifePilot AI has context of your tasks, schedule, and behavior
          </div>
        </div>
      </div>
    </div>
  );
}
