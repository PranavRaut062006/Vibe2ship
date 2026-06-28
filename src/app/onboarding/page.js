'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, GraduationCap, Rocket, Laptop, Briefcase, Calendar, Mail, Upload, CheckCircle, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import styles from './page.module.css';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('Student');
  const [gcalConnected, setGcalConnected] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Scan state for Step 4
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('Extracting recurring classes & deadlines...');

  useEffect(() => {
    if (step === 4) {
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(5), 600);
            return 100;
          }
          const next = prev + 15;
          if (next === 30) setScanStatus('Identifying assignment patterns & syllabus...');
          if (next === 60) setScanStatus('Building behavioral focus profile...');
          if (next >= 90) setScanStatus('Executive Intelligence Engine Ready!');
          return next;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [step]);

  const roles = [
    { id: 'Student', icon: GraduationCap, title: 'Student', desc: 'Exams, assignments, and lectures organized automatically.' },
    { id: 'Entrepreneur', icon: Rocket, title: 'Entrepreneur', desc: 'Investor pitches, product roadmaps, and team syncs prioritized.' },
    { id: 'Freelancer', icon: Laptop, title: 'Freelancer', desc: 'Client deliverables, time tracking, and invoices managed.' },
    { id: 'Professional', icon: Briefcase, title: 'Professional', desc: 'Deep focus protection, 1:1 meetings, and OKRs aligned.' }
  ];

  const handleSimulateUpload = () => {
    setUploadedFile({ name: 'Semester_6_Timetable_Final.png', size: '2.4 MB' });
  };

  return (
    <div className={styles.container}>
      {/* Top Progress Bar */}
      <div className={styles.topBar}>
        <div className={styles.logo}>
          <Zap size={20} className="text-primary-color" />
          <span>FocusFlow<strong>AI</strong></span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${(step / 5) * 100}%` }} />
        </div>
        <span className={styles.stepIndicator}>Step {step} of 5</span>
      </div>

      <div className={styles.contentArea}>
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className={`${styles.stepBox} scale-in`}>
            <div className={styles.heroIconBox}>
              <Sparkles size={48} className="text-primary-color" />
            </div>
            <h1 className={styles.headingXL}>Meet FocusFlow AI</h1>
            <p className={styles.subtext}>
              Not a to-do app. An autonomous executive intelligence companion that discovers work, learns your habits, predicts risks, and replans automatically.
            </p>
            <div className={styles.featurePills}>
              <span>⚡ Autonomous Task Extraction</span>
              <span>🧠 Behavioral Memory</span>
              <span>🛡️ Burnout Prevention</span>
            </div>
            <button className={styles.primaryCTA} onClick={() => setStep(2)}>
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Role Selection */}
        {step === 2 && (
          <div className={`${styles.stepBox} slide-in`}>
            <h2 className={styles.headingL}>Select Your Executive Role</h2>
            <p className={styles.subtext}>We tailor AI reasoning, scheduling heuristics, and prompt personas to your workflow.</p>
            
            <div className={styles.rolesGrid}>
              {roles.map((r) => {
                const IconComp = r.icon;
                const active = role === r.id;
                return (
                  <div
                    key={r.id}
                    className={`${styles.roleCard} ${active ? styles.roleActive : ''}`}
                    onClick={() => setRole(r.id)}
                  >
                    <IconComp size={32} className={active ? 'text-primary-color' : 'text-muted'} />
                    <h3 className={styles.roleTitle}>{r.title}</h3>
                    <p className={styles.roleDesc}>{r.desc}</p>
                    {active && <div className={styles.roleCheck}><CheckCircle size={16} /></div>}
                  </div>
                );
              })}
            </div>

            <div className={styles.footerBtns}>
              <button className={styles.backBtn} onClick={() => setStep(1)}>Back</button>
              <button className={styles.primaryCTA} onClick={() => setStep(3)}>
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Connect Intelligence */}
        {step === 3 && (
          <div className={`${styles.stepBox} slide-in`}>
            <h2 className={styles.headingL}>Connect Your Intelligence Sources</h2>
            <p className={styles.subtext}>Allow AI to scan deadlines, classes, and meetings securely in the background.</p>

            <div className={styles.connectList}>
              {/* Google Calendar */}
              <div className={styles.connectRow}>
                <div className={styles.connectLeft}>
                  <Calendar size={24} className="text-primary-color" />
                  <div>
                    <h4>Google Calendar</h4>
                    <p>Sync meetings, lectures, and exams</p>
                  </div>
                </div>
                <button
                  className={gcalConnected ? styles.connectedBtn : styles.connectBtn}
                  onClick={() => setGcalConnected(!gcalConnected)}
                >
                  {gcalConnected ? '✓ Connected' : 'Connect'}
                </button>
              </div>

              {/* Gmail */}
              <div className={styles.connectRow}>
                <div className={styles.connectLeft}>
                  <Mail size={24} className="text-accent" />
                  <div>
                    <h4>Gmail Inbox</h4>
                    <p>Extract tasks from project threads & syllabi</p>
                  </div>
                </div>
                <button
                  className={gmailConnected ? styles.connectedBtn : styles.connectBtn}
                  onClick={() => setGmailConnected(!gmailConnected)}
                >
                  {gmailConnected ? '✓ Connected' : 'Connect'}
                </button>
              </div>

              {/* Timetable Dropzone */}
              <div className={styles.dropzone} onClick={handleSimulateUpload}>
                {uploadedFile ? (
                  <div className={styles.uploadedState}>
                    <CheckCircle size={32} className="text-accent" />
                    <div>
                      <strong>{uploadedFile.name}</strong>
                      <p>{uploadedFile.size} · Timetable ready for Gemini Vision scan</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="text-primary-color" />
                    <h4>Upload Course Timetable (PNG / PDF)</h4>
                    <p>Click to attach your semester schedule for instant AI mapping</p>
                  </>
                )}
              </div>
            </div>

            <div className={styles.footerBtns}>
              <button className={styles.backBtn} onClick={() => setStep(2)}>Back</button>
              <button className={styles.primaryCTA} onClick={() => setStep(4)}>
                <span>Start AI Scan</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: AI Learning Scan */}
        {step === 4 && (
          <div className={`${styles.stepBox} fade-in`}>
            <div className={styles.scanScannerBox}>
              <div className={styles.scanLaser} />
              <Zap size={56} className="text-primary-color" />
            </div>

            <h2 className={styles.headingL}>Analyzing Executive Intelligence...</h2>
            <p className={styles.scanStatus}>{scanStatus}</p>

            <div className={styles.scanBarTrack}>
              <div className={styles.scanBarFill} style={{ width: `${scanProgress}%` }} />
            </div>
            <span className={styles.scanPercentage}>{scanProgress}% Complete</span>
          </div>
        )}

        {/* Step 5: Ready */}
        {step === 5 && (
          <div className={`${styles.stepBox} scale-in`}>
            <div className={styles.successIconBox}>
              <ShieldCheck size={56} className="text-accent" />
            </div>
            <h1 className={styles.headingXL}>Your Executive Assistant is Ready</h1>
            <p className={styles.subtext}>
              We&apos;ve configured FocusFlow AI for your <strong>{role}</strong> workflow.
            </p>

            <div className={styles.summaryCard}>
              <h4>AI Knowledge Summary</h4>
              <ul>
                <li>📧 Extracted <strong>14 actionable tasks</strong> from Gmail & syllabi</li>
                <li>📅 Mapped <strong>3 recurring lectures & meetings</strong></li>
                <li>⚡ Identified peak biological focus window: <strong>9 AM – 11 AM</strong></li>
                <li>🛡️ Protected <strong>2 hours of uninterrupted focus</strong> daily</li>
              </ul>
            </div>

            <button className={styles.giantLaunchBtn} onClick={() => router.push('/')}>
              <span>Enter Command Center</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
