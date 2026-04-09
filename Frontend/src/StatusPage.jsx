import React, { useState, useEffect } from 'react'
import ProjectDetailsModal from './components/ProjectDetailsModal'

const apiBase = 'http://localhost:5002/api'

// Sample project data for demonstration
const SAMPLE_PROJECTS = [
  {
    _id: '1',
    title: 'AI-Powered Chatbot for Student Support',
    description: 'An intelligent chatbot system designed to assist students with academic queries, course registration, and campus information using natural language processing.',
    fullDescription: 'This comprehensive AI-powered chatbot system leverages advanced natural language processing (NLP) techniques to provide real-time assistance to students. The system is built using state-of-the-art transformer models fine-tuned on academic queries.\n\nKey features include automated course registration assistance, campus navigation help, FAQ answering, and integration with university databases for personalized responses. The chatbot supports multiple languages and learns from interactions to improve accuracy over time.\n\nThe project was developed over 6 months using Python, TensorFlow, and deployed on AWS with a React-based admin dashboard for monitoring and training.',
    image: 'https://picsum.photos/seed/chatbot/800/600',
    rating: 4.5,
    githubLink: 'https://github.com/example/ai-chatbot',
    category: 'AI',
    specialization: 'AI',
    year: 'Year 3',
    semester: 'Semester 1',
    status: 'Approved',
    difficulty: 'Hard',
    author: 'John Smith',
    teamSize: 4,
    tags: ['AI', 'NLP', 'Chatbot', 'Python'],
    techStack: ['Python', 'TensorFlow', 'React', 'Node.js', 'MongoDB', 'AWS'],
    releaseDate: '2024-01-15',
    createdAt: '2024-01-15'
  },
  {
    _id: '2',
    title: 'Network Security Monitoring Dashboard',
    description: 'A real-time network monitoring system that detects and alerts potential security threats using machine learning algorithms.',
    fullDescription: 'An enterprise-grade network security monitoring dashboard that provides real-time visibility into network traffic, potential threats, and security incidents. The system uses advanced machine learning algorithms to detect anomalies and predict potential security breaches before they occur.\n\nThe dashboard features customizable alerts, detailed incident reports, network topology visualization, and integration with popular SIEM tools. It supports monitoring of multiple network segments and provides actionable insights for security teams.\n\nBuilt with React for the frontend, Node.js for the backend, and Elasticsearch for log analysis, this solution handles over 10,000 events per second with minimal latency.',
    image: 'https://picsum.photos/seed/security/800/600',
    rating: 4.7,
    githubLink: 'https://github.com/example/security-dashboard',
    category: 'Cyber Security',
    specialization: 'Network',
    year: 'Year 4',
    semester: 'Semester 2',
    status: 'New',
    difficulty: 'Medium',
    author: 'Sarah Johnson',
    teamSize: 3,
    tags: ['Network', 'Security', 'Monitoring', 'React'],
    techStack: ['React', 'Node.js', 'Elasticsearch', 'Redis', 'Docker', 'Grafana'],
    releaseDate: '2024-02-20',
    createdAt: '2024-02-20'
  },
  {
    _id: '3',
    title: 'E-Commerce Platform with Recommendation Engine',
    description: 'A full-stack e-commerce web application featuring a personalized product recommendation system based on user behavior.',
    fullDescription: 'A modern, scalable e-commerce platform that combines traditional online shopping features with an intelligent recommendation engine. The system analyzes user browsing patterns, purchase history, and preferences to provide personalized product suggestions.\n\nThe platform includes a product catalog with advanced search and filtering, shopping cart with secure checkout, order tracking, user reviews and ratings, and an admin dashboard for inventory management. The recommendation engine uses collaborative filtering and content-based approaches to achieve high accuracy.\n\nDeveloped using the MERN stack with Redux for state management, Stripe for payment processing, and deployed on Vercel with MongoDB Atlas for database hosting.',
    image: 'https://picsum.photos/seed/ecommerce/800/600',
    rating: 4.3,
    githubLink: 'https://github.com/example/ecommerce-platform',
    category: 'Web',
    specialization: 'SE',
    year: 'Year 2',
    semester: 'Semester 2',
    status: 'Completed',
    difficulty: 'Medium',
    author: 'Mike Chen',
    teamSize: 5,
    tags: ['Web', 'E-commerce', 'Recommendation', 'MERN'],
    techStack: ['MongoDB', 'Express.js', 'React', 'Node.js', 'Redux', 'Stripe'],
    releaseDate: '2024-03-10',
    createdAt: '2024-03-10'
  },
  {
    _id: '4',
    title: 'IoT Smart Home Automation System',
    description: 'An IoT-based home automation solution that allows users to control lights, temperature, and security devices remotely.',
    fullDescription: 'A comprehensive smart home automation system that integrates various IoT devices including sensors, actuators, and controllers into a unified platform. Users can control lighting, HVAC systems, security cameras, and door locks through a mobile app or web interface.\n\nThe system supports automation rules, scheduled tasks, voice control integration, and energy consumption monitoring. It uses MQTT protocol for device communication and provides real-time notifications for security events.\n\nBuilt on Arduino and Raspberry Pi hardware with a cloud-based backend for remote access and data storage.',
    image: 'https://picsum.photos/seed/smarthome/800/600',
    rating: 4.1,
    githubLink: null,
    category: 'IoT',
    specialization: 'System Engineering',
    year: 'Year 3',
    semester: 'Semester 2',
    status: 'Approved',
    difficulty: 'Hard',
    author: 'Emily Davis',
    teamSize: 3,
    tags: ['IoT', 'Smart Home', 'Arduino', 'Mobile'],
    techStack: ['Arduino', 'Raspberry Pi', 'MQTT', 'React Native', 'Firebase'],
    releaseDate: '2024-01-25',
    createdAt: '2024-01-25'
  },
  {
    _id: '5',
    title: 'Data Visualization Dashboard for Climate Data',
    description: 'Interactive dashboard for visualizing climate change data with predictive analytics and trend analysis.',
    fullDescription: 'An interactive data visualization platform that transforms complex climate datasets into intuitive charts, graphs, and maps. The dashboard enables researchers and policymakers to explore historical climate trends, compare regional data, and access predictive models.\n\nFeatures include time-series analysis, geographic heat maps, customizable dashboards, data export capabilities, and integration with public climate APIs. The system processes over 1 million data points from sources like NASA and NOAA.\n\nDeveloped with D3.js for custom visualizations, Python for data processing, and deployed as a Progressive Web App (PWA) for offline access.',
    image: 'https://picsum.photos/seed/climate/800/600',
    rating: 4.6,
    githubLink: 'https://github.com/example/climate-dashboard',
    category: 'Data Science',
    specialization: 'Data Science',
    year: 'Year 4',
    semester: 'Semester 1',
    status: 'New',
    difficulty: 'Easy',
    author: 'Alex Wilson',
    teamSize: 2,
    tags: ['Data Science', 'Visualization', 'D3.js', 'Python'],
    techStack: ['D3.js', 'Python', 'Flask', 'PostgreSQL', 'React'],
    releaseDate: '2024-02-15',
    createdAt: '2024-02-15'
  },
  {
    _id: '6',
    title: 'Mobile Banking Application with Biometric Auth',
    description: 'Secure mobile banking app featuring fingerprint and facial recognition authentication.',
    fullDescription: 'A secure and user-friendly mobile banking application that provides comprehensive financial services on the go. The app features biometric authentication using fingerprint and facial recognition for enhanced security.\n\nCore features include account balance checking, fund transfers, bill payments, transaction history, budget tracking, and push notifications for account activities. The app implements end-to-end encryption and complies with banking security standards.\n\nDeveloped using Flutter for cross-platform compatibility with a Node.js backend and PostgreSQL database.',
    image: null,
    rating: 3.9,
    githubLink: null,
    category: 'Mobile',
    specialization: 'SE',
    year: 'Year 3',
    semester: 'Semester 1',
    status: 'Approved',
    difficulty: 'Hard',
    author: 'Lisa Brown',
    teamSize: 4,
    tags: ['Mobile', 'Security', 'Biometric', 'Flutter'],
    techStack: ['Flutter', 'Dart', 'Node.js', 'PostgreSQL', 'JWT'],
    releaseDate: '2024-03-05',
    createdAt: '2024-03-05'
  }
];

