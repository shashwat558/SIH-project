import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import {
  Search,
  Calendar,
  Building2,
  MapPin,
  ArrowRight,
  Filter,
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
  },
];

function BrowseChallenges() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      category === "All" || challenge.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="challenges-page">

      {/* Header */}
      <div className="challenges-header">
        <div>
          <h1>Browse Government Challenges</h1>
          <p>
            Discover opportunities where your startup can provide solutions.
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="challenge-filters">

        <div className="search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filter">
          <Filter size={18} />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="CleanTech">CleanTech</option>
            <option value="Artificial Intelligence">
              Artificial Intelligence
            </option>
            <option value="Healthcare">Healthcare</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Education">Education</option>
          </select>
        </div>

      </div>

      {/* Results count */}
      <div className="challenge-results">
        <h2>Available Challenges</h2>
        <span>{filteredChallenges.length} challenges found</span>
      </div>

      {/* Challenge Cards */}
      <div className="challenge-grid">

        {filteredChallenges.length > 0 ? (
          filteredChallenges.map((challenge) => (
            <div className="challenge-card" key={challenge.id}>

              <div className="challenge-card-header">
                <span className="category-badge">
                  {challenge.category}
                </span>

                <span className="deadline">
                  <Calendar size={15} />
                  {challenge.deadline}
                </span>
              </div>

              <h3>{challenge.title}</h3>

              <div className="challenge-info">
                <p>
                  <Building2 size={17} />
                  {challenge.department}
                </p>

                <p>
                  <MapPin size={17} />
                  {challenge.location}
                </p>
              </div>

              <p className="challenge-description">
                {challenge.description}
              </p>

              <button
                className="details-button"
                onClick={() => navigate(`/challenges/${challenge.id}`)}
              >
                View Details
                <ArrowRight size={18} />
              </button>

            </div>
          ))
        ) : (
          <div className="no-results">
            <Search size={40} />
            <h3>No challenges found</h3>
            <p>
              Try changing your search or category filter.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}

export default BrowseChallenges;


