import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Landmark, Sun, Moon, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

function AuthForm({ mode }) {
  const isLogin = mode === "login";
  const { login, signup } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ startupName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) {
      setError("Email and password are required.");
      return;
    }
    if (!isLogin && !form.startupName.trim()) {
      setError("Startup name is required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters (demo rule).");
      return;
    }
    setBusy(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await signup({
          startupName: form.startupName,
          email: form.email,
          password: form.password,
        });
      }
      const dest = location.state?.from || "/dashboard";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <button
        className="auth-theme-toggle"
        onClick={toggle}
        title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      >
        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        {theme === "dark" ? "LIGHT" : "DARK"}
      </button>

      <div className="auth-card">
        <div className="auth-logo">
          <Landmark size={22} strokeWidth={2.4} />
        </div>
        <h1 className="auth-title">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="auth-sub">
          {isLogin
            ? "Jump back into your startup pipeline."
            : "Start managing your govt applications today."}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="startupName">
                <User size={15} />
                Startup name
              </label>
              <input
                id="startupName"
                name="startupName"
                placeholder="Smart Waste AI"
                value={form.startupName}
                onChange={handleChange}
                autoComplete="organization"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">
              <Mail size={15} />
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">
              <Lock size={15} />
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <Link to="/signup">
              New here? Create an account <ArrowRight size={15} />
            </Link>
          ) : (
            <Link to="/login">
              Already have an account? Sign in <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </div>

      <p className="auth-demo">
        <Link to="/">← Back to home</Link> · Demo: demo@startup.in / password123 ·
        mock auth, data stays in this browser
      </p>
    </div>
  );
}

export function Login() {
  return <AuthForm mode="login" />;
}

export function Signup() {
  return <AuthForm mode="signup" />;
}
