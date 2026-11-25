import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, money } from '../data';
import { useApp } from '../store';

const VIEWS = [
  { id: 'overview', label: 'Overview' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'customers', label: 'Customers' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'reviews', label: 'Reviews' },
];

const STATUSES = ['Confirmed', 'Pending', 'Completed', 'Cancelled'];

const blankCar = {
  name: '',
  brand: '',
  type: 'Sedan',
  category: 'sedan',
  price: 3000,
  deposit: 3000,
  location: 'Hyderabad',
  image: '',
  description: '',
  available: true,
};

function LoginScreen({ onSignIn }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="admin-login">
      <form
        className="login-card"
        onSubmit={(event) => {
          event.preventDefault();
          if (!onSignIn(password)) setError('Incorrect password. Try admin123 for this demo.');
        }}
      >
        <Link to="/" className="brand">
          <span className="brand-mark">D</span>
          <span className="brand-text">Drive<span>Now</span></span>
        </Link>
        <h1>Admin console</h1>
        <p className="muted">Manage the fleet, bookings, customers and promotions.</p>
        <label className="field">
          <span className="field-label">Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
            required
          />
        </label>
        {error && <p className="error small">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block">Sign in</button>
        <p className="muted small">Demo password: <strong>admin123</strong></p>
        <Link to="/" className="btn btn-ghost btn-block">Back to the website</Link>
      </form>
    </div>
  );
}

