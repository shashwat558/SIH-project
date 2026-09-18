import React, { useState, useEffect } from 'react';

import { QRCodeSVG } from "qrcode.react";

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

import {
  getPilots,
  toggleMilestone,
  disburseMilestonePayment,
  generatePilotCertificate
} from '../../services/pilotService';


export default function GovPilots() {
  const [pilots, setPilots] = useState([]);
  const [selectedPilot, setSelectedPilot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMilestone, setPaymentMilestone] = useState(null);
const [paymentMethod, setPaymentMethod] = useState('PFMS');
const [paymentRemarks, setPaymentRemarks] = useState('');
const [certificateData, setCertificateData] = useState(null);
const [showCertificateModal, setShowCertificateModal] = useState(false);

  // ==========================================
  // LOAD PILOTS FROM SUPABASE
  // ==========================================

  useEffect(() => {
    async function loadPilots() {
      try {
        setLoading(true);

        const data = await getPilots();

        setPilots(data);

        if (data.length > 0) {
          setSelectedPilot(data[0]);
        }
      } catch (error) {
        console.error('Error loading pilots:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPilots();
  }, []);

  // ==========================================
  // TOGGLE MILESTONE
  // ==========================================

  const handleToggleMilestone = async (milestoneId) => {
    if (!selectedPilot) return;

    try {
      const updated = await toggleMilestone(
        selectedPilot.id,
        milestoneId
      );

      setPilots(updated);

      const refreshed = updated.find(
        (p) => p.id === selectedPilot.id
      );

      if (refreshed) {
        setSelectedPilot(refreshed);
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
      alert('Unable to update milestone.');
    }
  };
  const handleDisbursePayment = (milestoneId) => {
  if (!selectedPilot) return;

  const milestone = selectedPilot.milestones.find(
    (m) => m.id === milestoneId
  );

  if (!milestone) return;

  setPaymentMilestone(milestone);
  setPaymentMethod('PFMS');
  setPaymentRemarks('');
};

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#888'
        }}
      >
        Loading Pilot Deployments...
      </div>
    );
  }

  // ==========================================
  // NO PILOTS
  // ==========================================

  if (!selectedPilot) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#888'
        }}
      >
        No pilot deployments found.
      </div>
    );
  }

  const budgetUsage =
    selectedPilot.budgetAllocated > 0
      ? Math.round(
          (selectedPilot.budgetSpent /
            selectedPilot.budgetAllocated) *
            100
        )
      : 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        paddingBottom: '3rem'
      }}
    >

      {/* Topbar Header */}

      <header className="topbar">
        <div>
          <h1>Pilot Projects & KPI Monitoring</h1>

          <p>
            Member 5 • Real-world implementation health,
            milestone verification, and telemetry.
          </p>
        </div>

        {/* Pilot Selector Dropdown */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              color: '#888',
              textTransform: 'uppercase',
              fontWeight: 600
            }}
          >
            Active Pilot:
          </span>

          <select
            value={selectedPilot.id}
            onChange={(e) => {
              const selectedId = Number(e.target.value);

              const p = pilots.find(
                (item) => item.id === selectedId
              );

              if (p) {
                setSelectedPilot(p);
              }
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
              <option
                key={p.id}
                value={p.id}
              >
                {p.startupName || 'Unknown Startup'} ({p.id})
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

            <h2
              style={{
                color:
                  selectedPilot.health === 'On Track'
                    ? '#10b981'
                    : '#f59e0b',
                fontSize: '1.25rem'
              }}
            >
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
              {
                selectedPilot.milestones.filter(
                  (m) => m.completed
                ).length
              }{' '}
              / {selectedPilot.milestones.length}
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

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >

            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#fff'
              }}
            >
              {selectedPilot.startupName}
            </h2>

            <span
              style={{
                backgroundColor:
                  selectedPilot.health === 'On Track'
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(245,158,11,0.15)',

                color:
                  selectedPilot.health === 'On Track'
                    ? '#34d399'
                    : '#fbbf24',

                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              {selectedPilot.solutionTitle}
            </span>

          </div>

          <p
            style={{
              margin: '0.4rem 0 0 0',
              color: '#94a3b8',
              fontSize: '0.85rem'
            }}
          >
            Linked Challenge:{' '}
            <strong style={{ color: '#cbd5e1' }}>
              {selectedPilot.challengeTitle}
            </strong>{' '}
            • {selectedPilot.department}
          </p>

        </div>


        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}
        >

          <div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748b',
                textTransform: 'uppercase'
              }}
            >
              Timeline Window
            </span>

            <div
              style={{
                color: '#e2e8f0',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {selectedPilot.startDate} →{' '}
              {selectedPilot.endDate}
            </div>
          </div>


          <div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748b',
                textTransform: 'uppercase'
              }}
            >
              Funding Released
            </span>

            <div
              style={{
                color: '#e2e8f0',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              ₹
              {selectedPilot.budgetSpent.toLocaleString()} / ₹
              {selectedPilot.budgetAllocated.toLocaleString()}
            </div>
          </div>

        </div>

      </div>


      {/* Main Grid */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >

        {/* Left Side */}

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

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >

            <div>

              <h3
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <TrendingUp
                  size={18}
                  color="#3b82f6"
                />

                Live Telemetry: Target vs Actual Efficiency Trend
              </h3>

              <p
                style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.75rem',
                  color: '#94a3b8'
                }}
              >
                Weekly performance benchmarks monitored via
                sensor telemetry
              </p>

            </div>

          </div>


          {/* Chart */}

          <div
            style={{
              height: '260px',
              width: '100%',
              marginTop: '0.5rem'
            }}
          >

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={selectedPilot.metricsHistory}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#232838"
                />

                <XAxis
                  dataKey="week"
                  stroke="#64748b"
                  fontSize={12}
                />

                <YAxis
                  unit="%"
                  stroke="#64748b"
                  fontSize={12}
                  domain={[40, 100]}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e222d',
                    borderColor: '#333a4d',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingTop: '8px'
                  }}
                />

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


          {/* KPI Cards */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginTop: '0.5rem'
            }}
          >

            {selectedPilot.kpis.map((kpi) => (

              <div
                key={kpi.id}
                style={{
                  backgroundColor: '#1b202c',
                  border: '1px solid #2a3144',
                  borderRadius: '10px',
                  padding: '1rem'
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >

                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      fontWeight: 600
                    }}
                  >
                    {kpi.name}
                  </span>

                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontWeight: 700,
                      backgroundColor:
                        kpi.status === 'Good' ||
                        kpi.status === 'Optimal'
                          ? 'rgba(16,185,129,0.2)'
                          : 'rgba(239,68,68,0.2)',

                      color:
                        kpi.status === 'Good' ||
                        kpi.status === 'Optimal'
                          ? '#34d399'
                          : '#f87171'
                    }}
                  >
                    {kpi.status}
                  </span>

                </div>


                <div
                  style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.5rem'
                  }}
                >

                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#fff'
                    }}
                  >
                    {kpi.current}
                    {kpi.unit}
                  </span>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748b'
                    }}
                  >
                    / goal {kpi.target}
                    {kpi.unit}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* Right Side: Milestones */}

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

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}
            >

              <h3
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Layers
                  size={18}
                  color="#eab308"
                />

                Delivery Milestones
              </h3>

             <button
  onClick={() => {
    const incompleteMilestone = selectedPilot.milestones.find(
      (m) => !m.completed
    );

    if (incompleteMilestone) {
      handleToggleMilestone(incompleteMilestone.id);
    } else {
      alert('All milestones have already been signed off.');
    }
  }}
  style={{
    padding: '0.4rem 0.75rem',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: 700,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  }}
