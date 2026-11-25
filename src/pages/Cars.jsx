import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CarCard, Empty, SectionHead } from '../components';
import { categories, formatDate } from '../data';
import { useApp } from '../store';

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'year', label: 'Newest model' },
];

const FUELS = ['Petrol', 'Diesel', 'Electric'];

export default function Cars() {
  const { cars } = useApp();
  const { category = 'all' } = useParams();
  const [searchParams] = useSearchParams();

  const tripStart = searchParams.get('start') || '';
  const tripEnd = searchParams.get('end') || '';
  const tripLocation = searchParams.get('location') || '';

  const [query, setQuery] = useState('');
  const [brands, setBrands] = useState([]);
  const [fuels, setFuels] = useState([]);
  const [minSeats, setMinSeats] = useState(0);
  const [maxPrice, setMaxPrice] = useState(16000);
  const [transmission, setTransmission] = useState('Any');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState('recommended');
  const [showAll, setShowAll] = useState(false);

  const activeCategory = categories.find((cat) => cat.slug === category) || categories[0];
  const brandList = useMemo(
    () => [...new Set(cars.map((car) => car.brand))].sort(),
    [cars]
  );

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const resetFilters = () => {
    setQuery('');
    setBrands([]);
    setFuels([]);
    setMinSeats(0);
    setMaxPrice(16000);
    setTransmission('Any');
    setAvailableOnly(false);
    setSort('recommended');
    setShowAll(false);
  };

  const results = useMemo(() => {
    let list = cars.filter((car) => category === 'all' || car.category === category);

    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      list = list.filter((car) =>
        `${car.name} ${car.brand} ${car.type}`.toLowerCase().includes(needle)
      );
    }
    if (brands.length) list = list.filter((car) => brands.includes(car.brand));
    if (fuels.length) list = list.filter((car) => fuels.includes(car.specs.fuel));
    if (minSeats) list = list.filter((car) => car.specs.seats >= minSeats);
    list = list.filter((car) => car.price <= maxPrice);
    if (transmission !== 'Any') list = list.filter((car) => car.specs.transmission === transmission);
    if (availableOnly) list = list.filter((car) => car.available);

    switch (sort) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating);
      case 'year':
        return [...list].sort((a, b) => b.specs.year - a.specs.year);
      default:
        return [...list].sort((a, b) => b.rating * b.reviewsCount - a.rating * a.reviewsCount);
    }
  }, [cars, category, query, brands, fuels, minSeats, maxPrice, transmission, availableOnly, sort]);

  const visible = showAll ? results : results.slice(0, 6);
  const activeChips = [
    ...brands.map((brand) => ({ label: brand, clear: () => toggle(brands, setBrands, brand) })),
    ...fuels.map((fuel) => ({ label: fuel, clear: () => toggle(fuels, setFuels, fuel) })),
    ...(minSeats ? [{ label: `${minSeats}+ seats`, clear: () => setMinSeats(0) }] : []),
    ...(maxPrice < 16000 ? [{ label: `Under ₹${maxPrice.toLocaleString('en-IN')}/day`, clear: () => setMaxPrice(16000) }] : []),
    ...(transmission !== 'Any' ? [{ label: transmission, clear: () => setTransmission('Any') }] : []),
    ...(availableOnly ? [{ label: 'Available now', clear: () => setAvailableOnly(false) }] : []),
    ...(query.trim() ? [{ label: `“${query.trim()}”`, clear: () => setQuery('') }] : []),
  ];

  return (
    <>
      <section className="page-head container-wide">
        <div>
          <p className="eyebrow">Fleet · {activeCategory.label}</p>
          <h1>{activeCategory.label}</h1>
          <p className="section-sub">{activeCategory.description}</p>
        </div>
        <div className="page-head-meta">
          {tripLocation && (
            <p className="trip-chip">
              {tripLocation}
              {tripStart && ` · ${formatDate(tripStart)} → ${formatDate(tripEnd)}`}
            </p>
          )}
          <p className="muted">{results.length} car{results.length === 1 ? '' : 's'} match your filters</p>
        </div>
      </section>

      <div className="container-wide fleet-layout">
        <aside className="filters-panel">
          <div className="filter-block">
            <h3 className="filter-title">Search</h3>
            <input
              className="input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Model or brand…"
              aria-label="Search cars"
            />
          </div>

          <div className="filter-block">
            <h3 className="filter-title">Category</h3>
            <div className="chip-row">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={cat.slug === 'all' ? '/cars' : `/cars/${cat.slug}`}
                  className={`chip ${cat.slug === category ? 'chip-on' : ''}`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <h3 className="filter-title">Daily budget</h3>
            <input
              className="range"
              type="range"
              min="2000"
              max="16000"
              step="500"
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              aria-label="Maximum daily price"
            />
            <p className="range-value">Up to ₹{maxPrice.toLocaleString('en-IN')} / day</p>
          </div>

          <div className="filter-block">
            <h3 className="filter-title">Seats</h3>
            <div className="chip-row">
              {[0, 2, 4, 5, 7].map((seat) => (
                <button
                  key={seat}
                  type="button"
                  className={`chip ${minSeats === seat ? 'chip-on' : ''}`}
                  onClick={() => setMinSeats(seat)}
                >
                  {seat === 0 ? 'Any' : `${seat}+`}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <h3 className="filter-title">Fuel</h3>
            {FUELS.map((fuel) => (
              <label className="check-row" key={fuel}>
                <input
                  type="checkbox"
                  checked={fuels.includes(fuel)}
                  onChange={() => toggle(fuels, setFuels, fuel)}
                />
                {fuel}
              </label>
            ))}
          </div>

          <div className="filter-block">
            <h3 className="filter-title">Transmission</h3>
            <select className="input" value={transmission} onChange={(event) => setTransmission(event.target.value)}>
              <option value="Any">Any</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div className="filter-block">
            <h3 className="filter-title">Brand</h3>
            {brandList.map((brand) => (
              <label className="check-row" key={brand}>
                <input
                  type="checkbox"
                  checked={brands.includes(brand)}
                  onChange={() => toggle(brands, setBrands, brand)}
                />
                {brand}
              </label>
            ))}
          </div>

          <div className="filter-block">
            <label className="check-row">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(event) => setAvailableOnly(event.target.checked)}
              />
              Available right now
            </label>
          </div>

          <button type="button" className="btn btn-ghost btn-block" onClick={resetFilters}>
            Clear all filters
          </button>
        </aside>

        <section className="fleet-results">
          <div className="results-bar">
            <div className="active-chips">
              {activeChips.length === 0 && <span className="muted">No filters applied</span>}
              {activeChips.map((chip) => (
                <button type="button" key={chip.label} className="chip chip-on" onClick={chip.clear}>
                  {chip.label} ×
                </button>
              ))}
            </div>
            <label className="sort-wrap">
              <span className="field-label">Sort</span>
              <select className="input" value={sort} onChange={(event) => setSort(event.target.value)}>
                {SORTS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <Empty
              title="No cars match those filters"
              action={
                <button type="button" className="btn btn-primary" onClick={resetFilters}>
                  Reset filters
                </button>
              }
            >
              Try widening your budget or clearing the brand and fuel selections.
            </Empty>
          ) : (
            <>
              <div className="car-grid">
                {visible.map((car) => (
                  <CarCard car={car} key={car.id} />
                ))}
              </div>
              {results.length > 6 && (
                <div className="center">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAll((v) => !v)}>
                    {showAll ? 'Show fewer cars' : `Show all ${results.length} cars`}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
