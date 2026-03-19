import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/layout/Navbar'

function App() {
  return (
    <BrowserRouter>
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />

        {/* Pages go here — placeholder for now */}
        <main className="page-container py-8">
          <h1
            className="font-display text-5xl font-black"
            style={{ color: 'var(--text-primary)' }}
          >
            MANGO PEOPLE NEWS
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-2">
            Homepage coming next.
          </p>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App