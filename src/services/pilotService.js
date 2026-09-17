// ==========================================
//  PILOT & KPI TRACKING SERVICE
// Handles Pilot lifecycle, milestone completions, and KPI time-series metrics
// ==========================================

export const INITIAL_PILOTS = [
  {
    id: "PLT-2026-01",
    challengeId: "CH-101",
    challengeTitle: "Smart City Waste Management",
    startupName: "AquaSense Technologies",
    solutionTitle: "AI-driven Smart Bin & Route Optimization",
    department: "Urban Development Department",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    budgetAllocated: 460000,
    budgetSpent: 185000,
    status: "Active",
    health: "On Track",
    overallProgress: 65,
    kpis: [
      {
        name: "Sensor Uptime",
        target: 99.0,
        current: 98.4,
        unit: "%",
        status: "Good"
      },
      {
        name: "Route Fuel Reduction",
        target: 25.0,
        current: 21.8,
        unit: "%",
        status: "Good"
      },
      {
        name: "Bin Overflow Incidents",
        target: 5,
        current: 3,
        unit: "incidents/mo",
        status: "Optimal"
      }
    ],
    metricsHistory: [
      { week: "Wk 1", targetEff: 70, actualEff: 68, binsActive: 20 },
      { week: "Wk 2", targetEff: 75, actualEff: 74, binsActive: 45 },
      { week: "Wk 3", targetEff: 80, actualEff: 79, binsActive: 75 },
      { week: "Wk 4", targetEff: 85, actualEff: 88, binsActive: 110 },
      { week: "Wk 5", targetEff: 90, actualEff: 91, binsActive: 140 },
      { week: "Wk 6", targetEff: 95, actualEff: 94, binsActive: 160 }
    ],
    milestones: [
      { id: 1, title: "Sensor Hardware Prototyping & Lab Testing", dueDate: "2026-09-15", completed: true },
      { id: 2, title: "Field Deployment in Ward 4 & 5 (100 Bins)", dueDate: "2026-10-05", completed: true },
      { id: 3, title: "Telemetry Integration with Municipal Control Dashboard", dueDate: "2026-10-25", completed: false },
      { id: 4, title: "Route Optimization Algorithm Pilot Run", dueDate: "2026-11-20", completed: false },
      { id: 5, title: "Final Impact Audit & Procurement Clearance Report", dueDate: "2026-12-20", completed: false }
    ]
  },
  {
    id: "PLT-2026-02",
    challengeId: "CH-102",
    challengeTitle: "Solar Grid Decentralized Monitoring",
    startupName: "HelioTrack Labs",
    solutionTitle: "Edge-IoT Inverter Efficiency Watcher",
    department: "Renewable Energy Agency",
    startDate: "2026-08-15",
    endDate: "2026-11-30",
    budgetAllocated: 520000,
    budgetSpent: 390000,
    status: "Active",
    health: "At Risk",
    overallProgress: 40,
    kpis: [
      {
        name: "Grid Fault Latency",
        target: 30,
        current: 58,
        unit: "sec",
        status: "At Risk"
      },
      {
        name: "Transmission Loss Avoidance",
        target: 12.0,
        current: 8.5,
        unit: "%",
        status: "Warning"
      }
    ],
    metricsHistory: [
      { week: "Wk 1", targetEff: 60, actualEff: 55, binsActive: 10 },
      { week: "Wk 2", targetEff: 68, actualEff: 60, binsActive: 22 },
      { week: "Wk 3", targetEff: 75, actualEff: 66, binsActive: 35 },
      { week: "Wk 4", targetEff: 82, actualEff: 70, binsActive: 48 }
    ],
    milestones: [
      { id: 1, title: "Substation Gateway Installation", dueDate: "2026-08-30", completed: true },
      { id: 2, title: "Edge Analytics Calibration", dueDate: "2026-09-20", completed: false },
      { id: 3, title: "Multi-Substation Load Test", dueDate: "2026-10-30", completed: false }
    ]
  }
];

export function getPilots() {
  const stored = localStorage.getItem("startup2gov_pilots");
  if (!stored) {
    localStorage.setItem("startup2gov_pilots", JSON.stringify(INITIAL_PILOTS));
    return INITIAL_PILOTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PILOTS;
  }
}

export function savePilots(pilots) {
  localStorage.setItem("startup2gov_pilots", JSON.stringify(pilots));
}

export function toggleMilestone(pilotId, milestoneId) {
  const pilots = getPilots();
  const updated = pilots.map((p) => {
    if (p.id !== pilotId) return p;
    const nextMilestones = p.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = nextMilestones.filter((m) => m.completed).length;
    const progress = Math.round((completedCount / nextMilestones.length) * 100);
    return {
      ...p,
      milestones: nextMilestones,
      overallProgress: progress
    };
  });
  savePilots(updated);
  return updated;
}