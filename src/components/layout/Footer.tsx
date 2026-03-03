import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-about">
          <h3>PriceWise Nigeria</h3>
          <p>
            Nigeria's open price data platform. Browse, search, and compare
            prices of goods and commodities across the country. Real data,
            updated daily, from verified sources.
          </p>
        </div>

        <div className="footer-col">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/category/agriculture">Agriculture</Link></li>
            <li><Link to="/category/oil-gas">Oil & Gas</Link></li>
            <li><Link to="/category/electronics">Electronics</Link></li>
            <li><Link to="/category/currency">Currency</Link></li>
            <li><Link to="/category/commodities">Commodities</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Tools</h4>
          <ul>
            <li><Link to="/compare">Compare Tool</Link></li>
            <li><Link to="/trends">Market Trends</Link></li>
            <li><Link to="/search">Search</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About / Methodology</Link></li>
            <li><Link to="/about">Data Sources</Link></li>
            <li><Link to="/about">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} PriceWise Nigeria. All rights reserved.</span>
        <span>Data for informational purposes only.</span>
      </div>
    </footer>
  );
}
