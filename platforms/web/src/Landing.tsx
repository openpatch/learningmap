import { useNavigate } from "react-router-dom";
import "./Landing.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LearningMap } from "@learningmap/learningmap";
import "@learningmap/learningmap/index.css";
import demoMapRaw from "./getting-started.learningmap?raw";
import type { RoadmapData } from "@learningmap/learningmap";

function Landing() {
  const navigate = useNavigate();
  
  // Parse the demo map from raw JSON
  const demoMap: RoadmapData = JSON.parse(demoMapRaw);

  return (
    <div className="landing-container">
      <Header>
        <button onClick={() => navigate("/teach")} className="nav-button">
          For Teachers
        </button>
        <button onClick={() => navigate("/learn")} className="nav-button">
          For Students
        </button>
      </Header>

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          Interactive visual maps for teaching, learning, and collaborating
        </h1>
        <p className="hero-subtitle">
          All stored locally in your browser—ensuring privacy and offline
          access.
        </p>
      </section>

      {/* Role Selection */}
      <section className="role-section">
        <div className="role-card">
          <div className="role-icon">👩‍🏫</div>
          <h3>I'm a Teacher</h3>
          <p>
            Create learning maps and share them with your students. Manage your
            collection and track what you've built.
          </p>
          <button
            onClick={() => navigate("/teach")}
            className="role-button role-button-primary"
          >
            Go to My Maps
          </button>
        </div>
        <div className="role-card">
          <div className="role-icon">👨‍🎓</div>
          <h3>I'm a Student</h3>
          <p>
            Access learning maps shared by your teachers. Track your progress
            and work through topics at your own pace.
          </p>
          <button
            onClick={() => navigate("/learn")}
            className="role-button role-button-secondary"
          >
            Go to My Learning
          </button>
        </div>
      </section>

      {/* Demo LearningMap */}
      <section className="demo-section">
        <h2 className="demo-title">Try It Out: Interactive Demo</h2>
        <p className="demo-subtitle">
          Explore this interactive learning map to see how it works. Click on
          nodes to learn more!
        </p>
        <div className="demo-map-container">
          <LearningMap roadmapData={demoMap} />
        </div>
      </section>

      {/* Teacher-Student Use Case */}
      <section className="use-case-section">
        <div className="use-case-content">
          <h2>Perfect for Teachers and Students</h2>
          <p>
            Teachers can build custom LearningMaps and share them instantly with
            their class. Students can edit or study the same map, with every
            change kept locally in their own browser. No accounts required, no
            data collected—just pure learning.
          </p>
        </div>
      </section>

      {/* Featured LearningMaps
      <section className="featured-section">
        <h2 className="featured-title">Featured LearningMaps</h2>
        <p className="featured-subtitle">
          All maps are both editable and learnable—customize them or follow along!
        </p>
        <div className="featured-grid">
          {featuredMaps.map((map) => (
            <div key={map.id} className="featured-card">
              <div className="card-thumbnail" aria-label="Map thumbnail">
                {map.thumbnail}
              </div>
              <h3 className="card-title">{map.title}</h3>
              <p className="card-description">{map.description}</p>
              <div className="card-footer">
                <button 
                  onClick={() => navigate(map.editUrl)} 
                  className="card-button card-button-edit"
                  aria-label={`Edit ${map.title}`}
                >
                  Edit
                </button>
                <button 
                  onClick={() => navigate(map.learnUrl)} 
                  className="card-button card-button-learn"
                  aria-label={`Learn ${map.title}`}
                >
                  Learn
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      */}

      {/* Local Storage Note */}
      <section className="info-banner">
        <div className="info-content">
          <strong>🔒 Privacy First:</strong> All maps are saved locally in your
          browser, ensuring complete privacy and offline access. Your data never
          leaves your device.
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;
