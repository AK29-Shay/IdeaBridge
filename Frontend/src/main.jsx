import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import StatusPage from './StatusPage'
import './styles.css'
import './StatusPage.css'

// Simple router based on URL path
const path = window.location.pathname
const root = createRoot(document.getElementById('root'))

if (path === '/status') {
  root.render(<StatusPage />)
} else {
  root.render(<App />)
}
