import { useState } from "react";
import { User, Building2, Mail, Phone, MapPin, Globe, Save } from "lucide-react";

function StartupProfile() {
  const [formData, setFormData] = useState({
    startupName: "",
    founderName: "",
    email: "",
    phone: "",
    website: "",
    location: "",
    industry: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Startup Profile:", formData);

    alert("Profile saved successfully!");
  };

  return (
    <div className="profile-page">

      {/* Header */}
      <div className="profile-header">
        <div>
          <h1>Startup Profile</h1>
          <p>
            Add and manage your startup information.
          </p>
        </div>
      </div>

      {/* Form */}
      <form className="profile-form" onSubmit={handleSubmit}>

        <div className="form-section">
          <h2>
            <Building2 size={22} />
            Startup Information
          </h2>

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
              <label>Founder Name</label>
              <input
                type="text"
                name="founderName"
                placeholder="Enter founder name"
                value={formData.founderName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={16} />
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="startup@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Phone size={16} />
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                <Globe size={16} />
                Website
              </label>

              <input
                type="url"
                name="website"
                placeholder="https://example.com"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                <MapPin size={16} />
                Location
              </label>

              <input
                type="text"
                name="location"
                placeholder="City, State"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Industry</label>

              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
              >
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Agriculture">Agriculture</option>
                <option value="FinTech">FinTech</option>
                <option value="CleanTech">CleanTech</option>
                <option value="Artificial Intelligence">
                  Artificial Intelligence
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Startup Description</label>

              <textarea
                name="description"
                placeholder="Tell us about your startup, product, and solution..."
                rows="5"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

          </div>
        </div>

        {/* Save button */}
        <div className="form-actions">
          <button type="submit" className="save-button">
            <Save size={18} />
            Save Profile
          </button>
        </div>

      </form>

    </div>
  );
}

export default StartupProfile;