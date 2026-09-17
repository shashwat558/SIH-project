import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Layers,
  Activity,
  ArrowUpRight,
  TrendingDown,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { getPilots, toggleMilestone } from '../../services/pilotService';

export default function GovPilots() {
  const [pilots, setPilots] = useState([]);
  const [selectedPilot, setSelectedPilot] = useState(null);

  useEffect(() => {
    const data = getPilots();
    setPilots(data);
    if (data.length > 0) {
      setSelectedPilot(data[0]);
    }
  }, []);

  const handleToggleMilestone = (milestoneId) => {
    if (!selectedPilot) return;
    const updated = toggleMilestone(selectedPilot.id, milestoneId);
    setPilots(updated);
    const refreshed = updated.find((p) => p.id === selectedPilot.id);
    setSelectedPilot(refreshed);
  };

  if (!selectedPilot) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
        Loading Pilot Deployments...
      </div>
    );
  }

  const budgetUsage = Math.round((selectedPilot.budgetSpent / selectedPilot.budgetAllocated) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Topbar Header */}
      <header className="topbar">
        <div>
          <h1>Pilot Projects & KPI Monitoring</h1>
          <p>
            Member 5 • Real-world implementation health, milestone verification, and telemetry.
          </p>
        </div>

        {/* Pilot Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>
            Active Pilot:
          </span>
          <select
            value={selectedPilot.id}
            onChange={(e) => {
              const p = pilots.find((item) => item.id === e.target.value);
              if (p) setSelectedPilot(p);
            }}
            style={{
              padding: '0.5rem 0.85rem',
              backgroundColor: '#1e222d',
              color: '#fff',
              border: '1px solid #333a4d',
              borderRadius: '8px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            {pilots.map((p) => (
              <option key={p.id} value={p.id}>
                {p.startupName} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Stats Row */}
      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={22} />
          </div>
          <div>
            <p>Overall Deployment</p>
            <h2>{selectedPilot.overallProgress}%</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={22} />
          </div>
          <div>
            <p>Pilot Phase Status</p>
            <h2 style={{ color: selectedPilot.health === 'On Track' ? '#10b981' : '#f59e0b', fontSize: '1.25rem' }}>
              {selectedPilot.health}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Layers size={22} />
          </div>
          <div>
            <p>Milestones Verified</p>
            <h2>
              {selectedPilot.milestones.filter((m) => m.completed).length} / {selectedPilot.milestones.length}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={22} />
          </div>
          <div>
            <p>Budget Utilized</p>
            <h2>{budgetUsage}%</h2>
          </div>
        </div>
      </section>

      {/* Pilot Overview Banner */}
      <div 
        style={{
          backgroundColor: '#151821',
          border: '1px solid #272c3d',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              {selectedPilot.startupName}
            </h2>
            <span
              style={{
                backgroundColor: selectedPilot.health === 'On Track' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: selectedPilot.health === 'On Track' ? '#34d399' : '#fbbf24',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              {selectedPilot.solutionTitle}
            </span>
          </div>
          <p style={{ margin: '0.4rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Linked Challenge: <strong style={{ color: '#cbd5e1' }}>{selectedPilot.challengeTitle}</strong> • {selectedPilot.department}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Timeline Window</span>
            <div style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600 }}>
              {selectedPilot.startDate} → {selectedPilot.endDate}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Funding Released</span>
            <div style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600 }}>
              ₹{selectedPilot.budgetSpent.toLocaleString()} / ₹{selectedPilot.budgetAllocated.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Chart & Milestone Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Side: Interactive Recharts Graph & KPI Cards */}
        <div 
          style={{
            gridColumn: 'span 2',
            backgroundColor: '#151821',
            border: '1px solid #272c3d',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="#3b82f6" />
                Live Telemetry: Target vs Actual Efficiency Trend
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                Weekly performance benchmarks monitored via sensor telemetry
              </p>
            </div>
          </div>

          {/* Chart Container */}
          <div style={{ height: '260px', width: '100%', marginTop: '0.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedPilot.metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232838" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                <YAxis unit="%" stroke="#64748b" fontSize={12} domain={[40, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e222d', borderColor: '#333a4d', borderRadius: '8px', color: '#fff' }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line 
                  type="monotone" 
                  dataKey="targetEff" 
                  name="Target Efficiency" 
                  stroke="#64748b" 
                  strokeDasharray="4 4" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="actualEff" 
                  name="Live Efficiency" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Specific KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            {selectedPilot.kpis.map((kpi, idx) => (
              <div 
                key={idx}
                style={{
                  backgroundColor: '#1b202c',
                  border: '1px solid #2a3144',
                  borderRadius: '10px',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{kpi.name}</span>
                  <span 
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontWeight: 700,
                      backgroundColor: kpi.status === 'Good' || kpi.status === 'Optimal' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                      color: kpi.status === 'Good' || kpi.status === 'Optimal' ? '#34d399' : '#f87171'
                    }}
                  >
                    {kpi.status}
                  </span>
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                    {kpi.current}{kpi.unit}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    / goal {kpi.target}{kpi.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Interactive Milestones Checklist */}
        <div 
          style={{
            backgroundColor: '#151821',
            border: '1px solid #272c3d',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="#eab308" />
                Delivery Milestones
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sign-off
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
              Verify field deliveries by checking completed milestones:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedPilot.milestones.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleToggleMilestone(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: m.completed ? '1px solid #065f46' : '1px solid #282f42',
                    backgroundColor: m.completed ? 'rgba(6,95,70,0.2)' : '#1b202c',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={m.completed}
                    onChange={() => {}}
                    style={{ marginTop: '0.2rem', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p 
                      style={{ 
                        margin: 0, 
                        fontSize: '0.8rem', 
                        fontWeight: 600, 
                        color: m.completed ? '#6ee7b7' : '#e2e8f0',
                        textDecoration: m.completed ? 'line-through' : 'none'
                      }}
                    >
                      {m.title}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> Due: {m.dueDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #272c3d' }}>
            <button
              onClick={() => alert(`Official verification certificate generated for ${selectedPilot.startupName}!`)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#eab308',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Export Pilot Progress Certificate
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}