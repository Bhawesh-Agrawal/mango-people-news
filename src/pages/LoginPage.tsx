import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeNewsletter } from '../api/newsletter'

// ── Rotating headlines for the left panel ─────────────────────────
const HEADLINES = [
  'Markets moved ₹4.2L crore today.',
  'RBI holds rates. Your EMI stays.',
  'Sensex crossed 82,000 this week.',
  'Budget 2026 — what it means for you.',
  'Gold hits ₹72,450. Time to sell?',
]

function LeftPanel() {
  const [current, setCurrent]   = useState(0)
  const [visible, setVisible]   = useState(true)
  const [nlEmail,  setNlEmail]  = useState('')
  const [nlChecked, setNlChecked] = useState(false)
  const [nlStatus,  setNlStatus]  = useState<'idle' | 'done' | 'loading'>('idle')

  // Rotate headline every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(c => (c + 1) % HEADLINES.length)
        setVisible(true)
      }, 300)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  const handleNlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nlEmail || !nlChecked) return
    setNlStatus('loading')
    try {
      await subscribeNewsletter(nlEmail)
      setNlStatus('done')
    } catch {
      setNlStatus('done') // Still show success — email enumeration safe
    }
  }

  return (
    <div
      className="hidden lg:flex flex-col justify-between p-10 relative
                 overflow-hidden"
      style={{ background: '#0D0D0D', minHeight: '100vh' }}
    >
      {/* Background texture — subtle grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(var(--border, #333) 1px, transparent 1px),
                            linear-gradient(90deg, var(--border, #333) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Amber accent blob */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #E8A020, transparent 70%)',
        }}
      />

      {/* Top — logo */}
      <div className="relative z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-lg flex items-center
                       justify-center text-2xl"
            style={{ background: '#E8A02018', border: '1px solid #E8A02040' }}
          >
            🌳
          </div>
          <div className="leading-none">
            <div
              className="font-display text-lg font-black tracking-tight"
              style={{ color: '#FAFAF8' }}
            >
              MANGO PEOPLE
            </div>
            <div
              className="text-[9px] font-bold tracking-[0.18em] uppercase"
              style={{ color: '#E8A020' }}
            >
              News for Every Indian
            </div>
          </div>
        </Link>
      </div>

      {/* Middle — rotating headline */}
      <div className="relative z-10 my-12">
        <div
          className="text-[10px] font-black tracking-[0.2em] uppercase mb-4"
          style={{ color: '#E8A020' }}
        >
          Right Now
        </div>
        <div style={{ minHeight: '120px' }}>
          <p
            className="font-display font-black leading-tight tracking-tight
                       transition-all duration-300"
            style={{
              fontSize:  'clamp(28px, 3.5vw, 40px)',
              color:     '#FAFAF8',
              opacity:   visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(8px)',
            }}
          >
            {HEADLINES[current]}
          </p>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5 mt-4">
          {HEADLINES.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width:      i === current ? '20px' : '6px',
                height:     '6px',
                background: i === current ? '#E8A020' : '#ffffff30',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom — newsletter subscribe */}
      <div className="relative z-10">
        <div
          className="p-5 rounded-xl"
          style={{
            background: '#ffffff08',
            border:     '1px solid #ffffff15',
          }}
        >
          {nlStatus === 'done' ? (
            <div className="flex items-center gap-2.5">
              <CheckCircle size={18} style={{ color: '#22c55e' }} />
              <div>
                <p
                  className="text-sm font-bold"
                  style={{ color: '#FAFAF8' }}
                >
                  You're on the list!
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: '#ffffff60' }}
                >
                  Check your inbox to confirm.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p
                className="text-sm font-bold mb-1"
                style={{ color: '#FAFAF8' }}
              >
                Get India's top business stories
              </p>
              <p
                className="text-xs mb-4"
                style={{ color: '#ffffff60' }}
              >
                Daily briefing · Before the opening bell · Free
              </p>

              <form onSubmit={handleNlSubmit} className="space-y-3">
                <input
                  type="email"
                  value={nlEmail}
                  onChange={e => setNlEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 h-9 rounded-lg text-sm outline-none"
                  style={{
                    background: '#ffffff12',
                    border:     '1px solid #ffffff25',
                    color:      '#FAFAF8',
                  }}
                />

                {/* Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <div
                    className="w-4 h-4 rounded flex-shrink-0 mt-0.5
                               flex items-center justify-center
                               transition-all duration-150"
                    style={{
                      background: nlChecked ? '#E8A020' : 'transparent',
                      border:     `1.5px solid ${nlChecked ? '#E8A020' : '#ffffff40'}`,
                    }}
                    onClick={() => setNlChecked(v => !v)}
                  >
                    {nlChecked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white"
                          strokeWidth="1.5" strokeLinecap="round"
                          strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-xs leading-relaxed"
                    style={{ color: '#ffffff70' }}
                  >
                    Yes, send me the daily newsletter.
                    No spam, unsubscribe anytime.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!nlChecked || !nlEmail || nlStatus === 'loading'}
                  className="w-full h-9 rounded-lg text-xs font-bold
                             tracking-widest uppercase transition-all
                             duration-200 disabled:opacity-40"
                  style={{
                    background: '#E8A020',
                    color:      '#fff',
                  }}
                >
                  {nlStatus === 'loading' ? 'Subscribing…' : 'Subscribe Free →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// LOGIN FORM — right panel
// ══════════════════════════════════════════════════════════════════
export default function LoginPage() {
  const { login, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from     = (location.state as any)?.from || '/'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (isLoggedIn) navigate(from, { replace: true })
  }, [isLoggedIn])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Invalid email or password'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full pl-9 pr-4 h-11 rounded-lg text-sm
                    outline-none transition-all duration-200`
  const inputStyle = {
    background: 'var(--bg-subtle)',
    border:     '1px solid var(--border)',
    color:      'var(--text-primary)',
  }
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--accent)'
    e.currentTarget.style.background  = 'var(--bg-surface)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--border)'
    e.currentTarget.style.background  = 'var(--bg-subtle)'
  }

  return (
    <div
      className="min-h-screen grid grid-cols-1 lg:grid-cols-2"
      style={{ background: 'var(--bg)' }}
    >
      {/* Left — editorial panel */}
      <LeftPanel />

      {/* Right — form */}
      <div
        className="flex flex-col justify-center px-6 py-12
                   sm:px-10 lg:px-14 xl:px-20"
        style={{
          animation: 'fadeUp 0.4s ease both',
        }}
      >
        <div className="w-full max-w-sm mx-auto">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-lg flex items-center
                         justify-center text-xl"
              style={{ background: 'var(--accent-light)' }}
            >
              🌳
            </div>
            <div className="leading-none">
              <div className="font-display text-lg font-black tracking-tight"
                style={{ color: 'var(--text-primary)' }}>
                MANGO PEOPLE
              </div>
              <div className="text-[9px] font-bold tracking-[0.16em] uppercase"
                style={{ color: 'var(--accent)' }}>
                News for Every Indian
              </div>
            </div>
          </Link>

          <h1
            className="font-display font-black uppercase tracking-tight mb-1"
            style={{
              fontSize: 'clamp(24px, 5vw, 32px)',
              color:    'var(--text-primary)',
            }}
          >
            Welcome Back
          </h1>
          <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>
            Sign in to save articles, follow topics and more.
          </p>

          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm mb-5"
              style={{
                background: '#fdf0ee',
                color:      'var(--breaking)',
                border:     '1px solid var(--breaking)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold tracking-widest
                                uppercase mb-1.5"
                style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <div className="relative">
                <Mail size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls} style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: 'var(--text-muted)' }}>
                  Password
                </label>
                <Link to="/forgot-password"
                  className="text-xs hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--accent)' }}>
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password} required
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  className={`${inputCls} pr-10`}
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
                <button type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full h-11 text-sm font-bold
                         flex items-center justify-center gap-2
                         disabled:opacity-60 rounded-lg mt-2"
            >
              {loading ? 'Signing in…' : (
                <>Sign In <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Magic link */}
          <Link to="/magic-link"
            className="flex items-center justify-center gap-2 w-full h-11
                       rounded-lg text-sm font-bold transition-all duration-200
                       btn-ghost">
            <Mail size={15} />
            Sign in with Magic Link
          </Link>

          <p className="text-center text-sm mt-6"
            style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register"
              className="font-bold hover:opacity-70 transition-opacity"
              style={{ color: 'var(--accent)' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}