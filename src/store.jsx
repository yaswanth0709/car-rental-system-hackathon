import { createContext, useContext, useEffect, useState } from 'react';
import { seedCars, seedBookings, seedReviews, promoCodes } from './data';

const AppContext = createContext(null);
const STORAGE_KEY = 'drivenow.v2';

const seedPromos = Object.entries(promoCodes).map(([code, def], index) => ({
  code,
  ...def,
  uses: 4 + index * 7,
  active: true,
}));

const defaults = () => ({
  cars: seedCars,
  bookings: seedBookings,
  reviews: seedReviews,
  favourites: ['tesla-model-3', 'porsche-911'],
  promos: seedPromos,
  profile: {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    licence: 'TS09 2024 0012345',
    city: 'Hyderabad',
    memberSince: '2025-08-14',
    tier: 'Gold',
    documents: [
      { id: 'd1', name: 'Driving licence', status: 'Verified', added: '2025-08-14' },
      { id: 'd2', name: 'Aadhaar card', status: 'Verified', added: '2025-08-14' },
    ],
  },
  admin: false,
});

function readSaved() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults(), ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

const slug = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function AppProvider({ children }) {
  const [state, setState] = useState(() => readSaved() || defaults());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — keep working in memory */
    }
  }, [state]);

  const addBooking = (booking) =>
    setState((s) => ({
      ...s,
      bookings: [
        { ...booking, id: booking.id || `DN-${Math.floor(1000 + Math.random() * 9000)}` },
        ...s.bookings,
      ],
    }));

  const setBookingStatus = (id, status) =>
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
    }));

  const cancelBooking = (id) => setBookingStatus(id, 'Cancelled');

  const toggleFavourite = (id) =>
    setState((s) => ({
      ...s,
      favourites: s.favourites.includes(id)
        ? s.favourites.filter((f) => f !== id)
        : [...s.favourites, id],
    }));

  const addReview = (review) =>
    setState((s) => ({ ...s, reviews: [{ ...review, id: `r${Date.now()}` }, ...s.reviews] }));

  const removeReview = (id) =>
    setState((s) => ({ ...s, reviews: s.reviews.filter((r) => r.id !== id) }));

  const addCar = (car) =>
    setState((s) => ({
      ...s,
      cars: [
        {
          ...car,
          id: `${slug(car.name)}-${Math.floor(Math.random() * 900 + 100)}`,
          rating: car.rating ?? 5,
          reviewsCount: car.reviewsCount ?? 0,
          gallery: car.gallery?.length ? car.gallery : [car.image],
          features: car.features?.length ? car.features : ['Automatic', 'Air conditioning'],
          included: car.included?.length
            ? car.included
            : ['Comprehensive insurance', '24/7 roadside assistance'],
          specs: car.specs || {
            transmission: 'Automatic',
            fuel: 'Petrol',
            seats: 5,
            doors: 4,
            luggage: 2,
            engine: '2.0L',
            mileage: '15 km/l',
            year: 2024,
            drivetrain: 'FWD',
            topSpeed: '190 km/h',
          },
        },
        ...s.cars,
      ],
    }));

  const updateCar = (id, patch) =>
    setState((s) => ({
      ...s,
      cars: s.cars.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));

  const removeCar = (id) =>
    setState((s) => ({ ...s, cars: s.cars.filter((c) => c.id !== id) }));

  const updateProfile = (patch) =>
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));

  const addDocument = (doc) =>
    setState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        documents: [
          ...s.profile.documents,
          { id: `d${Date.now()}`, status: 'Pending review', added: new Date().toLocaleDateString('en-CA'), ...doc },
        ],
      },
    }));

  const removeDocument = (id) =>
    setState((s) => ({
      ...s,
      profile: { ...s.profile, documents: s.profile.documents.filter((d) => d.id !== id) },
    }));

  const addPromo = (promo) =>
    setState((s) => ({
      ...s,
      promos: [{ ...promo, uses: 0, active: true }, ...s.promos.filter((p) => p.code !== promo.code)],
    }));

  const togglePromo = (code) =>
    setState((s) => ({
      ...s,
      promos: s.promos.map((p) => (p.code === code ? { ...p, active: !p.active } : p)),
    }));

  const signInAdmin = (password) => {
    if (password === 'admin123') {
      setState((s) => ({ ...s, admin: true }));
      return true;
    }
    return false;
  };

  const signOutAdmin = () => setState((s) => ({ ...s, admin: false }));

  const resetDemo = () => setState(defaults());

  const value = {
    ...state,
    addBooking,
    setBookingStatus,
    cancelBooking,
    toggleFavourite,
    addReview,
    removeReview,
    addCar,
    updateCar,
    removeCar,
    updateProfile,
    addDocument,
    removeDocument,
    addPromo,
    togglePromo,
    signInAdmin,
    signOutAdmin,
    resetDemo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
