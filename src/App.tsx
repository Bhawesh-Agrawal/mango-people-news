import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar         from './components/layout/Navbar'
import Footer         from './components/layout/Footer'
import ProtectedRoute from './components/ui/ProtectedRoutes'
import AdminLayout    from './components/layout/Adminlayout'

// Public pages
import HomePage        from './pages/HomePage'
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import MagicVerifyPage from './pages/MagicVerifyPage'
import ArticlePage     from './pages/ArticlePage'
import CategoryPage    from './pages/CategoryPage'
import AccountPage     from './pages/Accountpage'
import TrendingPage    from './pages/Trendingpage'
import SavedPage       from './pages/Savedpage'
import ArticlesPage    from './pages/Articlespage'
import SearchPage      from './pages/Searchpage'

// Admin pages
import AdminDashboard         from './pages/Admindashboard'
import AdminArticles          from './pages/Adminarticles'
import AdminArticleAnalytics  from './pages/Adminarticleanalytics'
import {
  AdminNewsletter,
  AdminSettings,
}                             from './pages/Adminnewsletter'
import AdminUsers             from './pages/Adminuser'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes (with Navbar + Footer) ────────── */}
        <Route element={
          <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Navbar />
            <main>
              <Routes>
                <Route path="/"                    element={<HomePage />} />
                <Route path="/login"               element={<LoginPage />} />
                <Route path="/register"            element={<RegisterPage />} />
                <Route path="/articles"            element={<ArticlesPage />} />
                <Route path="/article/:slug"       element={<ArticlePage />} />
                <Route path="/category/:slug"      element={<CategoryPage />} />
                <Route path="/search"              element={<SearchPage />} />
                <Route path="/trending"            element={<TrendingPage />} />
                <Route path="/auth/verify-email"   element={<VerifyEmailPage />} />
                <Route path="/auth/magic"          element={<MagicVerifyPage />} />

                <Route path="/saved" element={
                  <ProtectedRoute><SavedPage /></ProtectedRoute>
                } />
                <Route path="/account" element={
                  <ProtectedRoute><AccountPage /></ProtectedRoute>
                } />

                <Route path="*" element={
                  <div className="page-container py-20 text-center">
                    <h1 className="font-display text-4xl font-black"
                      style={{ color: 'var(--text-primary)' }}>
                      404 — Page Not Found
                    </h1>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        } path="/*" />

        <Route path="/admin" element={
          <ProtectedRoute requiredRole="editor">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="dashboard"     element={<AdminDashboard />} />
          <Route path="articles"      element={<AdminArticles />} />
          <Route path="analytics/:id" element={<AdminArticleAnalytics />} />

          <Route path="users"      element={<AdminUsers />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="settings"   element={<AdminSettings />} />

          {/* Catch-all inside admin */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App