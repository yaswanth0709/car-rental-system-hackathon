import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section center-block">
      <p className="eyebrow">404</p>
      <h1>That road does not exist</h1>
      <p className="section-sub">
        The page you were looking for has moved or never existed. Let us get you back on route.
      </p>
      <div className="row-actions center">
        <Link to="/" className="btn btn-primary">Go home</Link>
        <Link to="/cars" className="btn btn-ghost">Browse cars</Link>
      </div>
    </div>
  );
}
