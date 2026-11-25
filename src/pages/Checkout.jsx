import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Field, Modal } from '../components';
import { addDays, buildQuote, diffDays, extras as extraList, findPromo, formatDate, money, pickupLocations, todayISO } from '../data';
import { useApp } from '../store';

const STEPS = ['Trip', 'Extras & driver', 'Payment'];

export default function Checkout() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { cars, profile, addBooking } = useApp();
  const car = cars.find((item) => item.id === id);

  const [step, setStep] = useState(0);
  const [start, setStart] = useState(searchParams.get('start') || addDays(todayISO(), 1));
  const [end, setEnd] = useState(searchParams.get('end') || addDays(todayISO(), 3));
  const [pickup, setPickup] = useState(pickupLocations[0].name);
  const [dropoff, setDropoff] = useState(pickupLocations[0].name);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [selectedExtras, setSelectedExtras] = useState(
    (searchParams.get('extras') || '').split(',').filter(Boolean)
  );
  const [driver, setDriver] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    licence: profile.licence,
  });
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState('');
  const [promoNote, setPromoNote] = useState('');
  const [payment, setPayment] = useState('card');
  const [agree, setAgree] = useState(false);
  const [done, setDone] = useState(null);

  const days = diffDays(start, end);
  const quote = useMemo(
    () => buildQuote({ price: car?.price || 0, days, extraIds: selectedExtras, promo }),
    [car, days, selectedExtras, promo]
  );

  if (!car) {
    return (
      <div className="container section">
        <h1>Car not found</h1>
        <Link to="/cars" className="btn btn-primary">Back to the fleet</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container section">
        <div className="confirmation">
          <span className="success-icon">✓</span>
          <h1>Booking confirmed</h1>
          <p className="section-sub">
            A confirmation has been sent to {done.email}. Your car will be ready at
            {' '}{done.pickup} on {formatDate(done.startDate)} at {done.pickupTime}.
          </p>
          <div className="summary">
            <div className="summary-row"><span>Booking ID</span><strong>{done.id}</strong></div>
            <div className="summary-row"><span>Car</span><strong>{done.carName}</strong></div>
            <div className="summary-row"><span>Dates</span><strong>{formatDate(done.startDate)} → {formatDate(done.endDate)}</strong></div>
            <div className="summary-row"><span>Days</span><strong>{done.days}</strong></div>
            <div className="summary-row"><span>Deposit held</span><strong>{money(done.deposit)}</strong></div>
            <div className="summary-row total"><span>Paid</span><strong>{money(done.total)}</strong></div>
          </div>
          <div className="row-actions">
            <Link to="/account" className="btn btn-primary">View my bookings</Link>
            <Link to="/cars" className="btn btn-ghost">Book another car</Link>
          </div>
        </div>
      </div>
    );
  }

  const stepValid =
    step === 0
      ? Boolean(pickup && dropoff && days > 0)
      : step === 1
        ? Boolean(driver.name.trim() && driver.email.trim() && driver.phone.trim() && driver.licence.trim())
        : agree;

  const applyPromo = () => {
    const found = findPromo(promoInput);
    if (!found) {
      setPromo('');
      setPromoNote('That code is not valid or has expired.');
      return;
    }
    setPromo(found.code);
    setPromoNote(`${found.code} applied — ${found.label}.`);
  };

  const confirmBooking = () => {
    if (!agree || days <= 0) return;
    const booking = {
      id: `DN-${Math.floor(1000 + Math.random() * 9000)}`,
      carId: car.id,
      carName: car.name,
      customer: driver.name.trim(),
      email: driver.email.trim(),
      phone: driver.phone.trim(),
      pickup,
      dropoff,
      pickupTime,
      startDate: start,
      endDate: end,
      days,
      extras: quote.selectedExtras.map((extra) => extra.label),
      base: quote.gross,
      extrasTotal: quote.extrasTotal,
      discount: quote.longStay + quote.promoDiscount,
      taxes: quote.taxes,
      deposit: car.deposit,
      total: quote.total,
      status: 'Confirmed',
      createdAt: todayISO(),
    };
    addBooking(booking);
    setDone(booking);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleExtra = (extraId) =>
    setSelectedExtras((list) =>
      list.includes(extraId) ? list.filter((item) => item !== extraId) : [...list, extraId]
    );

  return (
    <div className="container checkout">
      <div className="crumbs">
        <Link to={`/car/${car.id}`}>{car.name}</Link>
        <span>/</span>
        <span>Checkout</span>
      </div>

      <div className="stepper">
        {STEPS.map((label, index) => (
          <div className={`stepper-item ${index === step ? 'on' : ''} ${index < step ? 'done' : ''}`} key={label}>
            <span className="stepper-num">{index < step ? '✓' : index + 1}</span>
            <span className="stepper-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="checkout-grid">
        <section className="panel">
          {step === 0 && (
            <>
              <h2>Where and when</h2>
              <div className="grid-2">
                <Field label="Pickup location">
                  <select className="input" value={pickup} onChange={(event) => setPickup(event.target.value)}>
                    {pickupLocations.map((place) => (
                      <option key={place.name} value={place.name}>{place.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Return location">
                  <select className="input" value={dropoff} onChange={(event) => setDropoff(event.target.value)}>
                    {pickupLocations.map((place) => (
                      <option key={place.name} value={place.name}>{place.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Pickup date">
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
                </Field>
                <Field label="Return date">
                  <input
                    className="input"
                    type="date"
                    min={addDays(start || todayISO(), 1)}
                    value={end}
                    onChange={(event) => setEnd(event.target.value)}
                  />
                </Field>
                <Field label="Pickup time">
                  <select className="input" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)}>
                    {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'].map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Rental length" hint="7+ days get an automatic 15% discount.">
                  <input className="input" value={days ? `${days} day${days === 1 ? '' : 's'}` : 'Select dates'} readOnly />
                </Field>
              </div>
              <p className="muted small">
                {pickup === dropoff
                  ? 'Same-city return is free. Returning to a different branch in the same city is also free.'
                  : 'A one-way fee may apply if the cities differ; our team will confirm before pickup.'}
              </p>
            </>
          )}

          {step === 1 && (
            <>
              <h2>Extras</h2>
              <div className="extra-grid">
                {extraList.map((extra) => (
                  <label className={`extra-card ${selectedExtras.includes(extra.id) ? 'on' : ''}`} key={extra.id}>
                    <input
                      type="checkbox"
                      checked={selectedExtras.includes(extra.id)}
                      onChange={() => toggleExtra(extra.id)}
                    />
                    <div>
                      <strong>{extra.label}</strong>
                      <span>{money(extra.price)}{extra.perDay ? ' / day' : ' once'}</span>
                    </div>
                  </label>
                ))}
              </div>

              <h2>Driver details</h2>
              <div className="grid-2">
                <Field label="Full name">
                  <input className="input" value={driver.name} onChange={(event) => setDriver({ ...driver, name: event.target.value })} />
                </Field>
                <Field label="Email">
                  <input className="input" type="email" value={driver.email} onChange={(event) => setDriver({ ...driver, email: event.target.value })} />
                </Field>
                <Field label="Phone">
                  <input className="input" type="tel" value={driver.phone} onChange={(event) => setDriver({ ...driver, phone: event.target.value })} />
                </Field>
                <Field label="Driving licence number">
                  <input className="input" value={driver.licence} onChange={(event) => setDriver({ ...driver, licence: event.target.value })} />
                </Field>
              </div>
              <p className="muted small">Licence and ID are verified at pickup. Upload them once in your account to skip this step next time.</p>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Payment</h2>
              <div className="pay-options">
                {[
                  { id: 'card', label: 'Credit / debit card', note: 'Visa, Mastercard, RuPay' },
                  { id: 'upi', label: 'UPI', note: 'Pay by any UPI app' },
                  { id: 'branch', label: 'Pay at branch', note: 'Card or cash at pickup' },
                ].map((option) => (
                  <label className={`pay-option ${payment === option.id ? 'on' : ''}`} key={option.id}>
                    <input
                      type="radio"
                      name="payment"
                      value={option.id}
                      checked={payment === option.id}
                      onChange={() => setPayment(option.id)}
                    />
                    <div>
                      <strong>{option.label}</strong>
                      <span>{option.note}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="promo-row">
                <input
                  className="input"
                  value={promoInput}
                  onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                  placeholder="Promo code (try DRIVE10)"
                />
                <button type="button" className="btn btn-ghost" onClick={applyPromo}>Apply</button>
              </div>
              {promoNote && <p className={promo ? 'ok small' : 'error small'}>{promoNote}</p>}

              <label className="check-row agree">
                <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} />
                I confirm I hold a valid licence and accept the rental terms, fuel policy and the refundable deposit of {money(car.deposit)}.
              </label>
            </>
          )}

          <div className="step-nav">
            {step > 0 && (
              <button type="button" className="btn btn-ghost" onClick={() => setStep((value) => value - 1)}>
                Back
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={!stepValid}
                onClick={() => setStep((value) => value + 1)}
              >
                Continue
              </button>
            ) : (
              <button type="button" className="btn btn-primary" disabled={!stepValid} onClick={confirmBooking}>
                Pay {money(quote.total)} &amp; confirm
              </button>
            )}
          </div>
        </section>

        <aside className="panel summary-card">
          <img src={car.image} alt={car.name} />
          <h3>{car.name}</h3>
          <p className="muted small">{car.type} · {car.specs.transmission} · {car.specs.seats} seats</p>
          <div className="summary">
            <div className="summary-row"><span>{money(car.price)} × {days || 0} day{days === 1 ? '' : 's'}</span><strong>{money(quote.gross)}</strong></div>
            {quote.longStay > 0 && <div className="summary-row discount"><span>Long-rental discount</span><strong>−{money(quote.longStay)}</strong></div>}
            {quote.promoDiscount > 0 && <div className="summary-row discount"><span>Promo {promo}</span><strong>−{money(quote.promoDiscount)}</strong></div>}
            {quote.extrasTotal > 0 && <div className="summary-row"><span>Extras</span><strong>{money(quote.extrasTotal)}</strong></div>}
            <div className="summary-row"><span>Taxes (18%)</span><strong>{money(quote.taxes)}</strong></div>
            <div className="summary-row"><span>Deposit (refundable)</span><strong>{money(car.deposit)}</strong></div>
            <div className="summary-row total"><span>Total due</span><strong>{money(quote.total)}</strong></div>
          </div>
          <ul className="list-check small">
            <li>Free cancellation up to 24h before pickup</li>
            <li>Insurance and roadside assistance included</li>
            <li>Deposit released within 48h of return</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