export default function StatusPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [systemHealth, setSystemHealth] = useState({ status: 'checking', message: 'Checking system...' })
  
  // Search and filter states for relevance scoring
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    year: '',
    semester: '',
    specialization: '',
    category: ''
  })
  
  // Modal state
  const [selectedProject, setSelectedProject] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchStats()
    checkSystemHealth()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${apiBase}/search/filters`)
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (err) {
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const checkSystemHealth = async () => {
    try {
      const start = Date.now()
      const res = await fetch(`${apiBase}/search?q=test&limit=1`)
      const latency = Date.now() - start
      
      if (res.ok) {
        setSystemHealth({
          status: 'healthy',
          message: `System Online • ${latency}ms latency`,
          latency
        })
      } else {
        setSystemHealth({
          status: 'error',
          message: 'System Error'
        })
      }
    } catch {
      setSystemHealth({
        status: 'offline',
        message: 'System Offline'
      })
    }
  }

  const getTotalProjects = () => {
    if (!stats?.counts?.byCategory) return 0
    return Object.values(stats.counts.byCategory).reduce((a, b) => a + b, 0)
  }

  const getTopCategory = () => {
    if (!stats?.counts?.byCategory) return null
    const entries = Object.entries(stats.counts.byCategory)
    if (entries.length === 0) return null
    return entries.sort((a, b) => b[1] - a[1])[0]
  }

  const getTopFaculty = () => {
    if (!stats?.counts?.byFaculty) return null
    const entries = Object.entries(stats.counts.byFaculty)
    if (entries.length === 0) return null
    return entries.sort((a, b) => b[1] - a[1])[0]
  }

  // Calculate relevance score for a project based on search/filters
  const calculateRelevanceScore = (project) => {
    let score = 0
    const keyword = searchKeyword.toLowerCase().trim()
    
    // Keyword matching (highest weight)
    if (keyword) {
      const titleMatch = project.title.toLowerCase().includes(keyword)
      const descMatch = project.description.toLowerCase().includes(keyword)
      const tagMatch = project.tags.some(tag => tag.toLowerCase().includes(keyword))
      const categoryMatch = project.category.toLowerCase().includes(keyword)
      const specMatch = project.specialization.toLowerCase().includes(keyword)
      
      if (titleMatch) score += 40
      if (descMatch) score += 20
      if (tagMatch) score += 25
      if (categoryMatch) score += 30
      if (specMatch) score += 30
    }
    
    // Filter matching
    if (selectedFilters.year && project.year === selectedFilters.year) score += 15
    if (selectedFilters.semester && project.semester === selectedFilters.semester) score += 15
    if (selectedFilters.specialization && project.specialization === selectedFilters.specialization) score += 20
    if (selectedFilters.category && project.category === selectedFilters.category) score += 20
    
    // Bonus for approved/completed projects
    if (project.status === 'Approved') score += 5
    if (project.status === 'Completed') score += 3
    
    return score
  }

  // Get top 3 most relevant projects
  const getTopRelevantProjects = () => {
    const hasSearchOrFilters = searchKeyword || 
      selectedFilters.year || 
      selectedFilters.semester || 
      selectedFilters.specialization || 
      selectedFilters.category
    
    let projects = [...SAMPLE_PROJECTS]
    
    if (hasSearchOrFilters) {
      // Calculate scores and sort by relevance
      projects = projects.map(project => ({
        ...project,
        relevanceScore: calculateRelevanceScore(project)
      })).sort((a, b) => b.relevanceScore - a.relevanceScore)
      
      // Filter out projects with 0 relevance if we have search/filters
      projects = projects.filter(p => p.relevanceScore > 0)
    } else {
      // No search/filters - show latest projects
      projects = projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    
    return projects.slice(0, 3)
  }

  // Get match percentage for display
  const getMatchPercentage = (project) => {
    const maxPossibleScore = 140 // Approximate max score
    const percentage = Math.min(100, Math.round((project.relevanceScore / maxPossibleScore) * 100))
    return percentage
  }

  // Handle view details button click
  const handleViewDetails = (project) => {
    setSelectedProject(project)
    setShowDetailsModal(true)
  }

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'New': return 'status-new'
      case 'Approved': return 'status-approved'
      case 'Completed': return 'status-completed'
      default: return 'status-new'
    }
  }

  return (
    <div className="status-page">
      <header className="status-header">
        <div className="logo-section">
          <div className="logo">💡</div>
          <div>
            <h1>IdeaBridge Status</h1>
            <p className="subtitle">System Overview & Analytics</p>
          </div>
        </div>
        <a href="/" className="back-link">← Back to Search</a>
      </header>

      {/* System Health */}
      <div className={`health-card ${systemHealth.status}`}>
        <div className="health-indicator"></div>
        <div className="health-content">
          <h2>System Status</h2>
          <p className="health-message">{systemHealth.message}</p>
        </div>
        <button className="refresh-btn" onClick={checkSystemHealth}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={fetchStats}>Try Again</button>
        </div>
      ) : stats ? (
        <>
          {/* Main Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <span className="stat-value">{getTotalProjects()}</span>
                <span className="stat-label">Total Projects</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏛️</div>
              <div className="stat-info">
                <span className="stat-value">{stats.faculties?.length || 5}</span>
                <span className="stat-label">Faculties</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <span className="stat-value">80</span>
                <span className="stat-label">Courses</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏷️</div>
              <div className="stat-info">
                <span className="stat-value">{stats.categories?.length || 9}</span>
                <span className="stat-label">Categories</span>
              </div>
            </div>
          </div>

          {/* Top 3 Relevant Projects Section */}
          <section className="top-projects-section">
            <div className="section-header">
              <h2>✨ Top 3 Relevant Projects</h2>
              <p className="section-subtitle">
                {searchKeyword || selectedFilters.year || selectedFilters.specialization 
                  ? 'Best matches for your search criteria' 
                  : 'Recommended projects for you'}
              </p>
            </div>
            
            <div className="top-projects-grid">
              {getTopRelevantProjects().map((project, index) => (
                <div key={project._id} className={`top-project-card rank-${index + 1}`}>
                  {/* Rank Badge */}
                  <div className="rank-badge">#{index + 1}</div>
                  
                  {/* Relevance Score */}
                  {(searchKeyword || selectedFilters.year || selectedFilters.specialization) && project.relevanceScore > 0 && (
                    <div className="relevance-badge">
                      <span className="match-percentage">{getMatchPercentage(project)}%</span>
                      <span className="match-label">Match</span>
                    </div>
                  )}
                  
                  {/* Card Content */}
                  <div className="project-content">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description">
                      {project.description.length > 120 
                        ? project.description.substring(0, 120) + '...' 
                        : project.description}
                    </p>
                    
                    {/* Project Meta */}
                    <div className="project-meta">
                      <span className="meta-tag specialization">{project.specialization}</span>
                      <span className="meta-tag category">{project.category}</span>
                      <span className={`meta-tag status ${getStatusBadgeClass(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    {/* Year & Semester */}
                    <div className="project-academic">
                      <span className="academic-info">{project.year}</span>
                      <span className="academic-separator">•</span>
                      <span className="academic-info">{project.semester}</span>
                      <span className="academic-separator">•</span>
                      <span className="academic-info difficulty">{project.difficulty}</span>
                    </div>
                    
                    {/* Tags */}
                    <div className="project-tags">
                      {project.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="tag">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button className="view-project-btn" onClick={() => handleViewDetails(project)}>
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Top Performers */}
          <div className="top-section">
            <div className="top-card">
              <h3>🏆 Top Category</h3>
              {getTopCategory() ? (
                <div className="top-content">
                  <span className="top-name">{getTopCategory()[0]}</span>
                  <span className="top-count">{getTopCategory()[1]} projects</span>
                </div>
              ) : (
                <p className="no-data">No data available</p>
              )}
            </div>

            <div className="top-card">
              <h3>🎓 Top Faculty</h3>
              {getTopFaculty() ? (
                <div className="top-content">
                  <span className="top-name">{getTopFaculty()[0]}</span>
                  <span className="top-count">{getTopFaculty()[1]} projects</span>
                </div>
              ) : (
                <p className="no-data">No data available</p>
              )}
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="distribution-section">
            <div className="dist-card">
              <h3>Projects by Category</h3>
              <div className="bar-chart">
                {stats.counts?.byCategory && Object.entries(stats.counts.byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count]) => {
                    const max = Math.max(...Object.values(stats.counts.byCategory))
                    const percentage = (count / max) * 100
                    return (
                      <div key={name} className="bar-item">
                        <span className="bar-label">{name}</span>
                        <div className="bar-wrapper">
                          <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="bar-value">{count}</span>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="dist-card">
              <h3>Projects by Faculty</h3>
              <div className="bar-chart">
                {stats.counts?.byFaculty && Object.entries(stats.counts.byFaculty)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count]) => {
                    const max = Math.max(...Object.values(stats.counts.byFaculty))
                    const percentage = (count / max) * 100
                    return (
                      <div key={name} className="bar-item">
                        <span className="bar-label">{name}</span>
                        <div className="bar-wrapper">
                          <div className="bar-fill faculty" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="bar-value">{count}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>

          {/* API Status */}
          <div className="api-status">
            <h3>API Endpoints</h3>
            <div className="endpoint-list">
              <div className="endpoint-item">
                <span className="endpoint-method">GET</span>
                <span className="endpoint-path">/api/search</span>
                <span className="endpoint-status active">✓ Active</span>
              </div>
              <div className="endpoint-item">
                <span className="endpoint-method">GET</span>
                <span className="endpoint-path">/api/search/filters</span>
                <span className="endpoint-status active">✓ Active</span>
              </div>
              <div className="endpoint-item">
                <span className="endpoint-method">GET</span>
                <span className="endpoint-path">/api/search/tags</span>
                <span className="endpoint-status active">✓ Active</span>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <footer className="status-footer">
        <p>IdeaBridge Project Status Dashboard • Last updated: {new Date().toLocaleString()}</p>
      </footer>
      
      {/* Project Details Modal */}
      {showDetailsModal && selectedProject && (
        <ProjectDetailsModal 
          project={selectedProject} 
          onClose={() => setShowDetailsModal(false)} 
        />
      )}
    </div>
  )
}
