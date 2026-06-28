'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Paperclip, Send, Mic, MicOff, Menu, Image as ImageIcon } from 'lucide-react';
import ChatSidebar from '@/components/aichat/ChatSidebar';
import MessageCard from '@/components/aichat/MessageCard';
import { fetchChatHistory, sendChatMessage, fetchTasks } from '@/lib/api';
import styles from './page.module.css';

export default function AIChatPage() {
  const [conversations, setConversations] = useState([
    { id: 'c1', title: 'Executive Session', time: 'Active' }
  ]);
  const [activeId, setActiveId] = useState('c1');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [taskCount, setTaskCount] = useState(0);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

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
            proposedTasks: m.proposedTasks || [],
            proposedScheduleBlocks: m.proposedScheduleBlocks || [],
            approved: m.approved || false,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const chips = [
    "📅 Plan my week based on deadlines",
    "Every Sunday I have Leetcode Contest from 8-10am",
    "I have an interview next Monday at 2pm",
    "I can't follow today's schedule, rearrange my afternoon"
  ];

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim() && !attachedFile || thinking) return;

    const fullText = attachedFile ? `[Attached Timetable Image: ${attachedFile.name}] ${textToSend || 'Please extract timetable and schedule.'}` : textToSend;
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
        proposedTasks: res.assistantMessage?.proposedTasks || [],
        proposedScheduleBlocks: res.assistantMessage?.proposedScheduleBlocks || [],
        approved: res.assistantMessage?.approved || false,
        actions: res.assistantMessage?.actions || []
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        id: `m_err_${Date.now()}`,
        sender: 'ai',
        text: "⚠️ Backend API error or quota exceeded while contacting Gemini. Please try again or verify settings."
      }]);
    } finally {
      setThinking(false);
    }
  };

  const handleNewChat = () => {
    const newId = `c_${Date.now()}`;
    setConversations(prev => [{ id: newId, title: 'New Executive Session', time: 'Just now' }, ...prev]);
    setActiveId(newId);
    setMessages([{
      id: `m_start_${Date.now()}`,
      sender: 'ai',
      text: "Starting new executive consulting session. How can I optimize your time today?"
    }]);
  };

  const handleDeleteChat = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) {
      setMessages([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className={styles.container}>
      <div className={styles.mobileHeader}>
        <button onClick={() => setMobileSidebarOpen(true)} className={styles.mobileMenuBtn}>
          <Menu size={20} />
          <span>Conversations</span>
        </button>
      </div>

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

      <div className={styles.chatArea}>
        <div className={styles.topBar}>
          <div className={styles.titleRow}>
            <div className={styles.readyDot} title="AI Ready" />
            <h2 className={styles.title}>LifePilot AI Intelligence Hub</h2>
          </div>
          <div className={styles.contextPill}>
            Context: {taskCount} tasks • Gemini 3.1 Pro (JSON Pipeline)
          </div>
        </div>

        <div className={styles.messagesList}>
          {messages.length === 0 ? (
            <div className={`${styles.onboardingState} fade-in`}>
              <div className={styles.sparklesIconWrapper}>
                <Sparkles size={48} className="text-primary-color" />
              </div>
              <h3>Your Autonomous Executive Companion</h3>
              <p>Natural language scheduling, timetable image OCR, and voice commands powered by strict human-in-the-loop approval.</p>
              
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
                  onAction={(actLabel) => handleSend(actLabel)}
                />
              ))}

              {thinking && (
                <div className={`${styles.thinkingRow} fade-in`}>
                  <div className={styles.dotsBox}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                  <span className={styles.thinkingText}>LifePilot AI processing natural language and constructing validated JSON proposals...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {messages.length > 0 && !thinking && (
          <div className={styles.chipsRow}>
            {chips.map((c, i) => (
              <button key={i} className={styles.chipBtn} onClick={() => handleSend(c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        <div className={styles.inputArea}>
          {attachedFile && (
            <div className={styles.attachmentChip}>
              <ImageIcon size={14} style={{ marginRight: '6px' }} />
              <span>Attached: {attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)}>✕</button>
            </div>
          )}

          <div className={styles.inputRow}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />
            <button
              className={styles.iconBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Attach Timetable Screenshot (OCR & Schedule Extraction)"
            >
              <Paperclip size={18} />
            </button>

            <textarea
              className={styles.textarea}
              placeholder={isListening ? "Listening... speak now" : "Plan my week, describe timetable, or ask advice..."}
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
              className={`${styles.iconBtn} ${isListening ? 'text-accent' : ''}`}
              style={{ background: isListening ? 'rgba(16, 185, 129, 0.2)' : '' }}
              onClick={toggleVoiceInput}
              title="Voice Input (Speech Recognition)"
            >
              {isListening ? <MicOff size={18} color="#10b981" /> : <Mic size={18} />}
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
            All AI-generated proposals require explicit user approval before writing to Firebase Firestore.
          </div>
        </div>
      </div>
    </div>
  );
}
