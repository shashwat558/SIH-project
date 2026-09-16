import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileStack,
  Inbox,
  Clock,
  CheckCircle,
  ArrowRight,
  PlusCircle,
  AlarmClock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getChallenges } from "../../services/challengeService.js";
import {
  getApplicationsForGov,
  getGovStats,
} from "../../services/applicationService.js";
import { getGovChallengesByOwner } from "../../services/govChallengeService.js";
import { getActivity } from "../../services/activity.js";
import { urgencyLabel } from "../../services/deadlines.js";
import { Loading, ErrorBanner } from "../../components/feedback.jsx";

function statusClass(status) {
  if (status === "Approved") return "approved";
  if (status === "Under Review") return "review";
  if (status === "Rejected") return "rejected";
  return "pending";
}

function GovDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState({
    mine: [],
    stats: { total: 0, pending: 0, underReview: 0, approved: 0, rejected: 0, inProgress: 0 },
    recent: [],
    activity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const mine = await getGovChallengesByOwner(user?.id);
      const ownedIds = mine.map((c) => c.id);
      const [stats, recent, activity] = await Promise.all([
        getGovStats(ownedIds),
        getApplicationsForGov({ ownedChallengeIds: ownedIds }).then((a) => a.slice(0, 5)),
        getActivity(user?.id, 6),
      ]);
      // Keep a full challenge list load so counts stay honest if gov owns static-dept rows later.
      await getChallenges();
      setData({ mine, stats, recent, activity });
    } catch (e) {
      setError(e.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const { mine, stats, recent, activity } = data;
  const active = mine.filter((c) => c.status !== "Closed").length;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Government Dashboard</h1>
          <p>
            Welcome{user?.displayName ? `, ${user.displayName}` : ""}! Publish
            challenges and review startup applications.
          </p>
        </div>
        <div className="profile">
          <div className="avatar">
            {(user?.displayName || user?.email || "G").charAt(0).toUpperCase()}
          </div>
          <span>{user?.displayName || "Government"}</span>
        </div>
      </header>

      <ErrorBanner message={error} onRetry={load} />
      {loading ? (
        <Loading label="Loading dashboard..." />
      ) : (
        <>
          <section className="stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FileStack size={22} />
              </div>
              <div>
                <p>My Challenges</p>
                <h2>{mine.length}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <AlarmClock size={22} />
              </div>
              <div>
                <p>Active</p>
                <h2>{active}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Inbox size={22} />
              </div>
              <div>
                <p>Applications Received</p>
                <h2>{stats.total}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={22} />
              </div>
              <div>
                <p>Pending Review</p>
                <h2>{stats.inProgress}</h2>
              </div>
            </div>
          </section>

          <section className="section">
            <h2>Quick Actions</h2>
            <div className="action-grid">
              <button
                className="action-card"
                onClick={() => navigate("/gov/challenges/new")}
              >
                <PlusCircle size={28} />
                <div>
                  <h3>Create Challenge</h3>
                  <p>Publish a new opportunity for startups</p>
                </div>
                <ArrowRight size={20} />
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/gov/challenges")}
              >
                <FileStack size={28} />
                <div>
                  <h3>Manage Challenges</h3>
                  <p>Edit, close or delete your postings</p>
                </div>
                <ArrowRight size={20} />
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/gov/applications")}
              >
                <CheckCircle size={28} />
                <div>
                  <h3>Review Applications</h3>
                  <p>
                    {stats.inProgress > 0
                      ? `${stats.inProgress} waiting for review`
                      : "Approve, reject or request review"}
                  </p>
                </div>
                <ArrowRight size={20} />
              </button>
            </div>
          </section>

          <section className="dash-grid">
            <div className="dash-panel">
              <div className="section-header">
                <h2>My challenges</h2>
                <button
                  className="view-all"
                  onClick={() => navigate("/gov/challenges")}
                >
                  Manage
                </button>
              </div>
              {mine.length === 0 ? (
                <p className="muted">
                  No challenges yet. Create your first one — it appears in
                  startup Browse immediately (mock shared pool).
                </p>
              ) : (
                mine.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    className="urgent-row"
                    onClick={() =>
                      navigate(`/gov/applications?challenge=${c.id}`)
                    }
                  >
                    <div>
                      <strong>{c.title}</strong>
                      <span className="reco-reason">
                        {c.department} · {urgencyLabel(c)}
                      </span>
                    </div>
                    <span
                      className={`status ${c.status === "Closed" ? "closed" : "approved"}`}
                    >
                      {c.status || "Open"}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="dash-panel">
              <div className="section-header">
                <h2>Latest applications</h2>
                <button
                  className="view-all"
                  onClick={() => navigate("/gov/applications")}
                >
                  Review all
                </button>
              </div>
              {recent.length === 0 ? (
                <p className="muted">No applications received yet.</p>
              ) : (
                recent.map((a) => (
                  <button
                    key={a.id}
                    className="urgent-row"
                    onClick={() =>
                      navigate(`/gov/applications?selected=${a.id}`)
                    }
                  >
                    <div>
                      <strong>
                        {a.id} · {a.challenge}
                      </strong>
                      <span className="reco-reason">
                        {a.startupName || a.solution} · {a.submittedOn}
                      </span>
                    </div>
                    <span className={`status ${statusClass(a.status)}`}>
                      {a.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          {activity.length > 0 && (
            <section className="section">
              <div className="section-header">
                <h2>Your activity</h2>
              </div>
              <div className="dash-panel">
                <ul className="activity-list">
                  {activity.map((a) => (
                    <li key={a.id}>
                      <span className="activity-dot" />
                      <div>
                        <p>{a.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

export default GovDashboard;
