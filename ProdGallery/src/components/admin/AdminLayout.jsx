import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { label: 'OVERVIEW', items: [
    { name: 'Dashboard', href: '/admin', icon: '▦', exact: true },
    { name: 'Analytics', href: '/admin/analytics', icon: '↗' },
  ]},
  { label: 'STORE MANAGEMENT', items: [
    { name: 'Photos & Gallery', href: '/admin/photos', icon: '▧' },
    { name: 'Categories', href: '/admin/categories', icon: '▤' },
    { name: 'Orders & Payments', href: '/admin/orders', icon: '▣' },
  ]},
  { label: 'CUSTOMERS', items: [
    { name: 'Users', href: '/admin/users', icon: '♙' },
    { name: 'Contact Messages', href: '/admin/messages', icon: '✉' },
  ]},
];

const pageNames = navigation.flatMap((group) => group.items).map((item) => [item.href, item.name]);

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const currentPage = [...pageNames].sort((a, b) => b[0].length - a[0].length)
    .find(([href]) => href === '/admin' ? location.pathname === href : location.pathname.startsWith(href));
  const pageTitle = currentPage?.[1] || 'Administration';

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  const SidebarContents = () => (
    <>
      <Link to="/" className="flex items-center gap-3 px-5 py-5 border-b border-slate-800" onClick={() => setSidebarOpen(false)}>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 text-slate-950 font-black text-sm">PG</span>
        <span>
          <span className="block text-base font-bold tracking-tight text-white">ProdGallery</span>
          <span className="block text-xs text-slate-400">Store management</span>
        </span>
      </Link>
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((group) => (
          <section key={group.label} className="mb-6">
            <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.18em] text-slate-500">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = item.exact ? location.pathname === item.href : location.pathname.startsWith(item.href);
                return (
                  <Link key={item.href} to={item.href} onClick={() => setSidebarOpen(false)}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-emerald-400 text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                    <span className="grid h-6 w-6 shrink-0 place-items-center text-lg" aria-hidden="true">{item.icon}</span>
                    <span>{item.name}</span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-slate-950" />}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-4">
        <div className="rounded-xl bg-slate-800/80 p-3">
          <p className="text-xs font-semibold text-white">Storefront</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">See the customer experience at any time.</p>
          <Link to="/" className="mt-3 inline-flex min-h-9 items-center text-sm font-semibold text-emerald-300 hover:text-emerald-200">Open store ↗</Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      {sidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,86vw)] flex-col bg-slate-950 transition-transform duration-200 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:w-64 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContents />
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-3 px-4 sm:px-6 xl:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">Workspace / Administration</p>
                <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{pageTitle}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Admin workspace
              </span>
              <div className="relative">
                <button type="button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen} className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-2.5 hover:bg-slate-50">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-900">{(user?.firstName || user?.first_name || user?.name || 'A').charAt(0).toUpperCase()}</span>
                  <span className="hidden max-w-32 text-left sm:block">
                    <span className="block truncate text-xs font-semibold">{user?.firstName || user?.first_name || user?.name || 'Administrator'}</span>
                    <span className="block text-[11px] text-slate-500">{user?.role || 'Admin'}</span>
                  </span>
                  <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m7 10 5 5 5-5" /></svg>
                </button>
                {profileOpen && <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <Link to="/" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">View storefront ↗</Link>
                  <button type="button" onClick={handleLogout} className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-700 hover:bg-rose-50">Sign out</button>
                </div>}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 xl:p-9">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">Manage your gallery, customers, orders and store performance.</p>
            <Link to="/" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800">View live store ↗</Link>
          </div>
          <Outlet />
        </main>
        <footer className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500 sm:px-6">ProdGallery Admin · Manage your store in one place</footer>
      </div>
    </div>
  );
}
