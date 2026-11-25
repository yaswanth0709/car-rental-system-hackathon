import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { categories, money } from './data';
import { useApp } from './store';

export function Stars({ rating = 0, count }) {
  return (
    <span className="stars" title={`${rating} out of 5`}>
      <span className="star">★</span>
      {Number(rating).toFixed(1)}
      {count != null && <span className="stars-count">({count})</span>}
    </span>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function SectionHead({ eyebrow, title, sub, action }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function CarCard({ car }) {
  const { favourites, toggleFavourite } = useApp();
  const saved = favourites.includes(car.id);
  return (
    <article className="car-card">
      <Link to={`/car/${car.id}`} className="car-media" aria-label={`View ${car.name}`}>
        <img src={car.image} alt={car.name} loading="lazy" />
        {car.badge && <span className="pill">{car.badge}</span>}
        {!car.available && <span className="pill pill-muted">Unavailable</span>}
      </Link>
      <button
        type="button"
        className={`fav ${saved ? 'on' : ''}`}
        onClick={() => toggleFavourite(car.id)}
        aria-label={saved ? 'Remove from favourites' : 'Save to favourites'}
        aria-pressed={saved}
      >
        ♥
      </button>
      <div className="car-body">
        <div className="car-head">
          <div>
            <p className="eyebrow">{car.brand} · {car.type}</p>
            <h3>
              <Link to={`/car/${car.id}`}>{car.name}</Link>
            </h3>
          </div>
          <Stars rating={car.rating} count={car.reviewsCount} />
        </div>
        <ul className="car-specs">
          <li>{car.specs.transmission}</li>
          <li>{car.specs.seats} seats</li>
          <li>{car.specs.fuel}</li>
        </ul>
        <div className="car-foot">
          <div className="price">
            {money(car.price)}
            <span>/day</span>
          </div>
          <Link to={`/car/${car.id}`} className="btn btn-ghost btn-sm">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

function Navbar() {
  const { favourites } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const navClass = ({ isActive }) => `nav-link${isActive ? ' on' : ''}`;

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">D</span>
          <span className="brand-text">
            Drive<span>Now</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <div className="has-menu">
            <NavLink to="/cars" className={navClass}>
              Fleet <span aria-hidden="true">▾</span>
            </NavLink>
            <div className="menu">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={cat.slug === 'all' ? '/cars' : `/cars/${cat.slug}`}
                  className="menu-link"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
          <NavLink to="/account" className={navClass}>
            My account
          </NavLink>
          <NavLink to="/admin" className={navClass}>
            Admin
          </NavLink>
        </nav>

        <div className="nav-actions">
          <Link to="/account" className="fav-pill" aria-label="Saved cars">
            ♥ {favourites.length}
          </Link>
          <Link to="/cars" className="btn btn-primary btn-sm">
            Book a car
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <span className="brand-mark">D</span>
            <span className="brand-text">
              Drive<span>Now</span>
            </span>
          </Link>
          <p>
            Self-drive car rentals across Hyderabad, Bangalore, Chennai and coastal Andhra.
            Transparent pricing, inspected cars and support that actually answers.
          </p>
          <div className="footer-badges">
            <span>GST invoiced</span>
            <span>Sanitised fleet</span>
            <span>24/7 support</span>
          </div>
        </div>

        <div>
          <h4>Fleet</h4>
          <ul className="footer-links">
            {categories.slice(0, 5).map((cat) => (
              <li key={cat.slug}>
                <Link to={cat.slug === 'all' ? '/cars' : `/cars/${cat.slug}`}>{cat.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul className="footer-links">
            <li><Link to="/account">My account</Link></li>
            <li><Link to="/admin">Admin dashboard</Link></li>
            <li><Link to="/cars">Availability</Link></li>
            <li><Link to="/">Terms &amp; policies</Link></li>
          </ul>
        </div>

        <div>
          <h4>Stay in the loop</h4>
          <p className="footer-note">Offers, new arrivals and long-drive tips. No spam.</p>
          <form
            className="footer-news"
            onSubmit={(event) => {
              event.preventDefault();
              if (!email.trim()) return;
              setSent(true);
              setEmail('');
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              required
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Join
            </button>
          </form>
          {sent && <p className="footer-note ok">You are on the list.</p>}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} DriveNow Rentals. All rights reserved.</p>
        <p>Hyderabad · Bangalore · Chennai · Vijayawada · Visakhapatnam</p>
      </div>
    </footer>
  );
}

export function Layout() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname, search]);

  return (
    <>
      <Navbar />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export function Empty({ title, children, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Modal({ title, children, onClose, wide }) {
  return (
    <div className="modal" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div
        className={`modal-card ${wide ? 'wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
