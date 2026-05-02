import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth }    from './context/AuthContext'
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
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ArticlePage     from './pages/ArticlePage'
import CategoryPage    from './pages/CategoryPage'
import AccountPage     from './pages/Accountpage'
import TrendingPage    from './pages/Trendingpage'
import SavedPage       from './pages/Savedpage'
import ArticlesPage    from './pages/Articlespage'
import SearchPage      from './pages/Searchpage'
import NewsletterPage  from './pages/Newsletterpage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsAndConditionsPage from './pages/TermsAndConditionsPage'
import DisclaimerPage from './pages/DisclaimerPage'

// Admin pages
import AdminDashboard         from './pages/Admindashboard'
import AdminArticles          from './pages/Adminarticles'
import AdminArticleAnalytics  from './pages/Adminarticleanalytics'
import AdminCategories        from './pages/Admincategories'
import {
  AdminNewsletter,
  AdminSettings,
}                             from './pages/Adminnewsletter'
import AdminUsers             from './pages/Adminuser'
import AdminEditorList        from './pages/Admineditorlist'
import AdminEditor            from './pages/Admineditor'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes (with Navbar + Footer) ── */}
        <Route
          path="/*"
          element={
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
                  <Route path="/newsletter"          element={<NewsletterPage />} />
                  <Route path="/privacy-policy"      element={<PrivacyPolicyPage />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
                  <Route path="/disclaimer"          element={<DisclaimerPage />} />
                  <Route path="/auth/verify-email"   element={<VerifyEmailPage />} />
                  <Route path="/auth/magic"          element={<MagicVerifyPage />} />
                  <Route path="/forgot-password"    element={<ForgotPasswordPage />} />
                  <Route path="/reset-password"     element={<ResetPasswordPage />} />

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
          }
        />

        {/* ── Admin routes ──────────────────────────────────────────
            FIX: requiredRole="author" so both authors AND editors can
            enter the /admin shell. Individual pages further restrict
            access (e.g. AdminDashboard, AdminUsers are editor-only).
            Authors land directly on /admin/editor.
        ─────────────────────────────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="author">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirect: editors go to dashboard, authors go to editor list */}
          <Route index element={<AdminIndexRedirect />} />

          {/* Editor/super_admin only pages */}
          <Route path="dashboard" element={
            <ProtectedRoute requiredRole="editor"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="articles" element={
            <ProtectedRoute requiredRole="editor"><AdminArticles /></ProtectedRoute>
          } />
          <Route path="analytics/:id" element={
            <ProtectedRoute requiredRole="editor"><AdminArticleAnalytics /></ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute requiredRole="editor"><AdminUsers /></ProtectedRoute>
          } />
          <Route path="categories" element={
            <ProtectedRoute requiredRole="super_admin"><AdminCategories /></ProtectedRoute>
          } />
          <Route path="newsletter" element={
            <ProtectedRoute requiredRole="editor"><AdminNewsletter /></ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute requiredRole="editor"><AdminSettings /></ProtectedRoute>
          } />

          {/* Author + editor pages */}
          <Route path="editor"     element={<AdminEditorList />} />
          <Route path="editor/new" element={<AdminEditor />} />
          <Route path="editor/:id" element={<AdminEditor />} />

          <Route path="*" element={<AdminIndexRedirect />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

/** Redirects based on role: editor/super_admin → dashboard, author → editor list */
function AdminIndexRedirect() {
  const { user } = useAuth()
  const isEditorPlus = user?.role === 'editor' || user?.role === 'super_admin'
  return <Navigate to={isEditorPlus ? '/admin/dashboard' : '/admin/editor'} replace />
}

export default App