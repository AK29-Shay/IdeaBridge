import React, { useEffect } from 'react'
import './ProjectDetailsModal.css'

const ProjectDetailsModal = ({ project, onClose }) => {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Render star rating
  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<span key={i} className="star filled">★</span>)
      } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(<span key={i} className="star half-filled">★</span>)
      } else {
        stars.push(<span key={i} className="star empty">☆</span>)
      }
    }
    return stars
  }

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Get image URL with fallback
  const getImageUrl = () => {
    if (project.image) return project.image
    return `https://picsum.photos/seed/${project._id}/800/600`
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'New': return 'detail-status-new'
      case 'Approved': return 'detail-status-approved'
      case 'Completed': return 'detail-status-completed'
      default: return 'detail-status-new'
    }
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return '#2A9D8F'
      case 'Medium': return '#F4A261'
      case 'Hard': return '#E76F51'
      default: return '#6B5B50'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        {/* Modal Content */}
        <div className="modal-content">
          {/* Left Column - Image */}
          <div className="modal-image-section">
            <img 
              src={getImageUrl()} 
              alt={project.title}
              className="modal-project-image"
              onError={(e) => {
                e.target.src = 'https://picsum.photos/seed/fallback/800/600'
              }}
            />
            
            {/* Quick Info Cards */}
            <div className="quick-info-cards">
              <div className="info-card">
                <span className="info-card-icon">📅</span>
                <div className="info-card-content">
                  <span className="info-card-label">Release Date</span>
                  <span className="info-card-value">{formatDate(project.releaseDate)}</span>
                </div>
              </div>
              
              <div className="info-card">
                <span className="info-card-icon">👥</span>
                <div className="info-card-content">
                  <span className="info-card-label">Team Size</span>
                  <span className="info-card-value">{project.teamSize || 'N/A'} members</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="modal-details-section">
            {/* Title */}
            <h2 id="modal-title" className="modal-project-title">{project.title}</h2>

            {/* Rating */}
            {project.rating && (
              <div className="modal-rating">
                <div className="stars">
                  {renderStars(project.rating)}
                </div>
                <span className="rating-text">{project.rating.toFixed(1)}/5.0</span>
              </div>
            )}

            {/* Description */}
            <div className="modal-description">
              <h3 className="section-title">About This Project</h3>
              {project.fullDescription ? (
                project.fullDescription.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <p>{project.description}</p>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="modal-metadata">
              <h3 className="section-title">Project Details</h3>
              <div className="metadata-grid">
                <div className="metadata-item">
                  <span className="metadata-label">Status</span>
                  <span className={`metadata-badge ${getStatusBadgeClass(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">Difficulty</span>
                  <span 
                    className="metadata-badge difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(project.difficulty) }}
                  >
                    {project.difficulty}
                  </span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">Academic Year</span>
                  <span className="metadata-value">{project.year}</span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">Semester</span>
                  <span className="metadata-value">{project.semester}</span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">Specialization</span>
                  <span className="metadata-badge specialization-badge">{project.specialization}</span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">Category</span>
                  <span className="metadata-badge category-badge">{project.category}</span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">Project Owner</span>
                  <span className="metadata-value">{project.author}</span>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="modal-techstack">
                <h3 className="section-title">Tech Stack</h3>
                <div className="techstack-chips">
                  {project.techStack.map((tech, idx) => (
                    <span key={idx} className="tech-chip">{tech}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="modal-tags">
                <h3 className="section-title">Tags</h3>
                <div className="tags-list">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="tag-item">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub Link */}
            <div className="modal-github">
              {project.githubLink ? (
                <a 
                  href={project.githubLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="github-button"
                >
                  <span className="github-icon">🐙</span>
                  View on GitHub
                </a>
              ) : (
                <div className="github-unavailable">
                  <span className="github-unavailable-icon">🔒</span>
                  <span>GitHub link not available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailsModal
