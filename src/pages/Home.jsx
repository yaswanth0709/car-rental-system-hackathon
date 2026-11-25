import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CarCard, SectionHead } from '../components';
import { addDays, categories, pickupLocations, todayISO } from '../data';
import { useApp } from '../store';

const steps = [
  { n: '01', t: 'Pick your car', d: 'Filter by type, seats, fuel or budget and open the full spec sheet before you commit.' },
  { n: '02', t: 'Choose dates', d: 'Live availability, honest per-day pricing and automatic long-rental discounts.' },
  { n: '03', t: 'Verify once', d: 'Upload your licence a single time. Every future booking is one tap.' },
  { n: '04', t: 'Drive away', d: 'Doorstep delivery or branch pickup, with a digital handover checklist.' },
];

const features = [
  { icon: '₹', t: 'No hidden charges', d: 'The price you see includes insurance, taxes and roadside assistance. Deposit is refundable.' },
  { icon: '⟳', t: 'Free cancellation', d: 'Cancel up to 24 hours before pickup for a full refund — 48 hours on sports cars.' },
  { icon: '⛨', t: 'Verified fleet', d: 'Every car is inspected, sanitised and under 3 years old before it is handed over.' },
  { icon: '☎', t: 'Real human support', d: 'A phone number that is answered in under 30 seconds, day or night.' },
  { icon: '⚡', t: 'Instant confirmation', d: 'No waiting for an email. Your car is reserved the moment you pay.' },
  { icon: '⇄', t: 'Flexible return', d: 'Return to any DriveNow branch in the same city at no extra cost.' },
];

const testimonials = [
  { name: 'Meera Nair', city: 'Hyderabad', text: 'Booked a Fortuner for a Coorg trip. Car was immaculate, and the long-stay discount was applied automatically.', rating: 5 },
  { name: 'Rohan Gupta', city: 'Bangalore', text: 'The deposit came back in two days. Compare that to the airport counters that hold it for a week.', rating: 5 },
  { name: 'Sana Iqbal', city: 'Visakhapatnam', text: 'I needed a child seat at 6am. It was already fitted when the car arrived at the beach road branch.', rating: 4 },
];

const faqs = [
  { q: 'What documents do I need?', a: 'A valid driving licence, a government photo ID and a credit or debit card for the refundable security deposit. Upload them once in your account and reuse them for every booking.' },
  { q: 'How is the deposit handled?', a: 'The deposit is authorised at pickup and released within 48 hours of returning the car in the same condition. It is never charged as part of the rental total.' },
  { q: 'What is included in the price?', a: 'Third-party and comprehensive insurance, 18% GST, 24/7 roadside assistance and unlimited kilometres on most cars under fair use. Fuel is not included.' },
  { q: 'Can I cancel or reschedule?', a: 'Yes. Cancellations up to 24 hours before pickup are fully refundable (48 hours for sports and luxury cars). Rescheduling is free once per booking.' },
  { q: 'Do you offer doorstep delivery?', a: 'Delivery and pickup within the city is ₹500 flat and can be added at checkout. Airport handover is always free.' },
];

