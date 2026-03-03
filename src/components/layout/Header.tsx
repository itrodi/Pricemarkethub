import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, TrendingUp } from 'lucide-react';

interface HeaderProps {
  compareCount: number;
}

export default function Header({ compareCount }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <TrendingUp size={18} color="#fff" />
          </div>
          Price<span>Wise</span>
        </Link>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/category/agriculture" onClick={() => setMenuOpen(false)}>
            Categories
          </NavLink>
          <NavLink to="/compare" onClick={() => setMenuOpen(false)}>
            Compare
            {compareCount > 0 && (
              <span className="nav-compare-badge">{compareCount}</span>
            )}
          </NavLink>
          <NavLink to="/trends" onClick={() => setMenuOpen(false)}>
            Trends
          </NavLink>
          <NavLink to="/search" onClick={() => setMenuOpen(false)}>
            Search
          </NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>
            About
          </NavLink>
        </nav>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