>
  Sign-off
</button>
            </div>

            <p
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                margin: '0 0 1rem 0'
              }}
            >
              Verify field deliveries by checking completed
              milestones:
            </p>


            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >

              {selectedPilot.milestones.map((m) => (

                <div
                  key={m.id}
                  onClick={() =>
                    handleToggleMilestone(m.id)
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.85rem',
                    borderRadius: '8px',

                    border: m.completed
                      ? '1px solid #065f46'
                      : '1px solid #282f42',

                    backgroundColor: m.completed
                      ? 'rgba(6,95,70,0.2)'
                      : '#1b202c',

                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >

                  <input
                    type="checkbox"
                    checked={m.completed}
                    onChange={() => {}}
                    style={{
                      marginTop: '0.2rem',
                      accentColor: '#10b981',
                      cursor: 'pointer'
                    }}
                  />

                  <div style={{ flex: 1 }}>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: m.completed
                          ? '#6ee7b7'
                          : '#e2e8f0',

                        textDecoration:
                          m.completed
                            ? 'line-through'
                            : 'none'
                      }}
                    >
                      {m.title}
                    </p>

                    <p
                      style={{
                        margin: '0.25rem 0 0 0',
                        fontSize: '0.7rem',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Clock size={12} />
                      Due: {m.dueDate}
                    </p>
                      {m.completed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDisbursePayment(m.id);
                      }}
                      disabled={m.paymentStatus === 'Paid'}
                      style={{
                        marginTop: '0.6rem',
                        padding: '0.45rem 0.7rem',
                        backgroundColor:
                          m.paymentStatus === 'Paid' ? '#374151' : '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor:
                          m.paymentStatus === 'Paid' ? 'default' : 'pointer'
                      }}
                    >
                      {m.paymentStatus === 'Paid'
                        ? 'Paid'
                        : `Disburse ₹${Number(m.amount || 0).toLocaleString()}`}
                    </button>
)}
                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* Certificate Button */}

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #272c3d'
            }}
          >

            <button
  type="button"
  onClick={async () => {
  try {
    const certificate = await generatePilotCertificate(selectedPilot.id);

    setCertificateData(certificate);
    setShowCertificateModal(true);
  } catch (error) {
    alert(error.message || "Failed to generate certificate.");
  }
}}
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

        </div>    </div>

    {paymentMilestone && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setPaymentMilestone(null)}
      >
        <div
          style={{
            width: '420px',
            background: '#111827',
            border: '1px solid #374151',
            borderRadius: '12px',
            padding: '1.5rem',
            color: '#fff'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ marginTop: 0 }}>Milestone Payment</h2>

          <p style={{ color: '#9ca3af' }}>
            {paymentMilestone.title}
          </p>

          <div
            style={{
              background: '#1f2937',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}
          >
            <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
              Payment Amount
            </div>

            <strong style={{ fontSize: '1.5rem' }}>
              ₹{Number(paymentMilestone.amount || 0).toLocaleString('en-IN')}
            </strong>
          </div>

          <label style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            Payment Method
          </label>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{
              width: '100%',
              marginTop: '0.4rem',
              marginBottom: '1rem',
              padding: '0.65rem',
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
              borderRadius: '6px'
            }}
          >
            <option value="PFMS">PFMS</option>
            <option value="NEFT/RTGS">NEFT / RTGS</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Net Banking">Net Banking</option>
          </select>

          <label style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            Remarks
          </label>

          <textarea
            value={paymentRemarks}
            onChange={(e) => setPaymentRemarks(e.target.value)}
            placeholder="Enter payment remarks..."
            rows={3}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              marginTop: '0.4rem',
              padding: '0.65rem',
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
              borderRadius: '6px',
              resize: 'vertical'
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.25rem'
            }}
          >
            <button
              onClick={() => setPaymentMilestone(null)}
              style={{
                padding: '0.6rem 1rem',
                background: '#374151',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                try {
                  await disburseMilestonePayment(
                    selectedPilot.id,
                    paymentMilestone.id
                  );

                  const updatedPilots = await getPilots();

                  setPilots(updatedPilots);

                  const updatedPilot = updatedPilots.find(
                    (p) => p.id === selectedPilot.id
                  );

                  setSelectedPilot(updatedPilot || null);
                  setPaymentMilestone(null);

                  alert('Payment marked as paid successfully.');
                } catch (error) {
                  console.error('Payment Error:', error);
                  alert(error.message || 'Payment failed.');
                }
              }}
              style={{
                padding: '0.6rem 1rem',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              Confirm & Disburse
            </button>
          </div>
        </div>
      </div>
    )}
  
  


