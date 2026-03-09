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

// Admin
import { AdminAuthProvider } from './hooks/useAdminAuth';
import AdminGuard from './components/admin/AdminGuard';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminLocations from './pages/admin/AdminLocations';
import AdminPrices from './pages/admin/AdminPrices';
import AdminImport from './pages/admin/AdminImport';
import AdminSubcategories from './pages/admin/AdminSubcategories';
import AdminScraper from './pages/admin/AdminScraper';

function PublicRoutes() {
  const compare = useCompare();

  return (
    <>
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
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="subcategories" element={<AdminSubcategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="prices" element={<AdminPrices />} />
            <Route path="import" element={<AdminImport />} />
            <Route path="scraper" element={<AdminScraper />} />
          </Route>

          {/* Public Routes */}
          <Route path="/*" element={<PublicRoutes />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
