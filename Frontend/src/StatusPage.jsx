import React, { useState, useEffect } from 'react'

const apiBase = 'http://localhost:5002/api'

// Sample project data for demonstration
const SAMPLE_PROJECTS = [
  {
    _id: '1',
    title: 'AI-Powered Chatbot for Student Support',
    description: 'An intelligent chatbot system designed to assist students with academic queries, course registration, and campus information using natural language processing.',
    category: 'AI',
    specialization: 'AI',
    year: 'Year 3',
    semester: 'Semester 1',
    status: 'Approved',
    difficulty: 'Hard',
    author: 'John Smith',
    tags: ['AI', 'NLP', 'Chatbot', 'Python'],
    createdAt: '2024-01-15'
  },
  {
    _id: '2',
    title: 'Network Security Monitoring Dashboard',
    description: 'A real-time network monitoring system that detects and alerts potential security threats using machine learning algorithms.',
    category: 'Cyber Security',
    specialization: 'Network',
    year: 'Year 4',
    semester: 'Semester 2',
    status: 'New',
    difficulty: 'Medium',
    author: 'Sarah Johnson',
    tags: ['Network', 'Security', 'Monitoring', 'React'],
    createdAt: '2024-02-20'
  },
  {
    _id: '3',
    title: 'E-Commerce Platform with Recommendation Engine',
    description: 'A full-stack e-commerce web application featuring a personalized product recommendation system based on user behavior.',
    category: 'Web',
    specialization: 'SE',
    year: 'Year 2',
    semester: 'Semester 2',
    status: 'Completed',
    difficulty: 'Medium',
    author: 'Mike Chen',
    tags: ['Web', 'E-commerce', 'Recommendation', 'MERN'],
    createdAt: '2024-03-10'
  },
  {
    _id: '4',
    title: 'IoT Smart Home Automation System',
    description: 'An IoT-based home automation solution that allows users to control lights, temperature, and security devices remotely.',
    category: 'IoT',
    specialization: 'System Engineering',
    year: 'Year 3',
    semester: 'Semester 2',
    status: 'Approved',
    difficulty: 'Hard',
    author: 'Emily Davis',
    tags: ['IoT', 'Smart Home', 'Arduino', 'Mobile'],
    createdAt: '2024-01-25'
  },
  {
    _id: '5',
    title: 'Data Visualization Dashboard for Climate Data',
    description: 'Interactive dashboard for visualizing climate change data with predictive analytics and trend analysis.',
    category: 'Data Science',
    specialization: 'Data Science',
    year: 'Year 4',
    semester: 'Semester 1',
    status: 'New',
    difficulty: 'Easy',
    author: 'Alex Wilson',
    tags: ['Data Science', 'Visualization', 'D3.js', 'Python'],
    createdAt: '2024-02-15'
  },
  {
    _id: '6',
    title: 'Mobile Banking Application with Biometric Auth',
    description: 'Secure mobile banking app featuring fingerprint and facial recognition authentication.',
    category: 'Mobile',
    specialization: 'SE',
    year: 'Year 3',
    semester: 'Semester 1',
    status: 'Approved',
    difficulty: 'Hard',
    author: 'Lisa Brown',
    tags: ['Mobile', 'Security', 'Biometric', 'Flutter'],
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
                  <button className="view-project-btn">
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
    </div>
  )
}
