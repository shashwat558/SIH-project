const STORAGE_KEY = 'startup2gov_pilots_data';

const INITIAL_PILOTS = [
  {
    id: 'PLT-2026-01',
    startupName: 'AeroClean Dynamics',
    challengeTitle: 'Automated Drone Air Quality Mapping',
    department: 'Urban Development Department',
    status: 'On Track',
    deploymentProgress: 65,
    budgetSpent: 450000,
    totalBudget: 800000,
    kpis: [
      { name: 'PM2.5 Sensor Uptime', current: '98.2%', goal: '95%', status: 'Healthy' },
      { name: 'Data Latency', current: '420ms', goal: '500ms', status: 'Healthy' },
      { name: 'Sampling Coverage', current: '84%', goal: '80%', status: 'Healthy' }
    ],
    milestones: [
      { id: 'm1', title: 'Hardware Integration & Drone Flight Tests', dueDate: '2026-07-15', verified: true, amount: 250000, paymentStatus: 'Disbursed', txHash: 'PFMS-TXN-98421' },
      { id: 'm2', title: 'Real-time Telemetry Dashboard Sync', dueDate: '2026-08-10', verified: true, amount: 200000, paymentStatus: 'Disbursed', txHash: 'PFMS-TXN-99103' },
      { id: 'm3', title: 'Multi-Zone 30-Day Autonomous Flight Validation', dueDate: '2026-09-30', verified: false, amount: 350000, paymentStatus: 'Pending', txHash: null }
    ],
    telemetry: [
      { week: 'W1', target: 70, actual: 68 },
      { week: 'W2', target: 75, actual: 74 },
      { week: 'W3', target: 80, actual: 82 },
      { week: 'W4', target: 85, actual: 88 }
    ]
  },
  {
    id: 'PLT-2026-02',
    startupName: 'HelioTrack Labs',
    challengeTitle: 'Smart Solar Grid Optimization',
    department: 'Urban Development Department',
    status: 'At Risk',
    deploymentProgress: 40,
    budgetSpent: 300000,
    totalBudget: 1200000,
    kpis: [
      { name: 'Grid Fault Latency', current: '58sec', goal: '30sec', status: 'At Risk' },
      { name: 'Transmission Loss Avoidance', current: '8.5%', goal: '12%', status: 'Warning' }
    ],
    milestones: [
      { id: 'm201', title: 'Substation Gateway Installation', dueDate: '2026-08-30', verified: true, amount: 300000, paymentStatus: 'Disbursed', txHash: 'PFMS-TXN-88120' },
      { id: 'm202', title: 'Edge Analytics Calibration', dueDate: '2026-09-20', verified: false, amount: 400000, paymentStatus: 'Pending', txHash: null },
      { id: 'm203', title: 'Multi-Substation Load Test', dueDate: '2026-10-30', verified: false, amount: 500000, paymentStatus: 'Pending', txHash: null }
    ],
    telemetry: [
      { week: 'W1', target: 50, actual: 45 },
      { week: 'W2', target: 60, actual: 52 },
      { week: 'W3', target: 70, actual: 61 }
    ]
  }
];

export const getPilots = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PILOTS));
    return INITIAL_PILOTS;
  }
  return JSON.parse(data);
};

export const toggleMilestone = (pilotId, milestoneId) => {
  const pilots = getPilots();
  const pilot = pilots.find((p) => p.id === pilotId);
  if (!pilot) return pilots;

  const milestone = pilot.milestones.find((m) => m.id === milestoneId);
  if (milestone) {
    milestone.verified = !milestone.verified;
    if (!milestone.verified && milestone.paymentStatus === 'Disbursed') {
      milestone.paymentStatus = 'Pending';
      pilot.budgetSpent = Math.max(0, pilot.budgetSpent - milestone.amount);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(pilots));
  return pilots;
};

export const disburseMilestonePayment = (pilotId, milestoneId) => {
  const pilots = getPilots();
  const pilot = pilots.find((p) => p.id === pilotId);
  if (!pilot) return pilots;

  const milestone = pilot.milestones.find((m) => m.id === milestoneId);
  if (milestone && milestone.verified && milestone.paymentStatus !== 'Disbursed') {
    milestone.paymentStatus = 'Disbursed';
    milestone.txHash = `PFMS-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    pilot.budgetSpent += milestone.amount;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(pilots));
  return pilots;
};