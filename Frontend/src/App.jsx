import React, { useState, useEffect, useCallback, useRef } from 'react'

const apiBase = 'http://localhost:5002/api'

// Local storage keys
const STORAGE_KEYS = {
  FAVORITES: 'ideabridge_favorites',
  THEME: 'ideabridge_theme',
  COLLECTIONS: 'ideabridge_collections',
  COMPARE: 'ideabridge_compare',
  HISTORY: 'ideabridge_history'
};

// Advanced hooks
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  
  return [value, setValue]
}

function useScrollAnimation() {
  const [visibleItems, setVisibleItems] = useState(new Set())
  const observerRef = useRef(null)
  
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, entry.target.dataset.id]))
          }
        })
      },
      { threshold: 0.1 }
    )
    return () => observerRef.current?.disconnect()
  }, [])
  
  const observe = useCallback((el) => {
    if (el) observerRef.current?.observe(el)
  }, [])
  
  return { visibleItems, observe }
}

// Theme hook
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME)
    return saved || 'light'
  })
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')
  return { theme, toggleTheme }
}

function qS(params){
  return Object.keys(params)
    .filter(k=>params[k]!==undefined && params[k]!==null && params[k]!=="")
    .map(k=>encodeURIComponent(k)+"="+encodeURIComponent(params[k]))
    .join('&')
}

// Debounce hook for real-time search
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

// Academic Structure for cascading filters - Year > Semester > Specialization
const ACADEMIC_STRUCTURE = {
  'Year 1': {
    'Semester 1': ['Network', 'SE', 'Data Science', 'Cyber Security', 'System Engineering', 'AI', 'Machine Learning'],
    'Semester 2': ['Network', 'SE', 'Data Science', 'Cyber Security', 'System Engineering', 'AI', 'Machine Learning']
  },
  'Year 2': {
    'Semester 1': ['Network', 'SE', 'Data Science', 'Cyber Security', 'System Engineering', 'AI', 'Machine Learning'],
    'Semester 2': ['Network', 'SE', 'Data Science', 'Cyber Security', 'System Engineering', 'AI', 'Machine Learning']
  },
  'Year 3': {
    'Semester 1': ['Network', 'SE', 'Data Science', 'Cyber Security', 'System Engineering', 'AI', 'Machine Learning'],
    'Semester 2': ['Network', 'SE', 'Data Science', 'Cyber Security', 'System Engineering', 'AI', 'Machine Learning']
  },
  'Year 4': {
    'Semester 1': ['Network', 'SE', 'Data Science', 'Cyber Security', 'System Engineering', 'AI', 'Machine Learning'],
    'Semester 2': ['Network', 'SE', 'Data Science', 'Cyber Security', 'System Engineering', 'AI', 'Machine Learning']
  }
};

// All available specializations for validation and search
const ALL_SPECIALIZATIONS = ['Network', 'SE', 'Data Science', 'Cyber Security', 'System Engineering', 'AI', 'Machine Learning', 'IT'];

// Map specializations to their corresponding categories
const SPECIALIZATION_TO_CATEGORY = {
  'Network': 'Networking',
  'SE': 'Web',
  'Data Science': 'Data Science',
  'Cyber Security': 'Cyber Security',
  'System Engineering': 'Other',
  'AI': 'AI',
  'Machine Learning': 'AI',
  'IT': 'Other'
};

// Validation constants (must match backend)
const VALIDATION = {
  MAX_KEYWORD_LENGTH: 100,
  MAX_PAGE_SIZE: 100,
  MIN_KEYWORD_LENGTH: 2,
  VALID_YEARS: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
  VALID_SEMESTERS: ['Semester 1', 'Semester 2'],
  VALID_CATEGORIES: ['Web', 'Mobile', 'AI', 'IoT', 'Data Science', 'Cyber Security', 'Networking', 'Cloud', 'Other'],
  VALID_DIFFICULTIES: ['Easy', 'Medium', 'Hard'],
  VALID_STATUSES: ['New', 'Approved', 'Completed'],
  // All valid specializations for search validation
  VALID_SPECIALIZATIONS: ALL_SPECIALIZATIONS
};

