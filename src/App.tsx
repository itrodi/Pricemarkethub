import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import TickerBar from './components/layout/TickerBar';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import ComparePage from './pages/ComparePage';
import TrendsPage from './pages/TrendsPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import { useCompare } from './hooks/useCompare';

export default function App() {
  const compare = useCompare();

  return (
    <BrowserRouter>
      <TickerBar />
      <Header compareCount={compare.count} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route
            path="/product/:slug"
            element={
              <ProductPage
                onAddCompare={compare.addItem}
                isInCompare={compare.isInCompare}
              />
            }
          />
          <Route
            path="/compare"
            element={
              <ComparePage
                items={compare.items}
                onRemove={compare.removeItem}
                onAdd={compare.addItem}
                onClear={compare.clearAll}
              />
            }
          />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
