import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="details-page">
      <div className="not-found">
        <h2>Page not found</h2>
        <p>The page you are looking for does not exist.</p>
        <div
          style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}
        >
          <button className="apply-button" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
          <button
            className="cancel-button"
            onClick={() => navigate("/challenges")}
          >
            Browse Challenges
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