{showCertificateModal && certificateData && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}
  >
    <div
      style={{
        background: '#18191c',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '16px',
        padding: '30px',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
      }}
    >

      {/* Close Button */}
      <button
        onClick={() => setShowCertificateModal(false)}
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          border: 'none',
          background: '#f1f5f9',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          cursor: 'pointer',
          fontSize: '20px'
        }}
      >
        ×
      </button>

      {/* Certificate Header */}
      <div
        style={{
          textAlign: 'center',
          borderBottom: '1px solid' ,color:'#bec3d2',
          paddingBottom: '20px',
          marginBottom: '25px'
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: '700',
            color: '#eaf0f2'
          }}
        >
          PILOT COMPLETION CERTIFICATE
        </h2>

        <p
          style={{
            marginTop: '8px',
            color: 'cdeb9e'
          }}
        >
          Startup2Gov Pilot Programme
        </p>
      </div>

      {/* Certificate Details + QR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 220px',
          gap: '30px',
          alignItems: 'center',
          color:'#eaf0f2'
        }}
      >

        {/* Details */}
        <div>

          <div style={{ marginBottom: '18px',
            color:'#cdeb9e'
            
           }}>
            <strong>Startup</strong>
            <p style={{ margin: '5px 0', color: '#a1b7be' }}>
              {certificateData.startup_name}
            </p>
          </div>

          <div style={{ marginBottom: '18px',color:'#cdeb9e'  }}>
            <strong>Solution</strong>
            <p style={{ margin: '5px 0', color: '#e0e6ef' }}>
              {certificateData.solution_title}
            </p>
          </div>

          <div style={{ marginBottom: '18px' ,
            color:'#cdeb9e'
          }}>
            <strong>Department</strong>
            <p style={{ margin: '5px 0', color: '#e0e6ef' }}>
              {certificateData.department || 'Government Department'}
            </p>
          </div>

          <div style={{ marginBottom: '18px',color:'#cdeb9e' }}>
            <strong>Issue Date</strong>
            <p style={{ margin: '5px 0', color: '#e0e6ef' }}>
              {certificateData.issue_date}
            </p>
          </div>

          <div style={{ marginBottom: '18px',color:'#cdeb9e' }}>
            <strong>Certificate ID</strong>
            <p
              style={{
                margin: '5px 0',
                color: '#e0e6ef',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}
            >
              {certificateData.certificate_id}
            </p>
          </div>

          {/* Verified Status */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '20px',
              background: '#abb3ae',
              color: '#166534',
              fontWeight: '600'
            }}
          >
            ✓ Certificate Verified
          </div>

        </div>

        {/* QR Code */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >

          <div
            style={{
              padding: '15px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              background: '#fffdfd'
            }}
          >
         <QRCodeSVG
  value={`${window.location.origin}/verify-certificate?certificateId=${encodeURIComponent(
    certificateData.certificate_id
  )}`}
  size={170}
  level="H"
/>
          </div>

          <span
            style={{
              fontSize: '13px',
              color: '#aeb6c0',
              textAlign: 'center'
            }}
          >
            Scan to verify certificate
          </span>

        </div>

      </div>

      {/* Verification Section */}
      <div
        style={{
          marginTop: '30px',
          padding: '22px',
          background: '#b8bbbf',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}
      >

        <h3
          style={{
            marginTop: 0,
            marginBottom: '8px',
            color:'#45552b'
          }}
        >
          Verify Certificate
        </h3>

        <p
          style={{
            color: '#424952',
            fontSize: '14px'
          }}
        >
          Anyone with the Certificate ID can verify this certificate.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '15px'
          }}
        >

          <input
            type="text"
            value={certificateData.certificate_id}
            readOnly
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '11px 13px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontFamily: 'monospace'
            }}
          />

          <button
            onClick={() => {
              alert(
                `Certificate Verified Successfully!\n\nCertificate ID: ${certificateData.certificate_id}\nStartup: ${certificateData.startup_name}`
              );
            }}
            style={{
              padding: '11px 18px',
              border: 'none',
              borderRadius: '8px',
              background: '#1d4f29',
              color: '#ffffff',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Verify Certificate
          </button>

        </div>

        <div
          style={{
            marginTop: '18px',
            padding: '12px 15px',
            background: '#dcfce7',
            color: '#166534',
            borderRadius: '8px',
            fontWeight: '600'
          }}
        >
          ✓ Certificate is valid and verified in Startup2Gov
        </div>

      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '25px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <button
          onClick={() => setShowCertificateModal(false)}
          style={{
            padding: '10px 20px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
</div>
  );
}

      

