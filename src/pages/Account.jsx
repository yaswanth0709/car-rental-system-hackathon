import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CarCard, Empty, Field } from '../components';
import { formatDate, money } from '../data';
import { useApp } from '../store';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'bookings', label: 'My bookings' },
  { id: 'favourites', label: 'Saved cars' },
  { id: 'profile', label: 'Profile' },
  { id: 'documents', label: 'Documents' },
];

export default function Account() {
  const {
    profile,
    bookings,
    cars,
    favourites,
    cancelBooking,
    updateProfile,
    addDocument,
    removeDocument,
  } = useApp();

  const [tab, setTab] = useState('overview');
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [docName, setDocName] = useState('Driving licence');
  const [docMessage, setDocMessage] = useState('');

  const mine = bookings.filter((booking) => booking.email === profile.email);
  const savedCars = cars.filter((car) => favourites.includes(car.id));
  const upcoming = mine.filter((booking) => ['Confirmed', 'Pending'].includes(booking.status));
  const completed = mine.filter((booking) => booking.status === 'Completed');
  const spend = completed.reduce((sum, booking) => sum + booking.total, 0);
  const nextTrip = upcoming[0];

  const saveProfile = (event) => {
    event.preventDefault();
    updateProfile(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="container account">
      <div className="account-head">
        <div className="account-user">
          <span className="avatar lg">{profile.name.charAt(0)}</span>
          <div>
            <p className="eyebrow">{profile.tier} member · since {formatDate(profile.memberSince)}</p>
            <h1>{profile.name}</h1>
            <p className="muted">{profile.email} · {profile.phone}</p>
          </div>
        </div>
        <Link to="/cars" className="btn btn-primary">Book a car</Link>
      </div>

      <div className="tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`tab ${tab === item.id ? 'tab-on' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            {item.id === 'bookings' && <span className="tab-count">{mine.length}</span>}
            {item.id === 'favourites' && <span className="tab-count">{savedCars.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="account-grid">
          <div className="kpi-grid">
            <div className="kpi"><span>Upcoming trips</span><strong>{upcoming.length}</strong></div>
            <div className="kpi"><span>Completed rentals</span><strong>{completed.length}</strong></div>
            <div className="kpi"><span>Total spent</span><strong>{money(spend)}</strong></div>
            <div className="kpi"><span>Saved cars</span><strong>{savedCars.length}</strong></div>
          </div>

          {nextTrip ? (
            <div className="panel">
              <h2>Your next trip</h2>
              <div className="next-trip">
                <img src={cars.find((car) => car.id === nextTrip.carId)?.image} alt={nextTrip.carName} />
                <div>
                  <h3>{nextTrip.carName}</h3>
                  <p className="muted">{formatDate(nextTrip.startDate)} → {formatDate(nextTrip.endDate)} · {nextTrip.days} days</p>
                  <p className="muted">{nextTrip.pickup} · {nextTrip.pickupTime}</p>
                  <span className={`status status-${nextTrip.status.toLowerCase()}`}>{nextTrip.status}</span>
                </div>
                <div className="next-trip-price">
                  <strong>{money(nextTrip.total)}</strong>
                  <span className="muted small">Booking {nextTrip.id}</span>
                </div>
              </div>
            </div>
          ) : (
            <Empty title="No upcoming trips" action={<Link to="/cars" className="btn btn-primary">Find a car</Link>}>
              Your next booking will show up here with pickup details and directions.
            </Empty>
          )}

          {savedCars.length > 0 && (
            <div className="panel">
              <h2>Saved for later</h2>
              <div className="car-grid">
                {savedCars.slice(0, 3).map((car) => (
                  <CarCard car={car} key={car.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'bookings' && (
        <div className="panel">
          <h2>My bookings</h2>
          {mine.length === 0 ? (
            <Empty title="No bookings yet">Once you book a car it will appear here with your invoice.</Empty>
          ) : (
            <div className="booking-list">
              {mine.map((booking) => (
                <article className="booking-item" key={booking.id}>
                  <img src={cars.find((car) => car.id === booking.carId)?.image} alt={booking.carName} />
                  <div className="booking-main">
                    <div className="booking-top">
                      <h3>{booking.carName}</h3>
                      <span className={`status status-${booking.status.toLowerCase()}`}>{booking.status}</span>
                    </div>
                    <p className="muted small">
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)} · {booking.days} days · {booking.pickup}
                    </p>
                    <p className="muted small">
                      Booking {booking.id} · Created {formatDate(booking.createdAt)}
                      {booking.extras.length > 0 && ` · ${booking.extras.join(', ')}`}
                    </p>
                  </div>
                  <div className="booking-side">
                    <strong>{money(booking.total)}</strong>
                    <div className="row-actions">
                      <Link to={`/car/${booking.carId}`} className="btn btn-ghost btn-sm">View car</Link>
                      {['Confirmed', 'Pending'].includes(booking.status) && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'favourites' && (
        <div className="panel">
          <h2>Saved cars</h2>
          {savedCars.length === 0 ? (
            <Empty title="Nothing saved yet" action={<Link to="/cars" className="btn btn-primary">Browse the fleet</Link>}>
              Tap the heart on any car to keep it here.
            </Empty>
          ) : (
            <div className="car-grid">
              {savedCars.map((car) => (
                <CarCard car={car} key={car.id} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'profile' && (
        <div className="panel">
          <h2>Profile details</h2>
          {saved && <p className="ok">Profile updated.</p>}
          <form className="grid-2" onSubmit={saveProfile}>
            <Field label="Full name">
              <input className="input" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required />
            </Field>
            <Field label="Email">
              <input className="input" type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} required />
            </Field>
            <Field label="Phone">
              <input className="input" type="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} required />
            </Field>
            <Field label="Licence number">
              <input className="input" value={draft.licence} onChange={(event) => setDraft({ ...draft, licence: event.target.value })} />
            </Field>
            <Field label="City">
              <input className="input" value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} />
            </Field>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Save changes</button>
            </div>
          </form>
        </div>
      )}

      {tab === 'documents' && (
        <div className="panel">
          <h2>Verification documents</h2>
          <p className="muted">Upload once and reuse for every booking. Documents are reviewed within a few hours.</p>
          {docMessage && <p className="ok">{docMessage}</p>}
          <div className="doc-list">
            {profile.documents.map((doc) => (
              <div className="doc-row" key={doc.id}>
                <div>
                  <strong>{doc.name}</strong>
                  <span className="muted small">Added {formatDate(doc.added)}</span>
                </div>
                <span className={`status ${doc.status === 'Verified' ? 'status-completed' : 'status-pending'}`}>{doc.status}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeDocument(doc.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <form
            className="doc-form"
            onSubmit={(event) => {
              event.preventDefault();
              addDocument({ name: docName });
              setDocMessage(`${docName} uploaded — pending review.`);
              setTimeout(() => setDocMessage(''), 3000);
            }}
          >
            <select className="input" value={docName} onChange={(event) => setDocName(event.target.value)}>
              {['Driving licence', 'Aadhaar card', 'Passport', 'Address proof'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Upload document</button>
          </form>
        </div>
      )}
    </div>
  );
}
