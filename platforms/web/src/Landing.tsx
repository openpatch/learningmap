import { useNavigate } from 'react-router-dom';
import './Landing.css';
import logo from './logo.svg';

function Landing() {
  const navigate = useNavigate();

  // Featured learning maps with example JSON IDs
  /*
  const featuredMaps = [
    {
      id: 'example-1',
      title: 'Getting Started with Programming',
      description: 'A comprehensive guide to learning programming fundamentals, from variables to functions.',
      thumbnail: '📚',
      editUrl: '/create',
      learnUrl: '/learn',
    },
    {
      id: 'example-2',
      title: 'Web Development Basics',
      description: 'Learn HTML, CSS, and JavaScript to build your first website step by step.',
      thumbnail: '🌐',
      editUrl: '/create',
      learnUrl: '/learn',
    },
    {
      id: 'example-3',
      title: 'Data Science Journey',
      description: 'Explore data analysis, visualization, and machine learning concepts progressively.',
      thumbnail: '📊',
      editUrl: '/create',
      learnUrl: '/learn',
    },
  ];
  */

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="LearningMap Logo" className="logo" />
            <span className="logo-text">Learningmap</span>
          </div>
          <nav className="nav-links">
            <button onClick={() => navigate('/teach')} className="nav-button">
              For Teachers
            </button>
            <button onClick={() => navigate('/learn')} className="nav-button">
              For Students
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          Interactive visual maps for teaching, learning, and collaborating
        </h1>
        <p className="hero-subtitle">
          All stored locally in your browser—ensuring privacy and offline access.
        </p>
      </section>

      {/* Role Selection */}
      <section className="role-section">
        <div className="role-card">
          <div className="role-icon">👩‍🏫</div>
          <h3>I'm a Teacher</h3>
          <p>Create learning maps and share them with your students. Manage your collection and track what you've built.</p>
          <button onClick={() => navigate('/teach')} className="role-button role-button-primary">
            Go to My Maps
          </button>
        </div>
        <div className="role-card">
          <div className="role-icon">👨‍🎓</div>
          <h3>I'm a Student</h3>
          <p>Access learning maps shared by your teachers. Track your progress and work through topics at your own pace.</p>
          <button onClick={() => navigate('/learn')} className="role-button role-button-secondary">
            Go to My Learning
          </button>
        </div>
      </section>

      {/* Teacher-Student Use Case */}
      <section className="use-case-section">
        <div className="use-case-content">
          <h2>Perfect for Teachers and Students</h2>
          <p>
            Teachers can build custom LearningMaps and share them instantly with their class.
            Students can edit or study the same map, with every change kept locally in their
            own browser. No accounts required, no data collected—just pure learning.
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
          <strong>🔒 Privacy First:</strong> All maps are saved locally in your browser,
          ensuring complete privacy and offline access. Your data never leaves your device.
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          Built with ❤️ by <a href="https://openpatch.org" target="_blank" rel="noopener noreferrer">OpenPatch</a>
        </p>
        <p>
          <a href="https://learningmap.openpatch.org" target="_blank" rel="noopener noreferrer">Documentation</a>
          {' • '}
          <a href="https://github.com/openpatch/learningmap" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
      </footer>
    </div>
  );
}

export default Landing;
