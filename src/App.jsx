import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { Login, Signup } from "./pages/auth/Auth.jsx";
import Landing from "./pages/Landing.jsx";
import NotFound from "./pages/NotFound.jsx";

import StartupDashboard from "./pages/startup/StartupDashboard";
import StartupProfile from "./pages/startup/StartupProfile";
import BrowseChallenges from "./pages/startup/BrowseChallenges";
import ChallengeDetails from "./pages/startup/ChallengeDetails";
import ApplyChallenge from "./pages/startup/ApplyChallenge";
import MyApplications from "./pages/startup/MyApplications";
import EvaluationDashboard from "./pages/evaluator/EvaluationDashboard";

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<StartupDashboard />} />
            <Route path="/profile" element={<StartupProfile />} />
            <Route path="/challenges" element={<BrowseChallenges />} />
            <Route path="/challenges/:id" element={<ChallengeDetails />} />
            <Route path="/apply/:id" element={<ApplyChallenge />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/evaluation" element={<EvaluationDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
