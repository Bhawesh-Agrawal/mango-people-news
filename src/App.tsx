import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth }    from './context/AuthContext'
import Navbar         from './components/layout/Navbar'
import Footer         from './components/layout/Footer'
import ProtectedRoute from './components/ui/ProtectedRoutes'
import AdminLayout    from './components/layout/Adminlayout'
import ScrollToTop    from './components/ui/ScrollToTop'
import { CategoriesProvider } from './context/CategoriesContext'

// ─────────────────────────────────────────────────────────────
// LAZY PAGE IMPORTS
// Grouped by priority so you can see what loads when.
// ─────────────────────────────────────────────────────────────

// 🔴 Critical public pages — preloaded immediately after app boot
const HomePage     = lazy(() => import('./pages/HomePage'))
const ArticlePage  = lazy(() => import('./pages/ArticlePage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ArticlesPage = lazy(() => import('./pages/Articlespage'))

// 🟡 Common public pages — preloaded on idle
const SearchPage      = lazy(() => import('./pages/Searchpage'))
const TrendingPage    = lazy(() => import('./pages/Trendingpage'))
const NewsletterPage  = lazy(() => import('./pages/Newsletterpage'))
const AboutPage       = lazy(() => import('./pages/Aboutus'))
const ContactPage     = lazy(() => import('./pages/Contactus'))
const TeamPage        = lazy(() => import('./pages/Team'))

// 🟢 Auth pages — loaded on demand
const LoginPage           = lazy(() => import('./pages/LoginPage'))
const RegisterPage        = lazy(() => import('./pages/RegisterPage'))
const VerifyEmailPage     = lazy(() => import('./pages/VerifyEmailPage'))
const MagicVerifyPage     = lazy(() => import('./pages/MagicVerifyPage'))
const ForgotPasswordPage  = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage   = lazy(() => import('./pages/ResetPasswordPage'))

// 🟢 Legal pages — loaded on demand
const PrivacyPolicyPage       = lazy(() => import('./pages/PrivacyPolicyPage'))
const TermsAndConditionsPage  = lazy(() => import('./pages/TermsAndConditionsPage'))
const DisclaimerPage          = lazy(() => import('./pages/DisclaimerPage'))

// 🔵 Protected user pages — loaded on demand
const AccountPage = lazy(() => import('./pages/Accountpage'))
const SavedPage   = lazy(() => import('./pages/Savedpage'))

// ⚫ Admin pages — loaded ONLY when user navigates to /admin
const AdminDashboard        = lazy(() => import('./pages/Admindashboard'))
const AdminArticles         = lazy(() => import('./pages/Adminarticles'))
const AdminArticleAnalytics = lazy(() => import('./pages/Adminarticleanalytics'))
const AdminCategories       = lazy(() => import('./pages/Admincategories'))
const AdminUsers            = lazy(() => import('./pages/Adminuser'))
const AdminEditorList       = lazy(() => import('./pages/Admineditorlist'))
const AdminEditor           = lazy(() => import('./pages/Admineditor'))
const ReviewQueue           = lazy(() => import('./pages/ReviewQueue'))

// AdminNewsletter & AdminSettings use named exports — wrap them
const AdminNewsletter = lazy(() =>
  import('./pages/Adminnewsletter').then(m => ({ default: m.AdminNewsletter }))
)
const AdminSettings = lazy(() =>
  import('./pages/Adminnewsletter').then(m => ({ default: m.AdminSettings }))
)

// ─────────────────────────────────────────────────────────────
// PRELOAD HELPERS
// Call these to hint the browser to fetch chunks early,
// before the user actually navigates there.
// ─────────────────────────────────────────────────────────────
const preloadCritical = () => {
  // These are the pages most visitors will hit — load them right away
  import('./pages/ArticlePage')
  import('./pages/CategoryPage')
  import('./pages/Articlespage')
}

const preloadIdle = () => {
  // Preload the rest of public pages when the browser is idle
  const idleCallback = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200))
  idleCallback(() => {
    import('./pages/Searchpage')
    import('./pages/Trendingpage')
    import('./pages/Newsletterpage')
    import('./pages/Aboutus')
    import('./pages/Contactus')
    import('./pages/Team')
  })
}

const preloadAdmin = () => {
  // Called when user hovers or focuses on any /admin link
  import('./pages/Admindashboard')
  import('./pages/Adminarticles')
  import('./pages/Admineditorlist')
  import('./pages/Admineditor')
}