export default function Admin() {
  const {
    admin,
    signInAdmin,
    signOutAdmin,
    cars,
    bookings,
    reviews,
    promos,
    addCar,
    updateCar,
    removeCar,
    setBookingStatus,
    removeReview,
    addPromo,
    togglePromo,
    resetDemo,
  } = useApp();

  const [view, setView] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('All');
  const [carForm, setCarForm] = useState(null);
  const [promoForm, setPromoForm] = useState({ code: '', type: 'percent', value: 10 });
  const [notice, setNotice] = useState('');

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 3000);
  };

  const active = bookings.filter((booking) => booking.status !== 'Cancelled');
  const revenue = active.reduce((sum, booking) => sum + booking.total, 0);
  const avgRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const utilisation = cars.length
    ? Math.round((cars.filter((car) => car.available).length / cars.length) * 100)
    : 0;

  const monthly = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const buckets = months.map((label) => ({ label, value: 0 }));
    active.forEach((booking) => {
      const month = Number(booking.startDate.slice(5, 7)) - 1;
      if (!Number.isNaN(month) && buckets[month]) buckets[month].value += booking.total;
    });
    const max = Math.max(1, ...buckets.map((bucket) => bucket.value));
    return { buckets: buckets.slice(0, 8), max };
  }, [bookings]);

  const customers = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      const key = booking.email;
      const entry = map.get(key) || {
        name: booking.customer,
        email: key,
        phone: booking.phone,
        trips: 0,
        spend: 0,
        last: booking.startDate,
      };
      entry.trips += 1;
      if (booking.status !== 'Cancelled') entry.spend += booking.total;
      if (booking.startDate > entry.last) entry.last = booking.startDate;
      map.set(key, entry);
    });
    return [...map.values()].sort((a, b) => b.spend - a.spend);
  }, [bookings]);

  const filteredBookings =
    statusFilter === 'All' ? bookings : bookings.filter((booking) => booking.status === statusFilter);

  if (!admin) return <LoginScreen onSignIn={signInAdmin} />;

  const saveCar = (event) => {
    event.preventDefault();
    const payload = {
      ...carForm,
      price: Number(carForm.price),
      deposit: Number(carForm.deposit),
      image: carForm.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1500&q=80',
    };
    if (carForm.id) {
      updateCar(carForm.id, payload);
      flash(`${payload.name} updated.`);
    } else {
      addCar(payload);
      flash(`${payload.name} added to the fleet.`);
    }
    setCarForm(null);
  };

  return (
    <div className="admin-shell">
      <aside className="admin-aside">
        <Link to="/" className="brand">
          <span className="brand-mark">D</span>
          <span className="brand-text">Drive<span>Now</span></span>
        </Link>
        <span className="admin-badge">Admin console</span>
        <nav className="admin-links">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-link ${view === item.id ? 'on' : ''}`}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-aside-foot">
          <button type="button" className="btn btn-ghost btn-sm btn-block" onClick={resetDemo}>
            Reset demo data
          </button>
          <Link to="/" className="btn btn-ghost btn-sm btn-block">View website</Link>
          <button type="button" className="btn btn-danger btn-sm btn-block" onClick={signOutAdmin}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-top">
          <div>
            <p className="eyebrow">DriveNow operations</p>
            <h1>{VIEWS.find((item) => item.id === view)?.label}</h1>
          </div>
          <div className="admin-top-meta">
            <span className="pill">{cars.length} cars</span>
            <span className="pill">{bookings.length} bookings</span>
          </div>
        </header>

        {notice && <div className="toast">{notice}</div>}

        {view === 'overview' && (
          <>
            <div className="kpi-grid">
              <div className="kpi">
                <span>Revenue (live)</span>
                <strong>{money(revenue)}</strong>
                <small className="kpi-trend up">+12.4% vs last month</small>
              </div>
              <div className="kpi">
                <span>Active bookings</span>
                <strong>{active.length}</strong>
                <small className="kpi-trend up">+{active.filter((b) => b.status === 'Confirmed').length} confirmed</small>
              </div>
              <div className="kpi">
                <span>Fleet utilisation</span>
                <strong>{utilisation}%</strong>
                <small className="kpi-trend">{cars.filter((car) => car.available).length} of {cars.length} available</small>
              </div>
              <div className="kpi">
                <span>Average rating</span>
                <strong>{avgRating.toFixed(1)} ★</strong>
                <small className="kpi-trend">{reviews.length} reviews</small>
              </div>
            </div>

            <div className="panel">
              <h2>Revenue by month</h2>
              <div className="chart">
                {monthly.buckets.map((bucket) => (
                  <div className="chart-bar" key={bucket.label}>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ height: `${Math.round((bucket.value / monthly.max) * 100)}%` }}
                        title={money(bucket.value)}
                      />
                    </div>
                    <span className="chart-label">{bucket.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <h2>Recent bookings</h2>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>ID</th><th>Customer</th><th>Car</th><th>Dates</th><th>Total</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 6).map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.id}</td>
                        <td>{booking.customer}</td>
                        <td>{booking.carName}</td>
                        <td>{formatDate(booking.startDate)}</td>
                        <td>{money(booking.total)}</td>
                        <td><span className={`status status-${booking.status.toLowerCase()}`}>{booking.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {view === 'fleet' && (
          <div className="panel">
            <div className="toolbar">
              <h2>Fleet · {cars.length} cars</h2>
              <button type="button" className="btn btn-primary" onClick={() => setCarForm({ ...blankCar })}>
                Add a car
              </button>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Car</th><th>Type</th><th>Price/day</th><th>Seats</th><th>Available</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td>
                        <div className="cell-car">
                          <img src={car.image} alt="" />
                          <span>{car.name}</span>
                        </div>
                      </td>
                      <td>{car.type}</td>
                      <td>{money(car.price)}</td>
                      <td>{car.specs.seats}</td>
                      <td>
                        <button
                          type="button"
                          className={`toggle ${car.available ? 'on' : ''}`}
                          onClick={() => updateCar(car.id, { available: !car.available })}
                        >
                          {car.available ? 'Available' : 'Hidden'}
                        </button>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCarForm({ ...car })}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              removeCar(car.id);
                              flash(`${car.name} removed.`);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'bookings' && (
          <div className="panel">
            <div className="toolbar">
              <h2>Bookings · {filteredBookings.length}</h2>
              <select className="input narrow" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {['All', ...STATUSES].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>ID</th><th>Customer</th><th>Car</th><th>Pickup</th><th>Dates</th><th>Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>
                        <div className="cell-stack">
                          <strong>{booking.customer}</strong>
                          <span className="muted small">{booking.email}</span>
                        </div>
                      </td>
                      <td>{booking.carName}</td>
                      <td>{booking.pickup}</td>
                      <td>{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</td>
                      <td>{money(booking.total)}</td>
                      <td>
                        <select
                          className="input narrow"
                          value={booking.status}
                          onChange={(event) => setBookingStatus(booking.id, event.target.value)}
                        >
                          {STATUSES.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'customers' && (
          <div className="panel">
            <h2>Customers · {customers.length}</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>Trips</th><th>Lifetime spend</th><th>Last rental</th></tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.email}>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.trips}</td>
                      <td>{money(customer.spend)}</td>
                      <td>{formatDate(customer.last)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'promotions' && (
          <div className="panel">
            <h2>Promo codes</h2>
            <form
              className="promo-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!promoForm.code.trim()) return;
                addPromo({
                  code: promoForm.code.trim().toUpperCase(),
                  type: promoForm.type,
                  value: Number(promoForm.value),
                  label: promoForm.type === 'percent' ? `${promoForm.value}% off` : `₹${promoForm.value} off`,
                });
                flash('Promo code created.');
                setPromoForm({ code: '', type: 'percent', value: 10 });
              }}
            >
              <input
                className="input"
                value={promoForm.code}
                onChange={(event) => setPromoForm({ ...promoForm, code: event.target.value.toUpperCase() })}
                placeholder="NEWCODE"
              />
              <select className="input" value={promoForm.type} onChange={(event) => setPromoForm({ ...promoForm, type: event.target.value })}>
                <option value="percent">Percent off</option>
                <option value="flat">Flat amount</option>
              </select>
              <input
                className="input"
                type="number"
                min="1"
                value={promoForm.value}
                onChange={(event) => setPromoForm({ ...promoForm, value: event.target.value })}
              />
              <button type="submit" className="btn btn-primary">Create code</button>
            </form>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Code</th><th>Discount</th><th>Times used</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {promos.map((promo) => (
                    <tr key={promo.code}>
                      <td><strong>{promo.code}</strong></td>
                      <td>{promo.label}</td>
                      <td>{promo.uses}</td>
                      <td>
                        <button type="button" className={`toggle ${promo.active ? 'on' : ''}`} onClick={() => togglePromo(promo.code)}>
                          {promo.active ? 'Active' : 'Paused'}
                        </button>
                      </td>
                      <td>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => togglePromo(promo.code)}>
                          {promo.active ? 'Pause' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'reviews' && (
          <div className="panel">
            <h2>Reviews · {reviews.length}</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Customer</th><th>Car</th><th>Rating</th><th>Review</th><th>Date</th><th /></tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td>{review.name}</td>
                      <td>{cars.find((car) => car.id === review.carId)?.name || 'Removed car'}</td>
                      <td>{review.rating} ★</td>
                      <td className="wrap">{review.text}</td>
                      <td>{formatDate(review.date)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            removeReview(review.id);
                            flash('Review removed.');
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {carForm && (
        <div className="modal" onClick={(event) => event.target === event.currentTarget && setCarForm(null)}>
          <form className="modal-card wide" onSubmit={saveCar} role="dialog" aria-modal="true" aria-label="Car form">
            <div className="modal-head">
              <h3>{carForm.id ? `Edit ${carForm.name}` : 'Add a car'}</h3>
              <button type="button" className="btn btn-icon" onClick={() => setCarForm(null)} aria-label="Close">×</button>
            </div>
            <div className="modal-body grid-2">
              <label className="field">
                <span className="field-label">Name</span>
                <input className="input" value={carForm.name} onChange={(event) => setCarForm({ ...carForm, name: event.target.value })} required />
              </label>
              <label className="field">
                <span className="field-label">Brand</span>
                <input className="input" value={carForm.brand} onChange={(event) => setCarForm({ ...carForm, brand: event.target.value })} required />
              </label>
              <label className="field">
                <span className="field-label">Type label</span>
                <input className="input" value={carForm.type} onChange={(event) => setCarForm({ ...carForm, type: event.target.value })} />
              </label>
              <label className="field">
                <span className="field-label">Category</span>
                <select className="input" value={carForm.category} onChange={(event) => setCarForm({ ...carForm, category: event.target.value })}>
                  {['sedan', 'suv', 'muv', 'luxury', 'sports', 'electric'].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field-label">Price per day (₹)</span>
                <input className="input" type="number" min="500" value={carForm.price} onChange={(event) => setCarForm({ ...carForm, price: event.target.value })} required />
              </label>
              <label className="field">
                <span className="field-label">Security deposit (₹)</span>
                <input className="input" type="number" min="0" value={carForm.deposit} onChange={(event) => setCarForm({ ...carForm, deposit: event.target.value })} />
              </label>
              <label className="field full">
                <span className="field-label">Image URL</span>
                <input className="input" value={carForm.image} onChange={(event) => setCarForm({ ...carForm, image: event.target.value })} placeholder="https://…" />
              </label>
              <label className="field full">
                <span className="field-label">Description</span>
                <textarea className="input" rows="3" value={carForm.description} onChange={(event) => setCarForm({ ...carForm, description: event.target.value })} />
              </label>
              <label className="check-row full">
                <input type="checkbox" checked={carForm.available} onChange={(event) => setCarForm({ ...carForm, available: event.target.checked })} />
                Show this car as available
              </label>
              <div className="form-actions full">
                <button type="button" className="btn btn-ghost" onClick={() => setCarForm(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{carForm.id ? 'Save changes' : 'Add car'}</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