export default function Home() {
  const { cars } = useApp();
  const navigate = useNavigate();
  const [location, setLocation] = useState(pickupLocations[0].name);
  const [start, setStart] = useState(addDays(todayISO(), 1));
  const [end, setEnd] = useState(addDays(todayISO(), 4));

  const featured = [...cars]
    .filter((car) => car.available)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/cars?location=${encodeURIComponent(location)}&start=${start}&end=${end}`);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow light">Self-drive car rental · Hyderabad</p>
            <h1 className="hero-title">
              The right car,
              <br />
              ready when you are.
            </h1>
            <p className="hero-sub">
              Inspected cars, honest pricing and instant confirmation. From a ₹2,500 city sedan
              to a V10 supercar — with insurance and roadside support included.
            </p>
            <div className="hero-actions">
              <Link to="/cars" className="btn btn-light">
                Browse the fleet
              </Link>
              <Link to="/account" className="btn btn-outline-light">
                My bookings
              </Link>
            </div>
            <ul className="hero-trust">
              <li><strong>{cars.length}</strong> cars in the fleet</li>
              <li><strong>4.8★</strong> average rating</li>
              <li><strong>24/7</strong> roadside support</li>
            </ul>
          </div>

          <form className="search-card" onSubmit={submitSearch}>
            <h2>Check availability</h2>
            <div className="search-grid">
              <label className="field">
                <span className="field-label">Pickup location</span>
                <select className="input" value={location} onChange={(event) => setLocation(event.target.value)}>
                  {pickupLocations.map((place) => (
                    <option key={place.name} value={place.name}>{place.name}</option>
                  ))}
                </select>
              </label>
              <div className="search-dates">
                <label className="field">
                  <span className="field-label">From</span>
                  <input
                    className="input"
                    type="date"
                    min={todayISO()}
                    value={start}
                    onChange={(event) => {
                      setStart(event.target.value);
                      if (event.target.value >= end) setEnd(addDays(event.target.value, 3));
                    }}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field-label">To</span>
                  <input
                    className="input"
                    type="date"
                    min={addDays(start || todayISO(), 1)}
                    value={end}
                    onChange={(event) => setEnd(event.target.value)}
                    required
                  />
                </label>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Show available cars
            </button>
            <p className="search-note">Free cancellation · No hidden fees · Instant confirmation</p>
          </form>
        </div>
      </section>

      <section className="section container-wide">
        <SectionHead
          eyebrow="Browse by type"
          title="Find the drive that fits the trip"
          sub="Each category has its own filtered page with live pricing and availability."
        />
        <div className="cat-grid">
          {categories.slice(1).map((cat) => {
            const count = cars.filter((car) => car.category === cat.slug).length;
            return (
              <Link to={`/cars/${cat.slug}`} className="cat-tile" key={cat.slug}>
                <img src={cat.image} alt={cat.label} loading="lazy" />
                <div className="cat-body">
                  <h3>{cat.label}</h3>
                  <p>{cat.description}</p>
                  <span>{count} car{count === 1 ? '' : 's'} →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section container-wide">
        <SectionHead
          eyebrow="Top rated"
          title="Cars our customers keep coming back for"
          sub="Sorted by real customer ratings from completed rentals."
          action={<Link to="/cars" className="btn btn-ghost">View all cars</Link>}
        />
        <div className="car-grid">
          {featured.map((car) => (
            <CarCard car={car} key={car.id} />
          ))}
        </div>
      </section>

      <section className="section band">
        <div className="container">
          <SectionHead eyebrow="How it works" title="Four steps from search to steering wheel" />
          <div className="steps">
            {steps.map((step) => (
              <div className="step" key={step.n}>
                <span className="step-num">{step.n}</span>
                <h3>{step.t}</h3>
                <p>{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section container-wide">
        <SectionHead eyebrow="Why DriveNow" title="Built around what rentals usually get wrong" />
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.t}>
              <span className="icon-chip" aria-hidden="true">{feature.icon}</span>
              <h3>{feature.t}</h3>
              <p>{feature.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section container">
        <SectionHead eyebrow="Reviews" title="Trusted by 4,000+ self-drive customers" />
        <div className="testi-grid">
          {testimonials.map((item) => (
            <article className="testi" key={item.name}>
              <div className="stars">
                <span className="star">★</span>
                {item.rating.toFixed(1)}
              </div>
              <p>{item.text}</p>
              <div className="testi-head">
                <span className="avatar">{item.name.charAt(0)}</span>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.city}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section container">
        <SectionHead eyebrow="FAQ" title="Questions we get asked most" />
        <div className="faq">
          {faqs.map((item) => (
            <details className="faq-item" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="cta-band">
          <div>
            <h2>Ready when you are.</h2>
            <p>Pick a car, set your dates and get an instant confirmation — no phone calls needed.</p>
          </div>
          <Link to="/cars" className="btn btn-light">
            Start a booking
          </Link>
        </div>
      </section>
    </>
  );
}
