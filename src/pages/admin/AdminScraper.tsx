import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot, Play, Square, RefreshCw, Globe, CheckCircle,
  XCircle, Clock, AlertTriangle, Loader, Terminal,
} from 'lucide-react';

interface SourceCategory {
  name: string;
  categorySlug: string;
  subcategorySlug: string;
  urls: string[];
}

interface Source {
  key: string;
  name: string;
  baseUrl: string;
  categories: SourceCategory[];
}

interface Job {
  id: string;
  source: string;
  sourceName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  finishedAt: string | null;
  result: {
    totalScraped: number;
    productsCreated: number;
    pricePointsInserted: number;
  } | null;
  error: string | null;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

const SOURCE_COLORS: Record<string, string> = {
  jiji: 'var(--green)',
  jumia: 'var(--orange)',
  konga: 'var(--blue)',
};

export default function AdminScraper() {
  const [sources, setSources] = useState<Source[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch sources and current status
  const fetchStatus = useCallback(async () => {
    try {
      const [sourcesRes, statusRes] = await Promise.all([
        fetch('/api/scraper/sources'),
        fetch('/api/scraper/status'),
      ]);

      if (sourcesRes.ok) {
        const { sources: s } = await sourcesRes.json();
        setSources(s);
        setServerOnline(true);
      } else {
        setServerOnline(false);
      }

      if (statusRes.ok) {
        const { job: j } = await statusRes.json();
        setJob(j);
      }
    } catch {
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Connect to SSE log stream
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/scraper/logs');

    es.onmessage = (event) => {
      try {
        const entry: LogEntry = JSON.parse(event.data);
        setLogs(prev => [...prev.slice(-499), entry]);
      } catch {
        // skip malformed
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      // Reconnect after 3s
      setTimeout(connectSSE, 3000);
    };

    eventSourceRef.current = es;
  }, []);

  useEffect(() => {
    fetchStatus();
    connectSSE();

    // Poll status every 3s while a job is running
    const interval = setInterval(fetchStatus, 3000);

    return () => {
      clearInterval(interval);
      eventSourceRef.current?.close();
    };
  }, [fetchStatus, connectSSE]);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  async function startScrape(sourceKey: string) {
    setStarting(true);
    setLogs([]);
    try {
      const res = await fetch('/api/scraper/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: sourceKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setJob(data.job);
      } else {
        alert(data.error || 'Failed to start scraper');
      }
    } catch {
      alert('Failed to connect to scraper server. Is it running?');
    } finally {
      setStarting(false);
    }
  }

  async function stopScrape() {
    try {
      const res = await fetch('/api/scraper/stop', { method: 'POST' });
      const data = await res.json();
      if (res.ok) setJob(data.job);
    } catch {
      // ignore
    }
  }

  const isRunning = job?.status === 'running';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
            <Bot size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Scraper Control Panel
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Scrape product data from Nigerian e-commerce platforms
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: serverOnline ? 'var(--green)' : 'var(--red)',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Server {serverOnline ? 'Online' : 'Offline'}
          </span>
          <button
            onClick={fetchStatus}
            style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Server Offline Warning */}
      {!serverOnline && (
        <div className="card" style={{ marginBottom: 24, border: '1px solid var(--yellow)' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertTriangle size={20} color="var(--yellow)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Scraper Server Not Running</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12, lineHeight: 1.6 }}>
                The scraper API server needs to be running locally. Start it with:
              </p>
              <div style={{
                background: 'var(--bg-secondary)', borderRadius: 8, padding: 12,
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
              }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}># In a separate terminal:</div>
                <div>cd scraper && npm run server</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Source Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginBottom: 24 }}>
        {sources.map(source => (
          <div key={source.key} className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={16} color={SOURCE_COLORS[source.key] || 'var(--text-muted)'} />
                {source.name}
              </h3>
              {isRunning && job?.source === source.key ? (
                <button
                  onClick={stopScrape}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600,
                    background: 'var(--red)', color: '#fff', cursor: 'pointer',
                  }}
                >
                  <Square size={12} /> Stop
                </button>
              ) : (
                <button
                  onClick={() => startScrape(source.key)}
                  disabled={isRunning || starting || !serverOnline}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600,
                    background: (isRunning || starting || !serverOnline) ? 'var(--bg-secondary)' : 'var(--green)',
                    color: (isRunning || starting || !serverOnline) ? 'var(--text-muted)' : '#fff',
                    cursor: (isRunning || starting || !serverOnline) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {starting ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={12} />}
                  {starting ? 'Starting...' : 'Scrape'}
                </button>
              )}
            </div>
            <div className="card-body">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                Categories ({source.categories.length})
              </div>
              {source.categories.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No categories configured yet</p>
              ) : (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                  {source.categories.map(cat => (
                    <span key={cat.subcategorySlug} className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target: <code style={{ background: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: 3 }}>{source.baseUrl}</code>
              </div>
            </div>
          </div>
        ))}

        {sources.length === 0 && serverOnline && (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
              No sources configured
            </div>
          </div>
        )}
      </div>

      {/* Job Status */}
      {job && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StatusIcon status={job.status} />
              {job.status === 'running' ? 'Running' : 'Last Job'}: {job.sourceName}
            </h3>
            <StatusBadge status={job.status} />
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              <StatBox label="Started" value={formatTime(job.startedAt)} />
              {job.finishedAt && (
                <StatBox label="Duration" value={formatDuration(job.startedAt, job.finishedAt)} />
              )}
              {job.result && (
                <>
                  <StatBox label="Products Scraped" value={String(job.result.totalScraped)} color="var(--blue)" />
                  <StatBox label="Products Created" value={String(job.result.productsCreated)} color="var(--green)" />
                  <StatBox label="Prices Inserted" value={String(job.result.pricePointsInserted)} color="var(--purple)" />
                </>
              )}
              {job.error && (
                <StatBox label="Error" value={job.error} color="var(--red)" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Logs */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={16} />
            Live Logs
            {isRunning && (
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--green)',
                animation: 'pulse 2s infinite',
              }} />
            )}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {logs.length} entries
          </span>
        </div>
        <div style={{
          background: '#0d1117', borderRadius: '0 0 12px 12px',
          maxHeight: 400, overflowY: 'auto', padding: '12px 16px',
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.7,
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#6e7681', textAlign: 'center', padding: 24 }}>
              {serverOnline ? 'No logs yet. Start a scrape to see output here.' : 'Connect to the scraper server to see logs.'}
            </div>
          ) : (
            logs.map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#6e7681', flexShrink: 0 }}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span style={{ color: levelColor(entry.level), flexShrink: 0 }}>
                  [{entry.level.toUpperCase()}]
                </span>
                <span style={{ color: '#c9d1d9', wordBreak: 'break-word' }}>
                  {entry.message}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'running': return <Loader size={16} color="var(--blue)" style={{ animation: 'spin 1s linear infinite' }} />;
    case 'completed': return <CheckCircle size={16} color="var(--green)" />;
    case 'failed': return <XCircle size={16} color="var(--red)" />;
    case 'cancelled': return <AlertTriangle size={16} color="var(--yellow)" />;
    default: return <Clock size={16} color="var(--text-muted)" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    running: { bg: 'rgba(59,130,246,0.15)', color: 'var(--blue)' },
    completed: { bg: 'rgba(16,185,129,0.15)', color: 'var(--green)' },
    failed: { bg: 'rgba(239,68,68,0.15)', color: 'var(--red)' },
    cancelled: { bg: 'rgba(245,158,11,0.15)', color: 'var(--yellow)' },
  };
  const s = styles[status] || styles.cancelled;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: color || 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

function levelColor(level: string): string {
  switch (level) {
    case 'error': return '#f85149';
    case 'warn': return '#d29922';
    case 'debug': return '#6e7681';
    default: return '#58a6ff';
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${secs % 60}s`;
}
