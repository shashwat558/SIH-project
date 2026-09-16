import { useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Search,
  Trophy,
  ChevronDown,
  XCircle,
} from "lucide-react";

import { challenges } from "../../data/challenges.js";
import {
  evaluateStartup,
  rankStartups,
  recommendationFor,
} from "../../services/evaluationService.js";

const DEMO_STARTUPS = [
  {
    id: "startup-1",
    startupName: "AquaSense Technologies",
    founderName: "Rahul Sharma",
    industry: "CleanTech",
    technology: "IoT sensors, analytics dashboard",
    techTags: "iot, sensors, water, monitoring, analytics",
    stage: "MVP",
    teamSize: 8,
    foundedYear: 2021,
    dpiit: "DIPP123456",
    description:
      "IoT based monitoring and sensing platform for water quality and real-time environmental data.",
  },
  {
    id: "startup-2",
    startupName: "WaterTech Solutions",
    founderName: "Priya Mehta",
    industry: "CleanTech",
    technology: "IoT, sensors, mobile application",
    techTags: "iot, sensor, water, field, mobile",
    stage: "Early Revenue",
    teamSize: 6,
    foundedYear: 2022,
    dpiit: "DIPP789012",
    description:
      "Low-cost water monitoring technology with field reporting and rural deployment experience.",
  },
  {
    id: "startup-3",
    startupName: "UrbanFlow AI",
    founderName: "Arjun Verma",
    industry: "Technology",
    technology: "AI, analytics, dashboard",
    techTags: "analytics, monitoring, ai, dashboard",
    stage: "MVP",
    teamSize: 4,
    foundedYear: 2023,
    dpiit: "",
    description:
      "Technology platform providing analytics and monitoring solutions for smart cities.",
  },
  {
    id: "startup-4",
    startupName: "GreenGrid Innovations",
    founderName: "Neha Kapoor",
    industry: "CleanTech",
    technology: "IoT sensors, renewable analytics",
    techTags: "iot, sensors, analytics, monitoring",
    stage: "Growth",
    teamSize: 12,
    foundedYear: 2019,
    dpiit: "DIPP456789",
    description:
      "Clean technology company building sensor-driven monitoring and analytics platforms.",
  },
];

