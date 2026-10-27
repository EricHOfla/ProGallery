import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';

const cards = [
  { key: 'totalPhotos', label: 'Photos in gallery', icon: '▧', tone: 'emerald', href: '/admin/photos' },
  { key: 'totalOrders', label: 'Total orders', icon: '▣', tone: 'blue', href: '/admin/orders' },
  { key: 'totalRevenue', label: 'Recorded revenue', icon: '$', tone: 'violet', href: '/admin/analytics', money: true },
  { key: 'pendingOrders', label: 'Pending orders', icon: '◷', tone: 'amber', href: '/admin/orders' },
];
const tones = { emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-100', blue: 'bg-blue-50 text-blue-800 ring-blue-100', violet: 'bg-violet-50 text-violet-800 ring-violet-100', amber: 'bg-amber-50 text-amber-800 ring-amber-100' };
const statuses = { completed: 'bg-emerald-50 text-emerald-800 ring-emerald-200', processing: 'bg-blue-50 text-blue-800 ring-blue-200', pending: 'bg-amber-50 text-amber-800 ring-amber-200', cancelled: 'bg-rose-50 text-rose-800 ring-rose-200' };

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalPhotos: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await dashboardAPI.getStats();
      setStats({ totalPhotos: Number(response.total_photos || 0), totalOrders: Number(response.total_orders || 0), totalRevenue: Number(response.total_revenue || 0), pendingOrders: Number(response.pending_orders || 0) });
      setRecentOrders(Array.isArray(response.recent_orders) ? response.recent_orders : []);
    } catch (err) { setError(err?.message || 'Dashboard information could not be loaded.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
  const customerName = (order) => order.user ? [order.user.first_name, order.user.last_name].filter(Boolean).join(' ') || order.user.name || 'Customer' : 'Customer';
  const date = (value) => value ? new Date(value).toLocaleDateString() : '—';

  return <div className="space-y-7">
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
      <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border border-emerald-300/15" /><div className="absolute right-1 top-1 h-44 w-44 rounded-full border border-emerald-300/15" />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Store overview</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Your gallery, at a glance.</h2><p className="mt-3 text-sm leading-6 text-slate-300">Manage your photography catalogue, keep orders moving and stay close to your customers.</p></div>
        <div className="flex flex-wrap gap-2"><Link to="/admin/photos/new" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-300 px-4 text-sm font-bold text-slate-950 hover:bg-emerald-200">+ Add a photo</Link><Link to="/admin/orders" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-4 text-sm font-semibold text-white hover:bg-white/10">View orders ↗</Link></div>
      </div>
    </section>
    {error && <div role="alert" className="flex flex-col justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center"><span>{error}</span><button type="button" onClick={load} className="self-start rounded-lg border border-rose-300 px-3 py-2 font-semibold hover:bg-rose-100 sm:self-auto">Try again</button></div>}
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {cards.map((card) => <Link key={card.key} to={card.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-6"><div className="flex items-start justify-between gap-3"><span className={`grid h-11 w-11 place-items-center rounded-xl text-lg font-bold ring-1 ${tones[card.tone]}`}>{card.icon}</span><span className="text-slate-400 group-hover:text-emerald-700">↗</span></div><p className="mt-5 text-sm font-medium text-slate-500">{card.label}</p>{loading ? <div className="mt-2 h-8 w-28 animate-pulse rounded-lg bg-slate-100" /> : <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{card.money ? money(stats[card.key]) : stats[card.key].toLocaleString()}</p>}<p className="mt-3 text-xs text-slate-400">Open {card.label.toLowerCase()} ↗</p></Link>)}
    </section>
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-lg font-bold tracking-tight text-slate-950">Recent orders</h3><p className="mt-1 text-sm text-slate-500">Keep an eye on the latest customer activity.</p></div><Link to="/admin/orders" className="text-sm font-bold text-emerald-800 hover:text-emerald-600">All orders →</Link></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <div className="space-y-4 p-6">{[1,2,3,4].map((n) => <div key={n} className="h-10 animate-pulse rounded-lg bg-slate-100" />)}</div> : recentOrders.length ? <>
          <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[700px] text-left"><thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Statuses</th><th className="px-5 py-4">Date</th><th className="px-5 py-4"><span className="sr-only">View</span></th></tr></thead><tbody className="divide-y divide-slate-100">{recentOrders.map((order) => <tr key={order.id} className="hover:bg-slate-50/70"><td className="px-5 py-4 text-sm font-semibold">{order.order_number || `#${order.id}`}</td><td className="px-5 py-4 text-sm text-slate-600">{customerName(order)}</td><td className="px-5 py-4 text-sm font-semibold">{money(order.total_amount)}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statuses[order.status] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>{order.status || 'unknown'}</span><span className={`ml-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{order.payment_status || 'payment pending'}</span></td><td className="px-5 py-4 text-sm text-slate-500">{date(order.created_at)}</td><td className="px-5 py-4 text-right"><Link to={`/admin/orders/${order.id}`} className="text-sm font-semibold text-emerald-800 hover:underline">Details</Link></td></tr>)}</tbody></table></div>
          <div className="divide-y divide-slate-100 md:hidden">{recentOrders.map((order) => <article key={order.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{order.order_number || `Order #${order.id}`}</p><p className="mt-1 text-sm text-slate-500">{customerName(order)}</p></div><p className="font-bold">{money(order.total_amount)}</p></div><div className="mt-3 flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statuses[order.status] || 'bg-slate-100 text-slate-700'}`}>{order.status || 'unknown'}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{order.payment_status || 'payment pending'}</span><span className="text-xs text-slate-500">{date(order.created_at)}</span><Link to={`/admin/orders/${order.id}`} className="ml-auto text-sm font-semibold text-emerald-800">Details →</Link></div></article>)}</div>
        </> : <div className="px-6 py-14 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-xl text-slate-500">▣</span><p className="mt-4 font-semibold text-slate-900">No orders to show yet</p><p className="mt-1 text-sm text-slate-500">Orders will appear here when customers check out.</p><Link to="/gallery" className="mt-4 inline-flex text-sm font-bold text-emerald-800">Visit storefront ↗</Link></div>}
      </div>
    </section>
    <section><h3 className="mb-4 text-lg font-bold tracking-tight text-slate-950">Manage your store</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{[
      { href: '/admin/photos', icon: '▧', title: 'Photos & gallery', text: 'Add images, update details and manage availability.' },
      { href: '/admin/categories', icon: '▤', title: 'Categories', text: 'Keep browsing organized and easy to explore.' },
      { href: '/admin/users', icon: '♙', title: 'Customers', text: 'Review and manage registered customer accounts.' },
      { href: '/admin/messages', icon: '✉', title: 'Contact messages', text: 'Keep track of customer questions and requests.' },
      { href: '/admin/analytics', icon: '↗', title: 'Store analytics', text: 'Review sales and popular photography.' },
      { href: '/admin/orders', icon: '▣', title: 'Orders & payments', text: 'Review fulfilment and payment statuses.' },
    ].map((item) => <Link key={item.href} to={item.href} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm sm:p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg">{item.icon}</span><span><span className="block font-semibold text-slate-900">{item.title}</span><span className="mt-1 block text-sm leading-6 text-slate-500">{item.text}</span></span><span className="ml-auto text-slate-400">↗</span></Link>)}</div></section>
  </div>;
}
