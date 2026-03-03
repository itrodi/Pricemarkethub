import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { adminBulkImportPrices, type CsvPriceRow, type ImportResult } from '../../lib/adminApi';

export default function AdminImport() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPriceRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith('.csv')) {
      setError('Please select a CSV file.');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum 5MB.');
      return;
    }

    setFile(selected);
    setError('');
    setResult(null);

    // Parse CSV preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCsv(text);
      if (rows.length === 0) {
        setError('No valid data rows found. Check your CSV format.');
        return;
      }
      setPreview(rows.slice(0, 10));
    };
    reader.readAsText(selected);
  }

  function parseCsv(text: string): CsvPriceRow[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));

    const productIdx = header.findIndex(h => h === 'product_name' || h === 'product' || h === 'name' || h === 'item');
    const locationIdx = header.findIndex(h => h === 'location_name' || h === 'location' || h === 'city');
    const priceIdx = header.findIndex(h => h === 'price' || h === 'amount');
    const sourceIdx = header.findIndex(h => h === 'source');
    const dateIdx = header.findIndex(h => h === 'recorded_at' || h === 'date');

    if (productIdx === -1 || locationIdx === -1 || priceIdx === -1) {
      return [];
    }

    const rows: CsvPriceRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
      if (cols.length < 3) continue;

      const price = parseFloat(cols[priceIdx]);
      if (isNaN(price) || price <= 0) continue;

      rows.push({
        product_name: cols[productIdx] || '',
        location_name: cols[locationIdx] || '',
        price,
        source: sourceIdx !== -1 ? cols[sourceIdx] || 'market_survey' : 'market_survey',
        recorded_at: dateIdx !== -1 ? cols[dateIdx] : undefined,
      });
    }

    return rows;
  }

  async function handleImport() {
    if (!file) return;

    setImporting(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCsv(text);

      if (rows.length === 0) {
        setError('No valid data rows to import.');
        setImporting(false);
        return;
      }

      try {
        const importResult = await adminBulkImportPrices(rows);
        setResult(importResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Import failed');
      }
      setImporting(false);
    };
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const template = 'product_name,location_name,price,source,recorded_at\n"Rice (50kg bag)","Lagos",75000,"market_survey","2025-03-01"\n"PMS (Petrol)","Abuja",950,"nnpc","2025-03-01"\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricewise-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>CSV Import</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Bulk import price data from CSV files
        </p>
      </div>

      {error && <div className="message message-error">{error}</div>}

      {result && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} color="var(--green)" /> Import Complete
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="insight-card">
                <div className="insight-label">Total Rows</div>
                <div className="insight-value">{result.total}</div>
              </div>
              <div className="insight-card">
                <div className="insight-label">Successful</div>
                <div className="insight-value" style={{ color: 'var(--green)' }}>{result.success}</div>
              </div>
              <div className="insight-card">
                <div className="insight-label">Errors</div>
                <div className="insight-value" style={{ color: result.errors.length > 0 ? 'var(--red)' : 'var(--text-muted)' }}>{result.errors.length}</div>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8, color: 'var(--red)' }}>Errors:</h4>
                <div style={{ maxHeight: 200, overflow: 'auto', background: 'var(--bg-secondary)', borderRadius: 8, padding: 12 }}>
                  {result.errors.map((err, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Row {err.row}:</span> {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">CSV Format</h3>
          <button className="btn btn-secondary" onClick={downloadTemplate} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <Download size={14} style={{ marginRight: 4 }} /> Download Template
          </button>
        </div>
        <div className="card-body" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <p style={{ marginBottom: 12 }}>Your CSV file must have these columns (headers in first row):</p>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: 12 }}>
            <div><strong style={{ color: 'var(--green)' }}>product_name</strong> &mdash; Must match an existing product name exactly</div>
            <div><strong style={{ color: 'var(--green)' }}>location_name</strong> &mdash; Must match an existing location name exactly</div>
            <div><strong style={{ color: 'var(--green)' }}>price</strong> &mdash; Numeric price value in NGN</div>
            <div><strong style={{ color: 'var(--text-muted)' }}>source</strong> &mdash; (optional) jumia, konga, jiji, nbs, cbn, nnpc, market_survey, user_report</div>
            <div><strong style={{ color: 'var(--text-muted)' }}>recorded_at</strong> &mdash; (optional) ISO date string, defaults to now</div>
          </div>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} color="var(--yellow)" />
            Product and location names must match exactly. Check your spelling.
          </p>
        </div>
      </div>

      {/* Upload */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed var(--border-secondary)',
              borderRadius: 12,
              padding: 40,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 150ms ease',
            }}
          >
            <Upload size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              {file ? file.name : 'Click to select CSV file'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Maximum 5MB, CSV format only'}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title">
              <FileText size={16} style={{ marginRight: 8 }} />
              Preview (first {preview.length} rows)
            </h3>
          </div>
          <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Source</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    <td>{row.product_name}</td>
                    <td>{row.location_name}</td>
                    <td className="price-cell">{row.price.toLocaleString()}</td>
                    <td>{row.source}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{row.recorded_at || 'Now'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: 16, borderTop: '1px solid var(--border-primary)' }}>
            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={importing}
              style={{ width: '100%' }}
            >
              {importing ? 'Importing...' : `Import All Rows from ${file?.name}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
