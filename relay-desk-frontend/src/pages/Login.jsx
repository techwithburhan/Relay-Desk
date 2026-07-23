import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import * as api from '../api/client';
import './Login.css';

// "Quick login" (point 6) — admin-configurable in a future iteration via
// Settings; for now these just pre-fill the email field for the three
// seeded roles so reviewers can test each one quickly.
const QUICK_LOGINS = [
  { label: 'Admin', email: 'burhan@gclbroking.com' },
  { label: 'Dealer', email: 'atul@gclbroking.com' },
  { label: 'Client', email: 'it@gclbroking.com' },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loading, error, errorCode } = useAuth();
  const { logoUrl, portalName, stagingSplashImageUrl } = useBranding();

  const leftInnerRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verified, setVerified] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const splashRef = useRef(null);

  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    api.getSlides().then(setSlides).catch(() => setSlides([]));
  }, []);

  // Auto-advance the slider every 4.5s
  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setActiveSlide((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Redirect straight to /license if there's no active license — no point
  // showing a login form the user can't actually get past.
  useEffect(() => {
    api.getLicenseStatus()
      .then((s) => { if (!s.active) navigate('/license', { replace: true }); })
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(leftInnerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.login-heading', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .fromTo('.quick-login-btn', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.2')
      .fromTo('.field', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, '-=0.2')
      .fromTo('.verify-row', { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.1')
      .fromTo('.btn-signin', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.1')
      .fromTo('.ad-slot', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.08 }, '-=0.1');

    gsap.to('.right-graphic', { y: -10, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }, []);

  const handleQuickLogin = (quickEmail) => setEmail(quickEmail);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verified) return;

    const ok = await signIn(email, password);
    if (!ok) return;
    setShowSplash(true);
  };

  useEffect(() => {
    if (errorCode === 'LICENSE_EXPIRED') {
      navigate('/license');
    }
  }, [errorCode, navigate]);

  useEffect(() => {
    if (!showSplash) return;
    gsap.fromTo(splashRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(
      '.splash-mark',
      { scale: 0.7, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.8)' }
    );
    const timer = setTimeout(() => {
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    }, 1800);
    return () => clearTimeout(timer);
  }, [showSplash, navigate, location.state]);

  if (showSplash) {
    return (
      <div className="staging-splash" ref={splashRef}>
        {stagingSplashImageUrl ? (
          <img src={stagingSplashImageUrl} alt={portalName} className="splash-mark splash-img" />
        ) : (
          <div className="splash-mark">R</div>
        )}
        <div className="splash-text">Loading your workspace…</div>
      </div>
    );
  }

  const slide = slides[activeSlide];

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-inner" ref={leftInnerRef}>
          <div className="login-top-brand">
            {logoUrl ? (
              <img src={logoUrl} alt={portalName} className="login-logo-img" />
            ) : (
              <div className="login-logo-mark">R</div>
            )}
            <span className="login-brand-name">{portalName}</span>
          </div>

          <div className="login-heading">
            <h1 className="display">Login</h1>
            <p>Welcome back! Select a method to log in.</p>
          </div>

          <div className="quick-login-row">
            {QUICK_LOGINS.map((q) => (
              <button
                key={q.label}
                type="button"
                className="quick-login-btn"
                onClick={() => handleQuickLogin(q.email)}
              >
                {q.label}
              </button>
            ))}
          </div>

          <div className="or-divider"><span>or continue with</span></div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-shell">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <svg className="toggle-eye" onClick={() => setShowPassword((s) => !s)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
            </div>

            <label className="verify-row">
              <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
              <span>Verify you are human</span>
            </label>

            {error && errorCode !== 'LICENSE_EXPIRED' && <div className="login-error">{error}</div>}

            <button className="btn-signin" type="submit" disabled={loading || !verified}>
              {loading ? 'Logging in…' : 'Log In'}
            </button>

            <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
          </form>

          <div className="ad-row">
            <div className="ad-slot">Ad space</div>
            <div className="ad-slot">Ad space</div>
            <div className="ad-slot">Ad space</div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="right-graphic">
          <div className="right-card">
            <div className="right-card-title">Overview</div>
            <div className="right-card-bars">
              <span style={{ height: '40%' }} />
              <span style={{ height: '70%' }} />
              <span style={{ height: '55%' }} />
              <span style={{ height: '85%' }} />
            </div>
          </div>
        </div>

        {slide ? (
          <div className="right-tagline">
            {slide.subtitle && <div className="right-eyebrow">{slide.subtitle}</div>}
            <h2>{slide.title}</h2>
            {slide.description && <p>{slide.description}</p>}
            {slide.button_text && slide.button_url && (
              <a href={slide.button_url} className="slide-btn" target="_blank" rel="noreferrer">
                {slide.button_text}
              </a>
            )}
          </div>
        ) : (
          <div className="right-tagline">
            <div className="right-eyebrow">Now Generally Available</div>
            <h2>{portalName} Support Console</h2>
            <p>Manage every ticket, client, and branch fast, easy, and at scale.</p>
          </div>
        )}

        {slides.length > 1 && (
          <div className="slider-dots">
            {slides.map((s, i) => (
              <span
                key={s.id}
                className={`slider-dot${i === activeSlide ? ' active' : ''}`}
                onClick={() => setActiveSlide(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
