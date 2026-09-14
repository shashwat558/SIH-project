import { BrowserRouter, Routes, Route } from "react-router-dom";

import StartupDashboard from "./pages/startup/StartupDashboard";
import StartupProfile from "./pages/startup/StartupProfile";
import BrowseChallenges from "./pages/startup/BrowseChallenges";
import ChallengeDetails from "./pages/startup/ChallengeDetails";
import ApplyChallenge from "./pages/startup/ApplyChallenge";
import MyApplications from "./pages/startup/MyApplications";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<StartupDashboard />}
        />

        <Route
          path="/profile"
          element={<StartupProfile />}
        />

        <Route
          path="/challenges"
          element={<BrowseChallenges />}
        />

        <Route
          path="/challenges/:id"
          element={<ChallengeDetails />}
        />

        <Route
          path="/apply/:id"
          element={<ApplyChallenge />}
        />

        <Route 
          path="/applications" 
          element={<MyApplications />} 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

