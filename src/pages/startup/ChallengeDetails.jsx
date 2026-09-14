import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Building2,
  MapPin,
  Tag,
  CheckCircle,
} from "lucide-react";

const challenges = [
  {
    id: 1,
    title: "Smart City Waste Management",
    department: "Urban Development Department",
    category: "CleanTech",
    location: "Madhya Pradesh",
    deadline: "30 Sep 2026",
    description:
      "Develop an innovative technology solution for efficient waste collection, segregation, and monitoring in urban areas.",
    requirements: [
      "Technology-based waste management solution",
      "Real-time monitoring capability",
      "Scalable for urban areas",
      "Citizen-friendly interface",
    ],
  },
  {
    id: 2,
    title: "AI Based Traffic Management",
    department: "Transport Department",
    category: "Artificial Intelligence",
    location: "Delhi",
    deadline: "15 Oct 2026",
    description:
      "Build an AI-powered system to analyze traffic patterns and improve traffic flow across major city intersections.",
    requirements: [
      "AI-based traffic analysis",
      "Real-time traffic monitoring",
      "Traffic prediction capability",
      "Scalable solution",
    ],
  },
  {
    id: 3,
    title: "Digital Healthcare Platform",
    department: "Health Department",
    category: "Healthcare",
    location: "Maharashtra",
    deadline: "20 Oct 2026",
    description:
      "Create a digital platform that improves access to healthcare services for citizens in rural and urban areas.",
    requirements: [
      "Digital healthcare services",
      "Patient-friendly interface",
      "Secure data handling",
      "Support for rural users",
    ],
  },
  {
    id: 4,
    title: "Smart Agriculture Monitoring",
    department: "Agriculture Department",
    category: "Agriculture",
    location: "Punjab",
    deadline: "5 Nov 2026",
    description:
      "Develop a smart agriculture solution using sensors and technology to monitor crops and improve farm productivity.",
    requirements: [
      "Crop monitoring",
      "Agricultural data collection",
      "Farmer-friendly interface",
      "Productivity improvement",
    ],
  },
  {
    id: 5,
    title: "Digital Education Access",
    department: "Education Department",
    category: "Education",
    location: "Rajasthan",
    deadline: "12 Nov 2026",
    description:
      "Build a platform that improves access to quality digital education for students in underserved regions.",
    requirements: [
      "Online learning platform",
      "Accessible for students",
      "Low-bandwidth support",
      "Educational content management",
    ],
  },
  {
    id: 6,
    title: "Renewable Energy Monitoring",
    department: "Energy Department",
    category: "CleanTech",
    location: "Gujarat",
    deadline: "25 Nov 2026",
    description:
      "Create a monitoring platform for tracking renewable energy generation and improving energy efficiency.",
    requirements: [
      "Energy generation monitoring",
      "Real-time data",
      "Analytics dashboard",
      "Energy efficiency tracking",
    ],
  },
];

function ChallengeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const challenge = challenges.find(
    (item) => item.id === Number(id)
  );

  if (!challenge) {
    return (
      <div className="details-page">
        <button
          className="back-button"
          onClick={() => navigate("/challenges")}
        >
          <ArrowLeft size={18} />
          Back to Challenges
        </button>

        <div className="not-found">
          <h2>Challenge not found</h2>
          <p>The challenge you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="details-page">

      {/* Back button */}
      <button
        className="back-button"
        onClick={() => navigate("/challenges")}
      >
        <ArrowLeft size={18} />
        Back to Challenges
      </button>

      {/* Main card */}
      <div className="details-card">

        {/* Header */}
        <div className="details-header">

          <div>
            <span className="category-badge">
              {challenge.category}
            </span>

            <h1>{challenge.title}</h1>
          </div>

          <div className="deadline-large">
            <Calendar size={20} />
            <div>
              <span>Application Deadline</span>
              <strong>{challenge.deadline}</strong>
            </div>
          </div>

        </div>

        {/* Information */}
        <div className="details-info">

          <div className="info-item">
            <Building2 size={20} />
            <div>
              <span>Department</span>
              <strong>{challenge.department}</strong>
            </div>
          </div>

          <div className="info-item">
            <MapPin size={20} />
            <div>
              <span>Location</span>
              <strong>{challenge.location}</strong>
            </div>
          </div>

          <div className="info-item">
            <Tag size={20} />
            <div>
              <span>Category</span>
              <strong>{challenge.category}</strong>
            </div>
          </div>

        </div>

        {/* Description */}
        <div className="details-section">
          <h2>About the Challenge</h2>

          <p>{challenge.description}</p>
        </div>

        {/* Requirements */}
        <div className="details-section">
          <h2>Requirements</h2>

          <ul className="requirements-list">
            {challenge.requirements.map((requirement, index) => (
              <li key={index}>
                <CheckCircle size={18} />
                {requirement}
              </li>
            ))}
          </ul>
        </div>

        {/* Apply */}
        <div className="apply-section">

          <div>
            <h3>Have a solution for this challenge?</h3>
            <p>
              Submit your startup solution before the application deadline.
            </p>
          </div>

          <button
            className="apply-button"
            onClick={() => navigate(`/apply/${challenge.id}`)}
          >
            Apply Now
          </button>

        </div>

      </div>
    </div>
  );
}

export default ChallengeDetails;


