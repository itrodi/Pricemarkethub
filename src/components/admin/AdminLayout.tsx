import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderTree, Layers, Package, MapPin,
  DollarSign, Upload, LogOut, ChevronLeft, Bot,
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories', end: false },
  { to: '/admin/subcategories', icon: Layers, label: 'Subcategories', end: false },
  { to: '/admin/products', icon: Package, label: 'Products', end: false },
  { to: '/admin/locations', icon: MapPin, label: 'Locations', end: false },
  { to: '/admin/prices', icon: DollarSign, label: 'Price Points', end: false },
  { to: '/admin/import', icon: Upload, label: 'CSV Import', end: false },
  { to: '/admin/scraper', icon: Bot, label: 'Scraper', end: false },
];

export default function AdminLayout() {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 240, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200,
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'linear-gradient(135deg, var(--green), var(--blue))',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
          }}>PW</div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>PriceWise</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin Panel</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
                fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-card)' : 'transparent',
              })}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-primary)' }}>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
            <ChevronLeft size={18} /> Back to Site
          </NavLink>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</span>
            <button onClick={handleSignOut} style={{ color: 'var(--text-muted)', padding: 4 }} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div style={{ marginLeft: 240, flex: 1, minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ padding: '24px 32px', maxWidth: 1200 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
