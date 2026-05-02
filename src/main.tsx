import React    from 'react'
import ReactDOM from 'react-dom/client'
import App      from './App'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider }  from './context/AuthContext'
import AuthGate          from './components/ui/AuthGate'
import { Analytics }     from '@vercel/analytics/react'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AuthGate>
          <App />
          <Analytics />
        </AuthGate>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)