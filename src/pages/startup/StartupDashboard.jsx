import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Search,
  FileText,
  Send,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

function StartupDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          Startup2Gov
        </div>

        <nav>
          <a
            className="active"
            onClick={() => navigate("/")}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </a>

          <a
            onClick={() => navigate("/profile")}
          >
            <User size={20} />
            Startup Profile
          </a>

          <a
            onClick={() => navigate("/challenges")}
          >
            <Search size={20} />
            Browse Challenges
          </a>

          <a
            onClick={() => navigate("/applications")}
          >
            <FileText size={20} />
            My Applications
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Header */}
        <header className="topbar">
          <div>
            <h1>Startup Dashboard</h1>
            <p>
              Welcome back! Manage your startup and government applications.
            </p>
          </div>

          <div className="profile">
            <div className="avatar">S</div>
            <span>Startup</span>
          </div>
        </header>

        {/* Statistics */}
        <section className="stats">

          <div className="stat-card">
            <div className="stat-icon">
              <Search size={22} />
            </div>

            <div>
              <p>Available Challenges</p>
              <h2>24</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Send size={22} />
            </div>

            <div>
              <p>Applications Submitted</p>
              <h2>8</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={22} />
            </div>

            <div>
              <p>Under Review</p>
              <h2>3</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle size={22} />
            </div>

            <div>
              <p>Approved</p>
              <h2>2</h2>
            </div>
          </div>

        </section>

        {/* Quick Actions */}
        <section className="section">
          <h2>Quick Actions</h2>

          <div className="action-grid">

            {/* Profile */}
            <button
              className="action-card"
              onClick={() => navigate("/profile")}
            >
              <User size={28} />

              <div>
                <h3>Complete Profile</h3>
                <p>Add your startup information</p>
              </div>

              <ArrowRight size={20} />
            </button>

            {/* Challenges */}
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

            {/* Applications */}
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

        {/* Recent Applications */}
        <section className="section">

          <div className="section-header">
            <h2>Recent Applications</h2>

            <button
              className="view-all"
              onClick={() => navigate("/applications")}
            >
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

            <div className="table-row">
              <span>Smart City Waste Management</span>
              <span>Urban Development</span>
              <span className="status review">
                Under Review
              </span>
              <span>10 Sep 2026</span>
            </div>

            <div className="table-row">
              <span>Digital Healthcare Platform</span>
              <span>Health Department</span>
              <span className="status approved">
                Approved
              </span>
              <span>5 Sep 2026</span>
            </div>

            <div className="table-row">
              <span>AI Based Traffic Management</span>
              <span>Transport Department</span>
              <span className="status pending">
                Pending
              </span>
              <span>2 Sep 2026</span>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}

export default StartupDashboard;

