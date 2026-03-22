import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/ui/ProtectedRoutes'

// Pages — we'll create these next
import HomePage      from './pages/HomePage'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'

function App() {
  return (
    <BrowserRouter>
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* These pages come next */}
            <Route path="/article/:slug"    element={<div>Article page coming</div>} />
            <Route path="/category/:slug"   element={<div>Category page coming</div>} />
            <Route path="/search"           element={<div>Search page coming</div>} />
            <Route path="/trending"         element={<div>Trending page coming</div>} />

            {/* Protected */}
            <Route path="/saved"   element={
              <ProtectedRoute><div>Saved page coming</div></ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute><div>Account page coming</div></ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="editor">
                <div>Admin coming</div>
              </ProtectedRoute>
            } />

            <Route path="*" element={<div className="page-container py-20 text-center">
              <h1 className="font-display text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
                404 — Page Not Found
              </h1>
            </div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App