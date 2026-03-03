import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchProducts } from '../../lib/api';
import { sanitizeSearchQuery } from '../../lib/sanitize';
import { categories } from '../../data/mockData';
import type { SearchResult } from '../../types/database';

interface SearchBarProps {
  large?: boolean;
  placeholder?: string;
  onSelect?: (result: SearchResult) => void;
}

export default function SearchBar({ large = false, placeholder, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const doSearch = useCallback(async (q: string) => {
    const sanitized = sanitizeSearchQuery(q);
    if (!sanitized || sanitized.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    const data = await searchProducts(sanitized);
    setResults(data);
    setShowDropdown(data.length > 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, doSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(result: SearchResult) {
    setShowDropdown(false);
    setQuery('');
    if (onSelect) {
      onSelect(result);
    } else {
      navigate(`/product/${result.slug}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && query.trim().length >= 2) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function getCategoryName(categoryId: string): string {
    return categories.find(c => c.id === categoryId)?.name || '';
  }

  return (
    <div className="search-container" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          className={`search-input ${large ? '' : ''}`}
          placeholder={placeholder || 'Search for any product, commodity, or service...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          maxLength={200}
          autoComplete="off"
        />
      </div>

      {showDropdown && (
        <div className="search-results-dropdown">
          {loading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Searching...
            </div>
          ) : (
            results.slice(0, 8).map(result => (
              <div
                key={result.id}
                className="search-result-item"
                onClick={() => handleSelect(result)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(result)}
              >
                <div>
                  <div className="search-result-name">{result.name}</div>
                  <div className="search-result-category">
                    {getCategoryName(result.category_id)}
                    {result.subcategory && ` > ${result.subcategory}`}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {result.unit}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
