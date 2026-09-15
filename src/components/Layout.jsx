import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Search,
  FileText,
  LogOut,
  FlaskConical,
  RotateCcw,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { loadJudgeDemo, resetDemo } from "../services/demoKit.js";

function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [demoBusy, setDemoBusy] = useState("");
  const [demoMsg, setDemoMsg] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const runDemo = async (kind) => {
    if (!user?.id) return;
    if (kind === "reset" && !window.confirm("Reset all demo data for this account?")) return;
    setDemoBusy(kind);
    setDemoMsg("");
    try {
      if (kind === "judge") await loadJudgeDemo(user.id);
      else await resetDemo(user.id);
      window.location.reload();
    } catch (e) {
      setDemoMsg(e.message || "Demo action failed.");
      setDemoBusy("");
    }
  };

  const initial = (user?.startupName || user?.email || "S")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-row">
          <div className="logo">Startup2Gov</div>
          <button
            className="theme-toggle"
            onClick={toggle}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
        <nav>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <User size={20} />
            Startup Profile
          </NavLink>
          <NavLink
            to="/challenges"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Search size={20} />
            Browse Challenges
          </NavLink>
          <NavLink
            to="/applications"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FileText size={20} />
            My Applications
          </NavLink>
        </nav>
        <div className="side-footer">
          <div className="side-user">
            <div className="avatar side-avatar">{initial}</div>
            <span className="side-user-name">
              {user?.startupName || user?.email || "Startup"}
            </span>
          </div>
          <button onClick={handleLogout} className="side-btn">
            <LogOut size={16} />
            Logout
          </button>
          <div className="demo-block">
            <p className="demo-label">Demo data</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => runDemo("judge")}
                disabled={demoBusy !== ""}
                title="Load a rich judge story: profile, pipeline, draft, bookmarks"
                className="demo-btn"
              >
                <FlaskConical size={15} />
                {demoBusy === "judge" ? "..." : "Judge demo"}
              </button>
              <button
                onClick={() => runDemo("reset")}
                disabled={demoBusy !== ""}
                title="Clear everything you created and restore samples"
                className="demo-btn"
              >
                <RotateCcw size={15} />
                {demoBusy === "reset" ? "..." : "Reset"}
              </button>
            </div>
            {demoMsg && <p className="demo-err">{demoMsg}</p>}
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
