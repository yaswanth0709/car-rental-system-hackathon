import { Routes, Route } from 'react-router-dom';
import { Layout } from './components.jsx';
import Home from './pages/Home.jsx';
import Cars from './pages/Cars.jsx';
import CarDetails from './pages/CarDetails.jsx';
import Checkout from './pages/Checkout.jsx';
import Account from './pages/Account.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/cars/:category" element={<Cars />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

