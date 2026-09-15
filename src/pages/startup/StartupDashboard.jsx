import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  User,
  FileText,
  Send,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  AlarmClock,
  TrendingUp,
  Activity,
  FileEdit,
  Target,
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useAuth } from "../../context/AuthContext.jsx";
import { getChallenges } from "../../services/challengeService.js";
import {
  getRecentApplications,
  getStats,
  getApplications,
} from "../../services/applicationService.js";
import { getProfile, profileCompletion } from "../../services/startupService.js";
import { rankChallenges } from "../../services/matching.js";
import { closingSoon, urgencyLabel } from "../../services/deadlines.js";
import { getActivity } from "../../services/activity.js";
import { listDrafts } from "../../services/drafts.js";
import { Loading, ErrorBanner } from "../../components/feedback.jsx";

function statusClass(status) {
  if (status === "Approved") return "approved";
  if (status === "Under Review") return "review";
  return "pending";
}

function StartupDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState({
    stats: { available: 0, submitted: 0, inProgress: 0, approved: 0 },
    recent: [],
    applications: [],
    challenges: [],
    profile: null,
    activity: [],
    drafts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const challenges = await getChallenges();
      const [stats, recent, applications, profile, activity, drafts] =
        await Promise.all([
          getStats(user?.id, challenges.length),
          getRecentApplications(user?.id, 3),
          getApplications(user?.id),
          getProfile(user?.id),
          getActivity(user?.id, 6),
          listDrafts(user?.id),
        ]);
      setData({ stats, recent, applications, challenges, profile, activity, drafts });
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

  const { stats, recent, applications, challenges, profile, activity, drafts } = data;
  const completion = useMemo(() => profileCompletion(profile || {}), [profile]);
  const appliedIds = useMemo(
    () => new Set(applications.map((a) => Number(a.challengeId))),
    [applications]
  );

  const recommended = useMemo(() => {
    if (!challenges.length) return [];
    return rankChallenges(profile || {}, challenges)
      .filter((r) => !appliedIds.has(r.challenge.id))
      .slice(0, 3);
  }, [challenges, profile, appliedIds]);

  const urgent = useMemo(() => {
    const list = closingSoon(
      challenges.filter((c) => !appliedIds.has(c.id)),
      21,
      4
    );
    return list;
  }, [challenges, appliedIds]);

  const draftItems = useMemo(
    () =>
      drafts
        .map((d) => ({
          ...d,
          challenge: challenges.find((c) => c.id === d.challengeId),
        }))
        .filter((d) => d.challenge && !appliedIds.has(d.challengeId)),
    [drafts, challenges, appliedIds]
  );

  const nextAction = useMemo(() => {
    if (completion < 75) {
      return {
        icon: <User size={26} />,
        title: `Complete your profile — ${completion}% done`,
        text: "Stronger profiles get higher match scores and pass eligibility.",
        cta: "Complete profile",
        go: () => navigate("/profile"),
      };
    }
    if (draftItems.length > 0) {
      return {
        icon: <FileEdit size={26} />,
        title: `Resume your draft: ${draftItems[0].challenge.title}`,
        text: "You left an application unfinished — pick up where you left off.",
        cta: "Resume draft",
        go: () => navigate(`/apply/${draftItems[0].challengeId}`),
      };
    }
    if (urgent.length > 0) {
      return {
        icon: <AlarmClock size={26} />,
        title: `${urgencyLabel(urgent[0])}: ${urgent[0].title}`,
        text: `${urgent[0].budget || "Pilot grant"} · ${urgent[0].department} — don't miss it.`,
        cta: "View challenge",
        go: () => navigate(`/challenges/${urgent[0].id}`),
      };
    }
    if (recommended.length > 0) {
      return {
        icon: <Target size={26} />,
        title: `Top match ${recommended[0].score}%: ${recommended[0].challenge.title}`,
        text: recommended[0].reasons[0] || "Best fit for your profile right now.",
        cta: "View challenge",
        go: () => navigate(`/challenges/${recommended[0].challenge.id}`),
      };
    }
    return {
      icon: <TrendingUp size={26} />,
      title: "Track your applications",
      text: "Follow status updates from departments on My Applications.",
      cta: "My Applications",
      go: () => navigate("/applications"),
    };
  }, [completion, draftItems, urgent, recommended, navigate]);

  const funnel = [
    { label: "Submitted", value: stats.submitted },
    { label: "In review", value: stats.inProgress },
    { label: "Approved", value: stats.approved },
  ];
  const funnelMax = Math.max(1, ...funnel.map((f) => f.value));

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Startup Dashboard</h1>
          <p>
            Welcome back{user?.startupName ? `, ${user.startupName}` : ""}! Here is
            what needs your attention.
          </p>
        </div>
        <div className="profile">
          <div className="avatar">
            {(user?.startupName || user?.email || "S").charAt(0).toUpperCase()}
          </div>
          <span>{user?.startupName || "Startup"}</span>
        </div>
      </header>

      <ErrorBanner message={error} onRetry={load} />
      {loading ? (
        <Loading label="Loading dashboard..." />
      ) : (
        <>
          <section className="next-action" onClick={nextAction.go}>
            <div className="next-action-icon">{nextAction.icon}</div>
            <div className="next-action-body">
              <span className="next-action-kicker">Next best action</span>
              <h2>{nextAction.title}</h2>
              <p>{nextAction.text}</p>
            </div>
            <span className="next-action-cta">
              {nextAction.cta}
              <ArrowRight size={18} />
            </span>
          </section>

          <section className="stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Search size={22} />
              </div>
              <div>
                <p>Available Challenges</p>
                <h2>{stats.available}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Send size={22} />
              </div>
              <div>
                <p>Applications Submitted</p>
                <h2>{stats.submitted}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={22} />
              </div>
              <div>
                <p>Under Review</p>
                <h2>{stats.inProgress}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <CheckCircle size={22} />
              </div>
              <div>
                <p>Approved</p>
                <h2>{stats.approved}</h2>
              </div>
            </div>
          </section>

          <section className="dash-grid">
            <div className="dash-panel">
              <div className="section-header">
                <h2>
                  <Sparkles size={18} /> Recommended for you
                </h2>
                <button className="view-all" onClick={() => navigate("/challenges")}>
                  View All
                </button>
              </div>
              {recommended.length === 0 ? (
                <p className="muted">
                  You have applied to everything — nice. New challenges appear here
                  as they are posted.
                </p>
              ) : (
                recommended.map(({ challenge, score, reasons }) => (
                  <button
                    key={challenge.id}
                    className="reco-row"
                    onClick={() => navigate(`/challenges/${challenge.id}`)}
                  >
                    <div className="reco-top">
                      <strong>{challenge.title}</strong>
                      <span className="reco-score">{score}%</span>
                    </div>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${score}%` }} />
                    </div>
                    <span className="reco-reason">
                      {reasons[0] || challenge.department} ·{" "}
                      {urgencyLabel(challenge)}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="dash-panel">
              <div className="section-header">
                <h2>
                  <AlarmClock size={18} /> Closing soon
                </h2>
                <button className="view-all" onClick={() => navigate("/challenges")}>
                  View All
                </button>
              </div>
              {urgent.length === 0 ? (
                <p className="muted">Nothing closing in the next 3 weeks.</p>
              ) : (
                urgent.map((c) => (
                  <button
                    key={c.id}
                    className="urgent-row"
                    onClick={() => navigate(`/challenges/${c.id}`)}
                  >
                    <div>
                      <strong>{c.title}</strong>
                      <span className="reco-reason">
                        {c.department} · {c.budget}
                      </span>
                    </div>
                    <span className="urgent-pill">{urgencyLabel(c)}</span>
                  </button>
                ))
              )}

              <h2 className="funnel-title">
                <TrendingUp size={18} /> Your pipeline
              </h2>
              <div className="funnel">
                {funnel.map((f) => (
                  <div className="funnel-row" key={f.label}>
                    <span>{f.label}</span>
                    <div className="funnel-bar">
                      <div
                        className="funnel-fill"
                        style={{ width: `${(f.value / funnelMax) * 100}%` }}
                      />
                    </div>
                    <strong>{f.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {(draftItems.length > 0 || activity.length > 0) && (
            <section className="dash-grid">
              {draftItems.length > 0 && (
                <div className="dash-panel">
                  <div className="section-header">
                    <h2>
                      <FileEdit size={18} /> Continue where you left off
                    </h2>
                  </div>
                  {draftItems.map((d) => (
                    <button
                      key={d.challengeId}
                      className="urgent-row"
                      onClick={() => navigate(`/apply/${d.challengeId}`)}
                    >
                      <div>
                        <strong>{d.challenge.title}</strong>
                        <span className="reco-reason">
                          Draft saved{" "}
                          {formatDistanceToNow(parseISO(d.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <span className="view-all">Resume →</span>
                    </button>
                  ))}
                </div>
              )}
              {activity.length > 0 && (
                <div className="dash-panel">
                  <div className="section-header">
                    <h2>
                      <Activity size={18} /> Recent activity
                    </h2>
                  </div>
                  <ul className="activity-list">
                    {activity.map((a) => (
                      <li key={a.id}>
                        <span className="activity-dot" />
                        <div>
                          <p>{a.text}</p>
                          <span>
                            {formatDistanceToNow(parseISO(a.at), { addSuffix: true })}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <section className="section">
            <h2>Quick Actions</h2>
            <div className="action-grid">
              <button className="action-card" onClick={() => navigate("/profile")}>
                <User size={28} />
                <div>
                  <h3>Complete Profile ({completion}%)</h3>
                  <p>Add your startup information</p>
                </div>
                <ArrowRight size={20} />
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/challenges")}
              >
                <Search size={28} />
                <div>
                  <h3>Browse Challenges</h3>
                  <p>Find government opportunities</p>
                </div>
                <ArrowRight size={20} />
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/applications")}
              >
                <FileText size={28} />
                <div>
                  <h3>My Applications</h3>
                  <p>Track your submitted applications</p>
                </div>
                <ArrowRight size={20} />
              </button>
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <h2>Recent Applications</h2>
              <button className="view-all" onClick={() => navigate("/applications")}>
                View All
              </button>
            </div>
            <div className="application-table">
              <div className="table-header">
                <span>Challenge</span>
                <span>Department</span>
                <span>Status</span>
                <span>Applied On</span>
              </div>
              {recent.length === 0 ? (
                <div className="table-row">
                  <span>No applications yet. Browse challenges to apply.</span>
                </div>
              ) : (
                recent.map((app) => (
                  <div className="table-row" key={app.id}>
                    <span>{app.challenge}</span>
                    <span>{app.department}</span>
                    <span className={`status ${statusClass(app.status)}`}>
                      {app.status}
                    </span>
                    <span>{app.submittedOn}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}

export default StartupDashboard;
