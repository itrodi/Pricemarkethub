import { Bot, Globe, Clock, CheckCircle, AlertTriangle, Terminal } from 'lucide-react';

const SCRAPERS = [
  {
    id: 'jumia',
    name: 'Jumia.ng',
    description: 'Scrapes product prices from Jumia Nigeria across Electronics, Agriculture, and more.',
    categories: ['Electronics', 'Agriculture', 'Commodities'],
    url: 'https://www.jumia.com.ng',
    status: 'ready',
    icon: Globe,
    color: 'var(--orange)',
  },
  {
    id: 'konga',
    name: 'Konga.com',
    description: 'Scrapes product listings and prices from Konga across multiple categories.',
    categories: ['Electronics', 'Agriculture', 'Commodities'],
    url: 'https://www.konga.com',
    status: 'ready',
    icon: Globe,
    color: 'var(--blue)',
  },
  {
    id: 'jiji',
    name: 'Jiji.ng',
    description: 'Scrapes secondhand/market prices from Jiji for vehicles, electronics, real estate.',
    categories: ['Electronics', 'Transportation', 'Real Estate'],
    url: 'https://jiji.ng',
    status: 'ready',
    icon: Globe,
    color: 'var(--green)',
  },
];

export default function AdminScraper() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
          <Bot size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Scraper System
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Automated price data collection from Nigerian e-commerce platforms
        </p>
      </div>

      {/* Setup Instructions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">
            <Terminal size={16} style={{ marginRight: 8 }} />
            Setup &amp; Usage
          </h3>
        </div>
        <div className="card-body" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 16 }}>
            The scraper runs as a standalone Node.js process in the <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>scraper/</code> directory.
          </p>

          <h4 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Quick Start</h4>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 16, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: 16 }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}># Install scraper dependencies</div>
            <div style={{ marginBottom: 8 }}>cd scraper && npm install</div>

            <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}># Configure environment</div>
            <div style={{ marginBottom: 8 }}>cp .env.example .env</div>

            <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}># Run all scrapers</div>
            <div style={{ marginBottom: 8 }}>npm run scrape</div>

            <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}># Run a specific scraper</div>
            <div style={{ marginBottom: 8 }}>npm run scrape -- --source jumia</div>

            <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}># Run with scheduler (daily at 6 AM)</div>
            <div>npm run schedule</div>
          </div>

          <h4 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Environment Variables</h4>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 16, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: 16 }}>
            <div>SUPABASE_URL=https://your-project.supabase.co</div>
            <div>SUPABASE_SERVICE_KEY=your-service-role-key</div>
            <div style={{ color: 'var(--text-muted)', marginTop: 8 }}># Optional</div>
            <div>SCRAPE_DELAY_MS=2000</div>
            <div>MAX_PAGES_PER_CATEGORY=5</div>
            <div>USER_AGENT=PriceWise-Bot/1.0</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 12, background: 'var(--green-bg)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle size={16} color="var(--green)" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem' }}>
              The scraper uses the Supabase <strong>service role key</strong> (not anon key) to bypass RLS and write data directly. Never expose this key in the frontend.
            </span>
          </div>
        </div>
      </div>

      {/* Scraper Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        {SCRAPERS.map(scraper => (
          <div key={scraper.id} className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <scraper.icon size={16} color={scraper.color} />
                {scraper.name}
              </h3>
              <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={12} /> Ready
              </span>
            </div>
            <div className="card-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12, lineHeight: 1.6 }}>
                {scraper.description}
              </p>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Categories</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {scraper.categories.map(cat => (
                    <span key={cat} className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{cat}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target: <code style={{ background: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: 3 }}>{scraper.url}</code>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Architecture */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Architecture</h3>
        </div>
        <div className="card-body" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} /> How It Works
              </h4>
              <ol style={{ paddingLeft: 20 }}>
                <li>Scraper fetches product listing pages from target sites</li>
                <li>HTML is parsed to extract product names and prices</li>
                <li>Products are matched against the PriceWise database</li>
                <li>New price points are inserted with source attribution</li>
                <li>Unmatched products are logged for manual review</li>
              </ol>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} color="var(--yellow)" /> Important Notes
              </h4>
              <ul style={{ paddingLeft: 20 }}>
                <li>Respects robots.txt and includes delay between requests</li>
                <li>Uses a configurable User-Agent header</li>
                <li>Rate-limited to avoid overloading target servers</li>
                <li>Handles errors gracefully with retry logic</li>
                <li>Logs all operations for debugging</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
