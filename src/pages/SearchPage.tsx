import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchProducts, fetchPriceChanges } from '../lib/api';
import { formatNaira, formatChange } from '../lib/format';

import { categories, getProductSummaries } from '../data/mockData';
import SearchBar from '../components/search/SearchBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { SearchResult, PriceChange } from '../types/database';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [changes, setChanges] = useState<PriceChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const summaries = useMemo(() => getProductSummaries(), []);

  useEffect(() => {
    if (queryParam.length >= 2) {
      setLoading(true);
      setSearched(true);
      Promise.all([
        searchProducts(queryParam),
        fetchPriceChanges(7, 50),
      ]).then(([res, ch]) => {
        setResults(res);
        setChanges(ch);
        setLoading(false);
      });
    }
  }, [queryParam]);

  function getCategoryName(categoryId: string): string {
    return categories.find(c => c.id === categoryId)?.name || '';
  }

  return (
    <div className="container search-page">
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24 }}>Search</h1>

      <SearchBar
        placeholder="Search for any product, commodity, or service..."
        onSelect={(result) => navigate(`/product/${result.slug}`)}
      />

      <div className="search-page-results">
        {loading ? (
          <LoadingSpinner />
        ) : searched && results.length === 0 ? (
          <div className="empty-state">
            <h3>No results found</h3>
            <p>Try a different search term or browse our categories.</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="search-result-count">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{queryParam}"
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Avg Price</th>
                    <th>Change (7d)</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => {
                    const summary = summaries.find(s => s.product_id === result.id);
                    const change = changes.find(c => c.product_id === result.id);
                    const changeFormatted = change ? formatChange(change.change_pct) : null;

                    return (
                      <tr
                        key={result.id}
                        onClick={() => navigate(`/product/${result.slug}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div style={{ fontWeight: 500 }}>{result.name}</div>
                          {result.subcategory && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {result.subcategory}
                            </div>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {getCategoryName(result.category_id)}
                        </td>
                        <td className="price-cell">
                          {summary ? formatNaira(summary.avg_price) : '-'}
                        </td>
                        <td className={`change-cell ${changeFormatted?.className || 'change-flat'}`}>
                          {changeFormatted?.text || '-'}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{result.unit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
