import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Upload,
  FileText,
  CheckCircle,
} from "lucide-react";

function ApplyChallenge() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    startupName: "",
    contactPerson: "",
    solutionTitle: "",
    solutionDescription: "",
    challengeSolution: "",
    expectedImpact: "",
    technology: "",
  });

  const [document, setDocument] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setDocument(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Challenge ID:", id);
    console.log("Application:", formData);
    console.log("Document:", document);

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="application-success">

        <div className="success-card">
          <div className="success-icon">
            <CheckCircle size={60} />
          </div>

          <h1>Application Submitted!</h1>

          <p>
            Your solution has been submitted successfully.
            You can track the status of your application from
            My Applications.
          </p>

          <div className="success-actions">
            <button
              onClick={() => navigate("/applications")}
              className="primary-button"
            >
              View My Applications
            </button>

            <button
              onClick={() => navigate("/challenges")}
              className="secondary-button"
            >
              Browse More Challenges
            </button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="apply-page">

      {/* Back */}
      <button
        className="back-button"
        onClick={() => navigate(`/challenges/${id}`)}
      >
        <ArrowLeft size={18} />
        Back to Challenge
      </button>

      {/* Header */}
      <div className="apply-header">
        <h1>Apply to Challenge</h1>
        <p>
          Submit your startup solution for this government challenge.
        </p>
      </div>

      {/* Form */}
      <form
        className="application-form"
        onSubmit={handleSubmit}
      >

        {/* Startup Information */}
        <div className="application-section">

          <h2>Startup Information</h2>

          <div className="form-grid">

            <div className="form-group">
              <label>Startup Name</label>

              <input
                type="text"
                name="startupName"
                placeholder="Enter startup name"
                value={formData.startupName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Person</label>

              <input
                type="text"
                name="contactPerson"
                placeholder="Enter contact person's name"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>

          </div>

        </div>

        {/* Solution */}
        <div className="application-section">

          <h2>Solution Details</h2>

          <div className="form-grid">

            <div className="form-group full-width">
              <label>Solution Title</label>

              <input
                type="text"
                name="solutionTitle"
                placeholder="Enter the name of your solution"
                value={formData.solutionTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Solution Description</label>

              <textarea
                name="solutionDescription"
                placeholder="Describe your solution..."
                rows="5"
                value={formData.solutionDescription}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>
                How does your solution solve the challenge?
              </label>

              <textarea
                name="challengeSolution"
                placeholder="Explain how your solution addresses the government's challenge..."
                rows="5"
                value={formData.challengeSolution}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Expected Impact</label>

              <textarea
                name="expectedImpact"
                placeholder="Describe the expected social, economic, or environmental impact..."
                rows="4"
                value={formData.expectedImpact}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Technology Used</label>

              <input
                type="text"
                name="technology"
                placeholder="e.g. React, Node.js, AI, IoT..."
                value={formData.technology}
                onChange={handleChange}
                required
              />
            </div>

          </div>

        </div>

        {/* Document */}
        <div className="application-section">

          <h2>Supporting Document</h2>

          <div className="upload-box">

            <Upload size={32} />

            <h3>Upload your solution document</h3>

            <p>
              Upload a PDF or document containing additional
              information about your solution.
            </p>

            <label className="upload-button">
              <FileText size={18} />
              Choose File

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                hidden
              />
            </label>

            {document && (
              <div className="selected-file">
                <FileText size={18} />
                {document.name}
              </div>
            )}

          </div>

        </div>

        {/* Submit */}
        <div className="application-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(`/challenges/${id}`)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="submit-button"
          >
            <Send size={18} />
            Submit Application
          </button>

        </div>

      </form>

    </div>
  );
}

export default ApplyChallenge;



