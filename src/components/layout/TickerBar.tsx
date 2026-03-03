import { useEffect, useState } from 'react';
import { fetchTickerData } from '../../lib/api';
import { formatNaira, formatChange } from '../../lib/format';
import type { TickerItem } from '../../data/mockData';

export default function TickerBar() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    fetchTickerData().then(setItems);
  }, []);

  if (items.length === 0) return null;

  // Duplicate items for seamless loop
  const allItems = [...items, ...items];

  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {allItems.map((item, i) => {
          const change = formatChange(item.change);
          return (
            <div className="ticker-item" key={i}>
              <span className="ticker-name">{item.name}</span>
              <span className="ticker-price">{formatNaira(item.price)}</span>
              <span className={`ticker-change ${change.className}`}>
                {change.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
