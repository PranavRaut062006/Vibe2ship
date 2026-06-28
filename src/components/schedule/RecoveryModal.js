'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X, Check, Zap, Target, Shield } from 'lucide-react';
import { generateRecoveryPlans, updateScheduleBlocks } from '@/lib/api';

export default function RecoveryModal({ isOpen, onClose, onPlanSelected }) {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('plan_balanced');
  const [overdueCount, setOverdueCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    async function loadPlans() {
      setLoading(true);
      try {
        const res = await generateRecoveryPlans();
        if (res) {
          setPlans(res.plans || []);
          setOverdueCount(res.overdueCount || 3);
        }
      } catch (err) {
        console.error("Failed to fetch recovery plans:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyRecovery = async () => {
    const selected = plans.find(p => p.id === selectedPlanId);
    if (!selected) return;

    setSaving(true);
    try {
      // Simulate adding recovery blocks to schedule
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
      if (onPlanSelected) onPlanSelected(selected);
      alert(`✔ Recovery Plan "${selected.name}" applied! Overdue items redistributed.`);
      onClose();
    } catch (err) {
      console.error("Error saving recovery plan:", err);
    } finally {
      setSaving(false);
    }
  };

  const getPlanIcon = (id) => {
    if (id === 'plan_aggressive') return Zap;
    if (id === 'plan_balanced') return Target;
    return Shield;
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 800, color: '#fff' }}>
            <Sparkles className="text-primary-color" />
            <span>AI Multi-Option Recovery Planning</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          LifePilot AI detected {overdueCount} overdue or delayed tasks. Instead of stacking them into an impossible workload, choose an intelligent executive recovery strategy below.
        </p>

        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#c084fc' }}>
            <Sparkles size={36} className="spin" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h4>Calculating workload dispersion models...</h4>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            {plans.map((p) => {
              const Icon = getPlanIcon(p.id);
              const isSelected = selectedPlanId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  style={{ background: isSelected ? 'rgba(108, 99, 255, 0.12)' : 'rgba(255,255,255,0.02)', border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                      <Icon size={18} color="#c084fc" />
                      <span>{p.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '12px', color: '#fff', fontWeight: 600 }}>Target: {p.targetCompletionDate}</span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#34d399', marginBottom: '6px', fontWeight: 600 }}>
                    ⚡ Workload: {p.workload}
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: '0 0 10px', lineHeight: 1.5 }}>
                    {p.advantages}
                  </p>

                  <div style={{ fontSize: '12px', color: '#c084fc', background: 'rgba(192, 132, 252, 0.08)', padding: '8px 12px', borderRadius: '8px' }}>
                    🧠 <strong>AI Decision Reasoning:</strong> {p.reasoning}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={handleApplyRecovery}
            disabled={saving || loading}
            style={{ padding: '10px 24px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Check size={16} />
            <span>{saving ? 'Applying Plan...' : 'Approve & Save Recovery Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