function ScoreBar({ label, score, max }) {
  const percentage = (score / max) * 100;

  return (
    <div className="evaluation-score-row">
      <div className="evaluation-score-label">
        <span>{label}</span>
        <strong>
          {score}/{max}
        </strong>
      </div>

      <div className="evaluation-score-track">
        <div
          className="evaluation-score-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function EvaluationDashboard() {
  const [selectedChallengeId, setSelectedChallengeId] = useState(
    challenges[0]?.id
  );

  const [selectedStartup, setSelectedStartup] = useState(null);

  const selectedChallenge = useMemo(
    () =>
      challenges.find(
        (challenge) => Number(challenge.id) === Number(selectedChallengeId)
      ),
    [selectedChallengeId]
  );

  const rankings = useMemo(() => {
    if (!selectedChallenge) return [];

    return rankStartups(DEMO_STARTUPS, selectedChallenge);
  }, [selectedChallenge]);

  const selectedEvaluation = useMemo(() => {
    if (!selectedStartup || !selectedChallenge) return null;

    return evaluateStartup(selectedStartup, selectedChallenge);
  }, [selectedStartup, selectedChallenge]);

  const eligibleCount = rankings.filter((item) => item.eligible).length;

  const averageScore = rankings.length
    ? Math.round(
        rankings.reduce((sum, item) => sum + item.score, 0) / rankings.length
      )
    : 0;

  const handleChallengeChange = (event) => {
    setSelectedChallengeId(event.target.value);
    setSelectedStartup(null);
  };

  return (
    <div className="evaluation-page">
      {/* HEADER */}
      <div className="evaluation-header">
        <div>
          <p className="evaluation-kicker">MEMBER 4 · EVALUATION ENGINE</p>

          <h1>Evaluation & Matching</h1>

          <p className="evaluation-subtitle">
            Transparent, explainable scoring to help departments evaluate
            startup applications.
          </p>
        </div>

        <div className="evaluation-weight-card">
          <span>SCORING MODEL</span>

          <strong>100 Points</strong>

          <small>30 · 25 · 20 · 15 · 10</small>
        </div>
      </div>

      {/* CHALLENGE SELECTOR */}
      <div className="evaluation-selector-card">
        <div>
          <span className="evaluation-label">SELECT GOVERNMENT CHALLENGE</span>

          <h2>{selectedChallenge?.title}</h2>

          <p>
            {selectedChallenge?.department} · {selectedChallenge?.location}
          </p>
        </div>

        <div className="evaluation-select-wrapper">
          <ChevronDown size={18} />

          <select
            value={selectedChallengeId}
            onChange={handleChallengeChange}
          >
            {challenges.map((challenge) => (
              <option key={challenge.id} value={challenge.id}>
                {challenge.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STATS */}
      <div className="evaluation-stats">
        <div className="evaluation-stat-card">
          <span>APPLICATIONS</span>
          <strong>{rankings.length}</strong>
          <small>Under evaluation</small>
        </div>

        <div className="evaluation-stat-card">
          <span>ELIGIBLE</span>
          <strong>{eligibleCount}</strong>
          <small>Passed available checks</small>
        </div>

        <div className="evaluation-stat-card">
          <span>AVERAGE SCORE</span>
          <strong>{averageScore}</strong>
          <small>Out of 100</small>
        </div>

        <div className="evaluation-stat-card">
          <span>PILOT BUDGET</span>
          <strong>{selectedChallenge?.budget || "—"}</strong>
          <small>{selectedChallenge?.duration}</small>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="evaluation-layout">
        {/* RANKING */}
        <div className="evaluation-ranking-card">
          <div className="evaluation-card-header">
            <div>
              <span className="evaluation-label">STARTUP RANKING</span>
              <h2>Matched Applications</h2>
            </div>

            <Trophy size={22} />
          </div>

          <div className="evaluation-table">
            <div className="evaluation-table-head">
              <span>RANK</span>
              <span>STARTUP</span>
              <span>ELIGIBILITY</span>
              <span>MATCH SCORE</span>
              <span />
            </div>

            {rankings.map((item) => (
              <button
                className={`evaluation-row ${
                  selectedStartup?.id === item.startup.id
                    ? "evaluation-row-active"
                    : ""
                }`}
                key={item.startup.id}
                onClick={() => setSelectedStartup(item.startup)}
              >
                <span className="rank-number">
                  #{item.rank}
                </span>

                <span className="startup-cell">
                  <strong>{item.startup.startupName}</strong>
                  <small>{item.startup.industry}</small>
                </span>

                <span>
                  {item.eligible ? (
                    <span className="status-pill status-pass">
                      <CheckCircle2 size={14} />
                      Eligible
                    </span>
                  ) : (
                    <span className="status-pill status-warning">
                      <AlertTriangle size={14} />
                      Review
                    </span>
                  )}
                </span>

                <span className="score-number">
                  {item.score}
                  <small>/100</small>
                </span>

                <span>
                  <Search size={17} />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div className="evaluation-detail-card">
          {!selectedEvaluation ? (
            <div className="evaluation-empty">
              <Search size={32} />

              <h3>Select a startup</h3>

              <p>
                Click any startup from the ranking to view its complete
                evaluation.
              </p>
            </div>
          ) : (
            <>
              <div className="evaluation-detail-header">
                <div>
                  <span className="evaluation-label">EVALUATION REPORT</span>

                  <h2>{selectedEvaluation.startup.startupName}</h2>

                  <p>
                    {selectedEvaluation.startup.founderName} ·{" "}
                    {selectedEvaluation.startup.industry}
                  </p>
                </div>

                <div className="evaluation-big-score">
                  <strong>{selectedEvaluation.score}</strong>
                  <span>/100</span>
                </div>
              </div>

              {/* SCORE BREAKDOWN */}
              <div className="evaluation-breakdown">
                <h3>Score Breakdown</h3>

                <ScoreBar
                  label="Technology Match"
                  score={selectedEvaluation.breakdown.technology.score}
                  max={30}
                />

                <ScoreBar
                  label="Domain Match"
                  score={selectedEvaluation.breakdown.domain.score}
                  max={25}
                />

                <ScoreBar
                  label="Eligibility"
                  score={selectedEvaluation.breakdown.eligibility.score}
                  max={20}
                />

                <ScoreBar
                  label="Experience"
                  score={selectedEvaluation.breakdown.experience.score}
                  max={15}
                />

                <ScoreBar
                  label="Budget Compatibility"
                  score={selectedEvaluation.breakdown.budget.score}
                  max={10}
                />
              </div>

              {/* ELIGIBILITY */}
              <div className="evaluation-check-section">
                <h3>Eligibility Checklist</h3>

                {selectedEvaluation.breakdown.eligibility.checks.map(
                  (check) => (
                    <div className="evaluation-check" key={check.id}>
                      {check.status === "pass" ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <AlertTriangle size={18} />
                      )}

                      <span>{check.label}</span>
                    </div>
                  )
                )}
              </div>

              {/* REASONS */}
              <div className="evaluation-reasons">
                <h3>Why this score?</h3>

                {selectedEvaluation.reasons.map((reason, index) => (
                  <div key={index}>
                    <CheckCircle2 size={15} />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              {/* RECOMMENDATION */}
              <div className="evaluation-recommendation">
                <div>
                  <span className="evaluation-label">RECOMMENDATION</span>

                  <strong>
                    {recommendationFor(
                      selectedEvaluation.score,
                      selectedEvaluation.eligible
                    )} 
                  </strong>
                </div>

                {selectedEvaluation.eligible ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <XCircle size={24} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EvaluationDashboard;