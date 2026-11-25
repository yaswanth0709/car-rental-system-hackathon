import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CarCard, SectionHead, Stars } from '../components';
import { addDays, buildQuote, extras, formatDate, diffDays, money, todayISO } from '../data';
import { useApp } from '../store';

export default function CarDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { cars, reviews, profile, addReview, favourites, toggleFavourite } = useApp();

  const car = cars.find((item) => item.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [start, setStart] = useState(searchParams.get('start') || addDays(todayISO(), 1));
  const [end, setEnd] = useState(searchParams.get('end') || addDays(todayISO(), 4));
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, text: '' });
  const [reviewSent, setReviewSent] = useState(false);

  const days = diffDays(start, end);
  const quote = useMemo(
    () => buildQuote({ price: car?.price || 0, days, extraIds: selectedExtras }),
    [car, days, selectedExtras]
  );

  if (!car) {
    return (
      <div className="container section">
        <h1>Car not found</h1>
        <p className="section-sub">The car you were looking for is no longer in the fleet.</p>
        <Link to="/cars" className="btn btn-primary">Back to the fleet</Link>
      </div>
    );
  }

  const carReviews = reviews.filter((review) => review.carId === car.id);
  const similar = cars.filter((item) => item.category === car.category && item.id !== car.id).slice(0, 3);
  const gallery = car.gallery?.length ? car.gallery : [car.image];
  const saved = favourites.includes(car.id);

  const toggleExtra = (extraId) =>
    setSelectedExtras((list) =>
      list.includes(extraId) ? list.filter((item) => item !== extraId) : [...list, extraId]
    );

  const checkoutLink = `/checkout/${car.id}?start=${start}&end=${end}&extras=${selectedExtras.join(',')}`;

  const submitReview = (event) => {
    event.preventDefault();
    if (!reviewDraft.text.trim()) return;
    addReview({
      carId: car.id,
      name: profile.name,
      rating: Number(reviewDraft.rating),
      date: todayISO(),
      text: reviewDraft.text.trim(),
    });
    setReviewDraft({ rating: 5, text: '' });
    setReviewSent(true);
  };

  return (
    <>
      <div className="container-wide detail-head">
        <nav className="crumbs">
          <Link to="/cars">Fleet</Link>
          <span>/</span>
          <Link to={`/cars/${car.category}`}>{car.type}</Link>
          <span>/</span>
          <span>{car.name}</span>
        </nav>
        <div className="detail-title">
          <div>
            <p className="eyebrow">{car.brand} · {car.specs.year} · {car.location}</p>
            <h1>{car.name}</h1>
          </div>
          <div className="detail-title-side">
            <Stars rating={car.rating} count={car.reviewsCount} />
            <button
              type="button"
              className={`btn btn-ghost btn-sm ${saved ? 'saved' : ''}`}
              onClick={() => toggleFavourite(car.id)}
            >
              {saved ? '♥ Saved' : '♡ Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="container-wide detail-grid">
        <div>
          <div className="gallery">
            <img className="gallery-main" src={gallery[activeImage]} alt={`${car.name} view ${activeImage + 1}`} />
            <div className="thumbs">
              {gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={`thumb ${index === activeImage ? 'on' : ''}`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>About this car</h2>
            <p className="muted">{car.description}</p>
            <div className="spec-grid">
              {Object.entries({
                Transmission: car.specs.transmission,
                Fuel: car.specs.fuel,
                Seats: car.specs.seats,
                Doors: car.specs.doors,
                Luggage: `${car.specs.luggage} bags`,
                Engine: car.specs.engine,
                Mileage: car.specs.mileage,
                Drivetrain: car.specs.drivetrain,
                'Top speed': car.specs.topSpeed,
                'Model year': car.specs.year,
              }).map(([label, value]) => (
                <div className="spec" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="panel two-col">
            <div>
              <h3>Features</h3>
              <ul className="list-check">
                {car.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Included in the price</h3>
              <ul className="list-check">
                {car.included.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="panel">
            <h2>Reviews · {carReviews.length}</h2>
            {carReviews.length === 0 && <p className="muted">No reviews yet. Be the first to drive and tell us about it.</p>}
            <div className="review-list">
              {carReviews.map((review) => (
                <article className="review" key={review.id}>
                  <div className="review-head">
                    <span className="avatar">{review.name.charAt(0)}</span>
                    <div>
                      <strong>{review.name}</strong>
                      <span className="muted">{formatDate(review.date)}</span>
                    </div>
                    <Stars rating={review.rating} />
                  </div>
                  <p>{review.text}</p>
                </article>
              ))}
            </div>

            <form className="review-form" onSubmit={submitReview}>
              <h3>Write a review</h3>
              {reviewSent && <p className="ok">Thanks — your review has been added.</p>}
              <div className="review-form-row">
                <label className="field">
                  <span className="field-label">Rating</span>
                  <select
                    className="input"
                    value={reviewDraft.rating}
                    onChange={(event) => setReviewDraft({ ...reviewDraft, rating: event.target.value })}
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>{value} ★</option>
                    ))}
                  </select>
                </label>
                <label className="field grow">
                  <span className="field-label">Your review</span>
                  <input
                    className="input"
                    value={reviewDraft.text}
                    onChange={(event) => setReviewDraft({ ...reviewDraft, text: event.target.value })}
                    placeholder="How was the car and the handover?"
                  />
                </label>
              </div>
              <button type="submit" className="btn btn-primary">Post review</button>
            </form>
          </div>
        </div>

        <aside className="booking-panel">
          <div className="panel sticky">
            <div className="panel-price">
              {money(car.price)}
              <span>/day</span>
            </div>
            <p className="muted">
              {car.available ? 'Available for your dates' : 'Currently unavailable — join the waitlist'}
            </p>

            <div className="date-row">
              <label className="field">
                <span className="field-label">Pickup</span>
                <input
                  className="input"
                  type="date"
                  min={todayISO()}
                  value={start}
                  onChange={(event) => {
                    setStart(event.target.value);
                    if (event.target.value >= end) setEnd(addDays(event.target.value, 2));
                  }}
                />
              </label>
              <label className="field">
                <span className="field-label">Return</span>
                <input
                  className="input"
                  type="date"
                  min={addDays(start || todayISO(), 1)}
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                />
              </label>
            </div>

            <div className="filter-block">
              <h3 className="filter-title">Add extras</h3>
              {extras.map((extra) => (
                <label className="check-row" key={extra.id}>
                  <input
                    type="checkbox"
                    checked={selectedExtras.includes(extra.id)}
                    onChange={() => toggleExtra(extra.id)}
                  />
                  <span>{extra.label}</span>
                  <span className="check-price">
                    {money(extra.price)}
                    {extra.perDay ? '/day' : ' once'}
                  </span>
                </label>
              ))}
            </div>

            <div className="summary">
              <div className="summary-row">
                <span>{money(car.price)} × {days || 0} day{days === 1 ? '' : 's'}</span>
                <strong>{money(quote.gross)}</strong>
              </div>
              {quote.longStay > 0 && (
                <div className="summary-row discount">
                  <span>Long-rental discount (15%)</span>
                  <strong>−{money(quote.longStay)}</strong>
                </div>
              )}
              {quote.extrasTotal > 0 && (
                <div className="summary-row">
                  <span>Extras</span>
                  <strong>{money(quote.extrasTotal)}</strong>
                </div>
              )}
              <div className="summary-row">
                <span>Taxes &amp; fees (18%)</span>
                <strong>{money(quote.taxes)}</strong>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <strong>{money(quote.total)}</strong>
              </div>
              <p className="muted small">Refundable deposit of {money(car.deposit)} held at pickup.</p>
            </div>

            {days > 0 ? (
              <Link to={checkoutLink} className="btn btn-primary btn-block">
                Continue to checkout
              </Link>
            ) : (
              <button type="button" className="btn btn-primary btn-block" disabled>
                Select valid dates
              </button>
            )}
            <p className="center muted small">Free cancellation up to 24 hours before pickup.</p>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="section container-wide">
          <SectionHead eyebrow="You may also like" title="Similar cars" action={<Link to={`/cars/${car.category}`} className="btn btn-ghost">See all {car.type}</Link>} />
          <div className="car-grid">
            {similar.map((item) => (
              <CarCard car={item} key={item.id} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