// Frontend validation functions
function validateKeyword(keyword) {
  if (!keyword) return { isValid: true, error: null };
  
  if (keyword.length < VALIDATION.MIN_KEYWORD_LENGTH) {
    return { isValid: false, error: `Keyword must be at least ${VALIDATION.MIN_KEYWORD_LENGTH} characters` };
  }
  if (keyword.length > VALIDATION.MAX_KEYWORD_LENGTH) {
    return { isValid: false, error: `Keyword must be less than ${VALIDATION.MAX_KEYWORD_LENGTH} characters` };
  }
  // Check for potentially dangerous characters
  if (/[<>\"']/.test(keyword)) {
    return { isValid: false, error: 'Keyword contains invalid characters' };
  }
  return { isValid: true, error: null };
}

// Validate if keyword matches any valid category or specialization
function validateSearchKeywordAgainstValidOptions(keyword) {
  if (!keyword || keyword.trim().length === 0) {
    return { isValid: true, error: null };
  }
  
  const searchTerm = keyword.toLowerCase().trim();
  
  // Check if keyword matches any valid category
  const matchingCategories = VALIDATION.VALID_CATEGORIES.filter(
    cat => cat.toLowerCase().includes(searchTerm) || searchTerm.includes(cat.toLowerCase())
  );
  
  // Check if keyword matches any valid specialization
  const matchingSpecializations = VALIDATION.VALID_SPECIALIZATIONS.filter(
    spec => spec.toLowerCase().includes(searchTerm) || searchTerm.includes(spec.toLowerCase())
  );
  
  // If no matches found, return error
  if (matchingCategories.length === 0 && matchingSpecializations.length === 0) {
    return {
      isValid: false,
      error: `"${keyword}" is not a valid category or specialization. Please search for: Web, Mobile, AI, Network, Data Science, Cyber Security, etc.`,
      suggestions: [...VALIDATION.VALID_CATEGORIES.slice(0, 5), ...VALIDATION.VALID_SPECIALIZATIONS.slice(0, 5)]
    };
  }
  
  return { 
    isValid: true, 
    error: null,
    matches: {
      categories: matchingCategories,
      specializations: matchingSpecializations
    }
  };
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>\"']/g, '').trim();
}

export default function App(){
  // Theme
  const { theme, toggleTheme } = useTheme()
  
  // Search & Filter States
  const [keyword,setKeyword] = useState('')
  const [category,setCategory] = useState('')
  const [difficulty,setDifficulty] = useState('')
  const [year,setYear] = useState('')
  const [semester,setSemester] = useState('')
  const [specialization,setSpecialization] = useState('')
  const [status,setStatus] = useState('')
  
  // UI States
  const [loading,setLoading] = useState(false)
  const [results,setResults] = useState(null)
  const [filterOptions, setFilterOptions] = useState(null)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Feature States
  const [favorites, setFavorites] = useState([])
  const [showFilters, setShowFilters] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [showStats, setShowStats] = useState(false)
  const [animatedStats, setAnimatedStats] = useState({ projects: 0, years: 0, subjects: 0 })
  
  // Advanced Feature States
  const [collections, setCollections] = useLocalStorage(STORAGE_KEYS.COLLECTIONS, [])
  const [compareList, setCompareList] = useLocalStorage(STORAGE_KEYS.COMPARE, [])
  const [searchHistory, setSearchHistory] = useLocalStorage(STORAGE_KEYS.HISTORY, [])
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [showCollectionsModal, setShowCollectionsModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [quickView, setQuickView] = useState(null)
  const { visibleItems, observe } = useScrollAnimation()
  
  // Pagination & Sorting
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  const debouncedKeyword = useDebounce(keyword, 300)
  const searchInputRef = useRef(null)

  // Load filter options on mount
  useEffect(() => {
    fetch(`${apiBase}/search/filters`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setFilterOptions(data.data)
      })
      .catch(() => setFilterOptions(null))
  }, [])

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const favs = localStorage.getItem(STORAGE_KEYS.FAVORITES)
      if (favs) setFavorites(JSON.parse(favs))
    } catch (e) {
      console.error('Error loading from localStorage:', e)
    }
  }, [])

  // Get available semesters based on selected year
  const getAvailableSemesters = () => {
    if (!year) return [];
    return ACADEMIC_STRUCTURE[year] ? Object.keys(ACADEMIC_STRUCTURE[year]) : [];
  };

  // Get available specializations based on selected year and semester
  const getAvailableSpecializations = () => {
    if (!year || !semester) return [];
    return ACADEMIC_STRUCTURE[year]?.[semester] || [];
  };

  // Validate all inputs before search
  const validateInputs = () => {
    const errors = {};
    
    // Validate keyword format
    const keywordValidation = validateKeyword(keyword);
    if (!keywordValidation.isValid) {
      errors.keyword = keywordValidation.error;
    }
    
    // Validate keyword against valid categories and courses
    const searchValidation = validateSearchKeywordAgainstValidOptions(keyword);
    if (!searchValidation.isValid) {
      errors.keyword = searchValidation.error;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Search function
  const doSearch = useCallback(async (pageNum = 1) => {
    // Validate inputs first
    if (!validateInputs()) {
      return;
    }

    // Sanitize inputs
    const sanitizedKeyword = sanitizeInput(keyword);
    const sanitizedCategory = sanitizeInput(category);
    const sanitizedDifficulty = sanitizeInput(difficulty);
    const sanitizedYear = sanitizeInput(year);
    const sanitizedSemester = sanitizeInput(semester);
    const sanitizedSpecialization = sanitizeInput(specialization);
    const sanitizedStatus = sanitizeInput(status);

    const params = {}
    if(sanitizedKeyword) params.keyword = sanitizedKeyword
    if(sanitizedCategory) params.category = sanitizedCategory
    if(sanitizedDifficulty) params.difficulty = sanitizedDifficulty
    if(sanitizedYear) params.year = sanitizedYear
    if(sanitizedSemester) params.semester = sanitizedSemester
    if(sanitizedSpecialization) params.specialization = sanitizedSpecialization
    if(sanitizedStatus) params.status = sanitizedStatus
    params.page = pageNum
    params.limit = Math.min(limit, VALIDATION.MAX_PAGE_SIZE)
    params.sortBy = sortBy
    params.order = order

    const url = apiBase + '/search' + (Object.keys(params).length?('?'+qS(params)):'')
    setLoading(true)
    setError(null)
    try{
      const res = await fetch(url)
      const data = await res.json()
      if(data.success){
        setResults(data.data)
        setTotalResults(data.total)
        setTotalPages(data.totalPages)
        setPage(data.currentPage)
      } else {
        // Handle validation errors from backend
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.join(', '));
        } else {
          setError(data.message || 'Search failed');
        }
        setResults([])
      }
    }catch(e){
      setError('Network error. Please try again.')
      setResults([])
    }finally{
      setLoading(false)
    }
  }, [keyword, category, difficulty, year, semester, specialization, status, limit, sortBy, order])

  // Real-time search when debounced keyword changes
  useEffect(() => {
    if(debouncedKeyword !== undefined){
      doSearch(1)
    }
  }, [debouncedKeyword, category, difficulty, year, semester, specialization, status, sortBy, order, doSearch])

  // Get suggestions based on keyword - only valid categories and specializations
  useEffect(() => {
    if(keyword.length > 1){
      const searchTerm = keyword.toLowerCase();
      
      // Filter valid categories
      const categoryMatches = VALIDATION.VALID_CATEGORIES.filter(cat =>
        cat.toLowerCase().includes(searchTerm)
      );
      
      // Filter valid specializations
      const specializationMatches = VALIDATION.VALID_SPECIALIZATIONS.filter(spec =>
        spec.toLowerCase().includes(searchTerm)
      );
      
      // Combine and limit suggestions
      const allMatches = [...categoryMatches, ...specializationMatches].slice(0, 8);
      setSuggestions(allMatches);
    } else {
      setSuggestions([])
    }
  }, [keyword])

  // Clear all filters
  const clearFilters = () => {
    setKeyword('')
    setCategory('')
    setDifficulty('')
    setYear('')
    setSemester('')
    setSpecialization('')
    setStatus('')
    setPage(1)
    setResults(null)
    setError(null)
  }

  // Remove individual filter
  const removeFilter = (filterType) => {
    switch(filterType){
      case 'keyword': setKeyword(''); break
      case 'category': setCategory(''); break
      case 'difficulty': setDifficulty(''); break
      case 'year': setYear(''); setSemester(''); setSpecialization(''); setCategory(''); break
      case 'semester': setSemester(''); setSpecialization(''); setCategory(''); break
      case 'specialization': setSpecialization(''); setCategory(''); break
      case 'status': setStatus(''); break
    }
  }

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = []
    if(keyword) filters.push({type: 'keyword', label: `Keyword: ${keyword}`})
    if(year) filters.push({type: 'year', label: year})
    if(semester) filters.push({type: 'semester', label: semester})
    if(specialization) filters.push({type: 'specialization', label: specialization})
    if(category) filters.push({type: 'category', label: category})
    if(difficulty) filters.push({type: 'difficulty', label: difficulty})
    if(status) filters.push({type: 'status', label: status})
    return filters
  }

  // Get academic filter path for display (e.g., "Year 1 > Semester 2 > Network")
  const getAcademicFilterPath = () => {
    if (!year) return null;
    const parts = [year];
    if (semester) parts.push(semester);
    if (specialization) parts.push(specialization);
    return parts.join(' > ');
  }

  // Export results to JSON
  const exportResults = () => {
    if(!results || results.length === 0) return
    const dataStr = JSON.stringify(results, null, 2)
    const blob = new Blob([dataStr], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `IdeaBridge-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  // Toggle favorite
  const toggleFavorite = (projectId) => {
    const updated = favorites.includes(projectId)
      ? favorites.filter(id => id !== projectId)
      : [...favorites, projectId]
    setFavorites(updated)
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated))
  }

  // Check if project is favorite
  const isFavorite = (projectId) => favorites.includes(projectId)

  // Add to compare
  const toggleCompare = (project) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === project.id)
      if (exists) return prev.filter(p => p.id !== project.id)
      if (prev.length >= 3) {
        alert('You can compare up to 3 projects at a time')
        return prev
      }
      return [...prev, project]
    })
  }

  const isInCompare = (projectId) => compareList.some(p => p.id === projectId)

  // Collections
  const addToCollection = (project, collectionName) => {
    setCollections(prev => {
      const existing = prev.find(c => c.name === collectionName)
      if (existing) {
        if (existing.projects.includes(project.id)) return prev
        return prev.map(c => c.name === collectionName 
          ? {...c, projects: [...c.projects, project.id]}
          : c
        )
      }
      return [...prev, { name: collectionName, projects: [project.id], created: Date.now() }]
    })
  }

  const createCollection = (name) => {
    if (!collections.find(c => c.name === name)) {
      setCollections(prev => [...prev, { name, projects: [], created: Date.now() }])
    }
  }

  // Share project
  const shareProject = async (project) => {
    const shareData = {
      title: project.title,
      text: `Check out this project: ${project.title} - ${project.description?.slice(0, 100)}...`,
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Copy to clipboard fallback
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
      alert('Project details copied to clipboard!')
    }
  }

  // Quick view
  const openQuickView = (project) => setQuickView(project)
  const closeQuickView = () => setQuickView(null)

  // Add to search history
  const addToHistory = (searchParams) => {
    setSearchHistory(prev => {
      const newEntry = { ...searchParams, timestamp: Date.now(), id: Date.now() }
      const filtered = prev.filter(h => h.keyword !== searchParams.keyword)
      return [newEntry, ...filtered].slice(0, 10)
    })
  }

  const activeFilters = getActiveFilters()

  // Animated statistics effect
  useEffect(() => {
    if (filterOptions) {
      const duration = 1500
      const steps = 30
      const interval = duration / steps
      
      let step = 0
      const timer = setInterval(() => {
        step++
        const progress = step / steps
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        setAnimatedStats({
          projects: Math.round((filterOptions.counts?.byCategory ? Object.values(filterOptions.counts.byCategory).reduce((a,b) => a+b, 0) : 33) * easeOut),
          years: Math.round(4 * easeOut),
          subjects: Math.round(48 * easeOut)
        })
        
        if (step >= steps) clearInterval(timer)
      }, interval)
      
      return () => clearInterval(timer)
    }
  }, [filterOptions])

  return (
    <div className={`container ${theme}`}>
      {/* Floating Particles Background */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <span key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 10}s`
          }} />
        ))}
      </div>

      <header className="page-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">💡</div>
            <div>
              <h1>IdeaBridge</h1>
              <p className="subtitle">Connect. Discover. Create.</p>
            </div>
          </div>
          <div className="header-actions">
            <a href="/status" className="status-link">📈 Status</a>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="stats-toggle" onClick={() => setShowStats(!showStats)}>
              📊 Stats
            </button>
          </div>
        </div>
        
        {/* Animated Statistics Bar */}
        <div className={`stats-bar ${showStats ? 'expanded' : ''}`}>
          <div className="stat-item">
            <span className="stat-number">{animatedStats.projects}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{animatedStats.years}</span>
            <span className="stat-label">Years</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{animatedStats.subjects}</span>
            <span className="stat-label">Subjects</span>
          </div>
          <div className="stat-item highlight">
            <span className="stat-number">{favorites.length}</span>
            <span className="stat-label">Favorites</span>
          </div>
        </div>
      </header>

      <div className="controls">
        {/* Search with Suggestions */}
        <div className="search-box" ref={searchInputRef}>
          <div className={`search-input-wrapper ${validationErrors.keyword ? 'has-error' : ''}`}>
            <span className="search-icon">🔍</span>
            <input 
              value={keyword} 
              onChange={e=>{
                setKeyword(e.target.value);
                setShowSuggestions(true);
                // Clear validation error when user types
                if(validationErrors.keyword) {
                  setValidationErrors(prev => ({...prev, keyword: null}));
                }
              }}
              onFocus={()=>setShowSuggestions(true)}
              placeholder="Search by keyword (e.g., AI, Web, Mobile, Python...)" 
              className="search-input"
              maxLength={VALIDATION.MAX_KEYWORD_LENGTH}
            />
            {keyword && (
              <button className="clear-input" onClick={()=>{setKeyword(''); setValidationErrors(prev => ({...prev, keyword: null}));}}>×</button>
            )}
          </div>
          {validationErrors.keyword && (
            <div className="validation-error">
              <span>⚠️</span>
              <div className="error-details">
                <p>{validationErrors.keyword}</p>
                <div className="valid-options">
                  <small>Try searching for:</small>
                  <div className="suggestion-chips">
                    {['Web', 'Mobile', 'AI', 'Machine Learning', 'Database Systems', 'Cyber Security'].map(opt => (
                      <span key={opt} className="suggestion-chip" onClick={()=>{setKeyword(opt); setValidationErrors({});}}>
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className={`char-counter ${keyword.length > 80 ? 'warning' : ''} ${keyword.length >= VALIDATION.MAX_KEYWORD_LENGTH ? 'error' : ''}`}>
            {keyword.length}/{VALIDATION.MAX_KEYWORD_LENGTH}
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((suggestion, idx) => (
                <div 
                  key={idx} 
                  className="suggestion-item"
                  onClick={()=>{setKeyword(suggestion); setShowSuggestions(false)}}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Presets */}
        <div className="filter-presets">
          <span className="presets-label">Quick Filters:</span>
          <div className="preset-chips">
            <button className="preset-chip" onClick={() => {setSpecialization('AI'); setCategory('AI'); setYear(''); setSemester(''); setDifficulty(''); setStatus('');}}>
              🤖 AI Specialization
            </button>
            <button className="preset-chip" onClick={() => {setSpecialization('Network'); setCategory('Networking'); setYear(''); setSemester(''); setDifficulty(''); setStatus('');}}>
              🌐 Network Specialization
            </button>
            <button className="preset-chip" onClick={() => {setSpecialization('Data Science'); setCategory('Data Science'); setYear(''); setSemester(''); setDifficulty(''); setStatus('');}}>
              📊 Data Science
            </button>
            <button className="preset-chip" onClick={() => {setSpecialization('Cyber Security'); setCategory('Cyber Security'); setYear(''); setSemester(''); setDifficulty(''); setStatus('');}}>
              🔒 Cyber Security
            </button>
            <button className="preset-chip" onClick={() => {setYear('Year 4'); setSemester(''); setSpecialization(''); setCategory(''); setDifficulty(''); setStatus('');}}>
              🎓 Final Year Projects
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          {/* Academic Year Filter */}
          <div className="filter-group">
            <label>
              <span className="filter-icon">📅</span>
              Academic Year
              {year && <span className="filter-badge active">1</span>}
            </label>
            <select value={year} onChange={e=>{setYear(e.target.value); setSemester(''); setSubject('');}}>
              <option value="">All Years</option>
              {VALIDATION.VALID_YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="filter-group">
            <label>
              <span className="filter-icon">📆</span>
              Semester
              {semester && <span className="filter-badge active">1</span>}
            </label>
            <select value={semester} onChange={e=>{setSemester(e.target.value); setSubject('');}} disabled={!year}>
              <option value="">{year ? 'All Semesters' : 'Select Year First'}</option>
              {getAvailableSemesters().map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {!year && <span className="filter-hint">Choose a year first</span>}
          </div>

          {/* Specialization Filter */}
          <div className="filter-group">
            <label>
              <span className="filter-icon">🎓</span>
              Specialization
              {specialization && <span className="filter-badge active">1</span>}
            </label>
            <select 
              value={specialization} 
              onChange={e=>{
                const selectedSpec = e.target.value;
                setSpecialization(selectedSpec);
                // Auto-set category based on specialization
                if(selectedSpec && SPECIALIZATION_TO_CATEGORY[selectedSpec]) {
                  setCategory(SPECIALIZATION_TO_CATEGORY[selectedSpec]);
                } else {
                  setCategory('');
                }
              }} 
              disabled={!semester}
            >
              <option value="">{semester ? 'All Specializations' : 'Select Semester First'}</option>
              {getAvailableSpecializations().map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {!semester && <span className="filter-hint">Choose a semester first</span>}
          </div>

          <div className="filter-group">
            <label>
              <span className="filter-icon">🏷️</span>
              Category
              {category && <span className="filter-badge active">1</span>}
            </label>
            <select 
              value={category} 
              onChange={e=>setCategory(e.target.value)}
              disabled={!!specialization}
            >
              <option value="">
                {specialization 
                  ? `Auto: ${SPECIALIZATION_TO_CATEGORY[specialization] || 'All Categories'}` 
                  : 'All Categories'}
              </option>
              {filterOptions?.categories?.map(c => (
                <option key={c} value={c}>{c} ({filterOptions.counts?.byCategory?.[c] || 0})</option>
              )) || (
                <>
                  <option>Web</option>
                  <option>Mobile</option>
                  <option>AI</option>
                  <option>IoT</option>
                  <option>Data Science</option>
                  <option>Cyber Security</option>
                  <option>Networking</option>
                  <option>Cloud</option>
                  <option>Other</option>
                </>
              )}
            </select>
            {specialization && <span className="filter-hint">Category auto-set from specialization</span>}
          </div>

          <div className="filter-group">
            <label>
              <span className="filter-icon">📈</span>
              Difficulty
              {difficulty && <span className="filter-badge active">1</span>}
            </label>
            <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
              <option value="">All Levels</option>
              <option value="Easy">🟢 Easy</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Hard">🔴 Hard</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <span className="filter-icon">✓</span>
              Status
              {status && <span className="filter-badge active">1</span>}
            </label>
            <select value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="New">🆕 New</option>
              <option value="Approved">✅ Approved</option>
              <option value="Completed">🏆 Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <span className="filter-icon">⇅</span>
              Sort By
            </label>
            <select value={`${sortBy}-${order}`} onChange={e=>{
              const [field, ord] = e.target.value.split('-')
              setSortBy(field)
              setOrder(ord)
            }}>
              <option value="createdAt-desc">📅 Newest First</option>
              <option value="createdAt-asc">📅 Oldest First</option>
              <option value="title-asc">🔤 Title A-Z</option>
              <option value="title-desc">🔤 Title Z-A</option>
              <option value="difficulty-asc">Difficulty: Easy → Hard</option>
              <option value="difficulty-desc">Difficulty: Hard → Easy</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="active-filters">
            <span className="filter-label">Active Filters:</span>
            {activeFilters.map((filter, idx) => (
              <span key={idx} className="filter-chip">
                {filter.label}
                <button onClick={()=>removeFilter(filter.type)}>×</button>
              </span>
            ))}
            <button className="clear-all" onClick={clearFilters}>Clear All</button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="buttons">
          <button onClick={()=>doSearch(1)} className="primary">
            {loading ? 'Searching...' : '🔍 Search'}
          </button>
          <button onClick={clearFilters} className="secondary">Clear All</button>
          {results && results.length > 0 && (
            <button onClick={exportResults} className="export">📥 Export</button>
          )}
          <button onClick={()=>setShowFilters(!showFilters)} className="toggle">
            {showFilters ? '🔼 Hide Filters' : '🔽 Show Filters'}
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="view-controls">
          <span>View:</span>
          <button 
            className={viewMode === 'grid' ? 'active' : ''} 
            onClick={()=>setViewMode('grid')}
          >
            ⊞ Grid
          </button>
          <button 
            className={viewMode === 'list' ? 'active' : ''} 
            onClick={()=>setViewMode('list')}
          >
            ☰ List
          </button>
        </div>
      </div>

      {/* Results Section */}
      <section id="results">
        {/* Status Bar */}
        <div className="status-bar">
          <div className="status-item">
            <span className="status-icon">📊</span>
            <span className="status-text">
              {loading ? (
                'Searching...'
              ) : results ? (
                <>Showing <strong>{results.length}</strong> of <strong>{totalResults}</strong> projects</>
              ) : (
                'Ready to search'
              )}
            </span>
          </div>
          {results && (
            <div className="status-item">
              <span className="status-icon">📄</span>
              <span className="status-text">Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
            </div>
          )}
          {(keyword || year || semester || specialization || category || difficulty || status) && (
            <div className="status-item filters-active">
              <span className="status-icon">🔍</span>
              <span className="status-text">Filters Active</span>
            </div>
          )}
          
          {/* Academic Filter Path Display */}
          {getAcademicFilterPath() && (
            <div className="status-item academic-path">
              <span className="status-icon">🎓</span>
              <span className="status-text">{getAcademicFilterPath()}</span>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="skeleton-container">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-tags">
                  <span></span><span></span><span></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Initial State */}
        {!loading && results===null && !error && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>Start typing or select filters to search for project ideas</p>
          </div>
        )}

        {/* No Results */}
        {!loading && results && results.length===0 && !error && (
          <div className="empty-state">
            <div className="empty-icon">😕</div>
            <p>No results found. Try adjusting your filters.</p>
            <button onClick={clearFilters} className="secondary">Clear Filters</button>
          </div>
        )}

        {/* Results List */}
        {!loading && results && results.length>0 && (
          <div>
            {/* Results Header */}
            <div className="results-header">
              <p className="results-count">
                Found <strong>{totalResults}</strong> project{totalResults !== 1 ? 's' : ''}
                {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
              </p>
              <div className="page-size">
                <label>Show:
                  <select value={limit} onChange={e=>{setLimit(Number(e.target.value)); doSearch(1)}}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Project Cards */}
            <div className={`projects-list ${viewMode}`}>
              {results.map((p, idx)=> (
                <article 
                  key={p._id} 
                  className={`project-card ${viewMode} ${visibleItems.has(p._id) ? 'visible' : ''}`}
                  data-id={p._id}
                  ref={observe}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="project-header">
                    <h3 onClick={() => openQuickView(p)}>{p.title}</h3>
                    <div className="header-actions">
                      <button 
                        className={`favorite-btn ${isFavorite(p._id) ? 'active' : ''}`}
                        onClick={()=>toggleFavorite(p._id)}
                      >
                        {isFavorite(p._id) ? '★' : '☆'}
                      </button>
                      <button 
                        className="action-btn share-btn"
                        onClick={()=>shareProject(p)}
                        title="Share project"
                      >
                        📤
                      </button>
                      <span className={`status-badge status-${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <p className="project-description" onClick={() => openQuickView(p)}>{p.description}</p>
                  <div className="project-meta">
                    <span className="badge year">{p.year}</span>
                    <span className="badge semester">{p.semester}</span>
                    <span className="badge subject">{p.subject}</span>
                    <span className="badge category">{p.category}</span>
                    <span className={`badge difficulty difficulty-${p.difficulty.toLowerCase()}`}>
                      {p.difficulty}
                    </span>
                  </div>
                  <div className="project-tags">
                    {p.tags?.map((tag, idx) => (
                      <span key={idx} className="tag" onClick={() => {setKeyword(tag); doSearch(1);}}>#{tag}</span>
                    ))}
                  </div>
                  <div className="project-footer">
                    <span className="author">By {p.author}</span>
                    <div className="footer-actions">
                      <button className="quick-view-btn" onClick={() => openQuickView(p)}>
                        👁️ Quick View
                      </button>
                      <span className="date">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={()=>doSearch(page-1)} 
                  disabled={page===1}
                  className="page-btn"
                >
                  ← Previous
                </button>
                <div className="page-numbers">
                  {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={()=>doSearch(p)}
                      className={`page-number ${p===page?'active':''}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={()=>doSearch(page+1)} 
                  disabled={page===totalPages}
                  className="page-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Quick View Modal */}
      {quickView && (
        <div className="modal-overlay" onClick={closeQuickView}>
          <div className="modal quick-view-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeQuickView}>×</button>
            <div className="quick-view-content">
              <h2>{quickView.title}</h2>
              <div className="quick-view-meta">
                <span className={`badge status-${quickView.status.toLowerCase()}`}>{quickView.status}</span>
                <span className="badge year">{quickView.year}</span>
                <span className="badge semester">{quickView.semester}</span>
                <span className="badge subject">{quickView.subject}</span>
                <span className={`badge difficulty-${quickView.difficulty.toLowerCase()}`}>{quickView.difficulty}</span>
              </div>
              <p className="quick-view-description">{quickView.description}</p>
              <div className="quick-view-tags">
                {quickView.tags?.map((tag, i) => <span key={i} className="tag">#{tag}</span>)}
              </div>
              <div className="quick-view-actions">
                <button className={`favorite-btn ${isFavorite(quickView._id) ? 'active' : ''}`} onClick={() => toggleFavorite(quickView._id)}>
                  {isFavorite(quickView._id) ? '★ Favorited' : '☆ Add to Favorites'}
                </button>
                <button onClick={() => shareProject(quickView)}>📤 Share</button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