// ─────────────────────────────────────────────────────────────
// LOADING FALLBACK
// Lightweight spinner — no heavy library needed
// ─────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '3px solid var(--border, #e5e7eb)',
        borderTopColor: 'var(--accent, #3b82f6)',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PRELOAD ON ROUTE CHANGE
// Kicks off idle preloads once the app first renders
// ─────────────────────────────────────────────────────────────
function PreloadManager() {
  useEffect(() => {
    preloadCritical()
    preloadIdle()
  }, [])
  return null
}

// ─────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PreloadManager />

      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ── Public routes (with Navbar + Footer) ── */}
          <Route
            path="/*"
            element={
              <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
                <CategoriesProvider>
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/"                       element={<HomePage />} />
                      <Route path="/articles"               element={<ArticlesPage />} />
                      <Route path="/article/:slug"          element={<ArticlePage />} />
                      <Route path="/category/:slug"         element={<CategoryPage />} />
                      <Route path="/search"                 element={<SearchPage />} />
                      <Route path="/trending"               element={<TrendingPage />} />
                      <Route path="/newsletter"             element={<NewsletterPage />} />
                      <Route path="/about"                  element={<AboutPage />} />
                      <Route path="/contact"                element={<ContactPage />} />
                      <Route path="/team"                   element={<TeamPage />} />

                      {/* Auth */}
                      <Route path="/login"                  element={<LoginPage />} />
                      <Route path="/register"               element={<RegisterPage />} />
                      <Route path="/auth/verify-email"      element={<VerifyEmailPage />} />
                      <Route path="/auth/magic"             element={<MagicVerifyPage />} />
                      <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
                      <Route path="/reset-password"         element={<ResetPasswordPage />} />

                      {/* Legal */}
                      <Route path="/privacy-policy"         element={<PrivacyPolicyPage />} />
                      <Route path="/terms-and-conditions"   element={<TermsAndConditionsPage />} />
                      <Route path="/disclaimer"             element={<DisclaimerPage />} />

                      {/* Protected */}
                      <Route path="/saved" element={
                        <ProtectedRoute><SavedPage /></ProtectedRoute>
                      } />
                      <Route path="/account" element={
                        <ProtectedRoute><AccountPage /></ProtectedRoute>
                      } />

                      {/* 404 */}
                      <Route path="*" element={
                        <div className="page-container py-20 text-center">
                          <h1
                            className="font-display text-4xl font-black"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            404 — Page Not Found
                          </h1>
                        </div>
                      } />
                    </Routes>
                  </main>
                  <Footer />
                </CategoriesProvider>
              </div>
            }
          />

          {/* ── Admin routes ── */}
          {/* Wrap the AdminLayout in its own Suspense so the
              public site never waits for admin chunks            */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="author">
                {/* Preload remaining admin chunks when user enters /admin */}
                <AdminPreloader />
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminIndexRedirect />} />

            <Route path="dashboard" element={
              <ProtectedRoute requiredRole="editor"><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="articles" element={
              <ProtectedRoute requiredRole="editor"><AdminArticles /></ProtectedRoute>
            } />
            <Route path="analytics/:id" element={
              <ProtectedRoute requiredRole="editor"><AdminArticleAnalytics /></ProtectedRoute>
            } />
            <Route path="categories" element={
              <ProtectedRoute requiredRole="editor"><AdminCategories /></ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute requiredRole="editor"><AdminUsers /></ProtectedRoute>
            } />
            <Route path="newsletter" element={
              <ProtectedRoute requiredRole="editor"><AdminNewsletter /></ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute requiredRole="editor"><AdminSettings /></ProtectedRoute>
            } />
            <Route path="/admin/review" element={
              <ProtectedRoute requiredRole="super_admin"><ReviewQueue /></ProtectedRoute>
            } />

            <Route path="editor"     element={<AdminEditorList />} />
            <Route path="editor/new" element={<AdminEditor />} />
            <Route path="editor/:id" element={<AdminEditor />} />

            <Route path="*" element={<AdminIndexRedirect />} />
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

// Preloads remaining admin chunks the moment the user enters /admin
function AdminPreloader() {
  useEffect(() => { preloadAdmin() }, [])
  return null
}

/** Redirects based on role: editor/super_admin → dashboard, author → editor list */
function AdminIndexRedirect() {
  const { user } = useAuth()
  const isEditorPlus = user?.role === 'editor' || user?.role === 'super_admin'
  return <Navigate to={isEditorPlus ? '/admin/dashboard' : '/admin/editor'} replace />
}

export default App