import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Building2,
  FileText,
  Eye,
  Clock,
  CheckCircle,
} from "lucide-react";

const applications = [
  {
    id: "APP-001",
    challengeId: 1,
    challenge: "Smart City Waste Management",
    solution: "Smart Waste AI",
    department: "Urban Development Department",
    submittedOn: "10 Sep 2026",
    status: "Under Review",
  },
  {
    id: "APP-002",
    challengeId: 2,
    challenge: "Digital Healthcare Platform",
    solution: "HealthConnect",
    department: "Health Department",
    submittedOn: "5 Sep 2026",
    status: "Approved",
  },
  {
    id: "APP-003",
    challengeId: 3,
    challenge: "AI Based Traffic Management",
    solution: "TrafficAI",
    department: "Transport Department",
    submittedOn: "2 Sep 2026",
    status: "Pending",
  },
];

function MyApplications() {
  const navigate = useNavigate();

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, "-");
  };

  const getStatusIcon = (status) => {
    if (status === "Approved") {
      return <CheckCircle size={18} />;
    }

    if (status === "Under Review") {
      return <Clock size={18} />;
    }

    return <Clock size={18} />;
  };

  return (
    <div className="applications-page">
      <div className="applications-container">
        {/* Header */}
        <div className="applications-header">
          <button
            className="back-button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <h1>My Applications</h1>
          <p>
            Track the status of your applications submitted to government
            challenges.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="application-summary">
          <div className="summary-card">
            <div className="summary-icon">
              <FileText size={22} />
            </div>
            <div>
              <h3>{applications.length}</h3>
              <p>Total Applications</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <Clock size={22} />
            </div>
            <div>
              <h3>
                {
                  applications.filter(
                    (app) =>
                      app.status === "Pending" ||
                      app.status === "Under Review"
                  ).length
                }
              </h3>
              <p>In Progress</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <CheckCircle size={22} />
            </div>
            <div>
              <h3>
                {
                  applications.filter(
                    (app) => app.status === "Approved"
                  ).length
                }
              </h3>
              <p>Approved</p>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="applications-list">
          <h2>Submitted Applications</h2>

          {applications.map((application) => (
            <div className="application-card" key={application.id}>
              <div className="application-main">
                <div className="application-title-row">
                  <div>
                    <span className="application-id">
                      {application.id}
                    </span>

                    <h3>{application.challenge}</h3>
                  </div>

                  <div
                    className={`application-status ${getStatusClass(
                      application.status
                    )}`}
                  >
                    {getStatusIcon(application.status)}
                    {application.status}
                  </div>
                </div>

                <div className="application-info">
                  <div>
                    <FileText size={17} />
                    <span>
                      <strong>Solution:</strong>{" "}
                      {application.solution}
                    </span>
                  </div>

                  <div>
                    <Building2 size={17} />
                    <span>
                      <strong>Department:</strong>{" "}
                      {application.department}
                    </span>
                  </div>

                  <div>
                    <Calendar size={17} />
                    <span>
                      <strong>Submitted:</strong>{" "}
                      {application.submittedOn}
                    </span>
                  </div>
                </div>
              </div>

              <div className="application-actions">
                <button
                  className="view-button"
                  onClick={() =>
                    navigate(`/challenges/${application.challengeId}`)
                  }
                >
                  <Eye size={17} />
                  View Challenge
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyApplications;



