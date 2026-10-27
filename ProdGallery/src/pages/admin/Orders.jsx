import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

const orderStatuses = ['all', 'pending', 'processing', 'completed', 'cancelled'];
const badge = {
  completed: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  processing: 'bg-blue-50 text-blue-800 ring-blue-200',
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  cancelled: 'bg-rose-50 text-rose-800 ring-rose-200',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ordersAPI.getAllOrders();
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err?.message || 'Orders could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    const previous = orders.find((order) => order.id === orderId)?.status;
    setUpdatingId(orderId);
    setError('');
    setNotice('');
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: newStatus } : order));
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setNotice('Order status updated.');
    } catch (err) {
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: previous } : order));
      setError(err?.message || 'Could not update this order. The previous status has been restored.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const statusMatches = filterStatus === 'all' || order.status === filterStatus;
      const name = order.user ? [order.user.first_name, order.user.last_name, order.user.name, order.user.email].filter(Boolean).join(' ') : '';
      const textMatches = !query || [order.order_number, name, order.payment_status, order.status].filter(Boolean).join(' ').toLowerCase().includes(query);
      return statusMatches && textMatches;
    });
  }, [orders, filterStatus, search]);

  const money = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount || 0));
  const customer = (order) => order.user ? [order.user.first_name, order.user.last_name].filter(Boolean).join(' ') || order.user.name || order.user.email : 'Customer';
  const paymentBadge = (status) => status === 'paid' ? 'bg-emerald-50 text-emerald-800' : status === 'refunded' ? 'bg-violet-50 text-violet-800' : 'bg-amber-50 text-amber-800';
  const StatusSelect = ({ order }) => <select aria-label={`Order status for ${order.order_number || order.id}`} disabled={updatingId === order.id} value={order.status || 'pending'} onChange={(event) => handleStatusUpdate(order.id, event.target.value)} className={`min-h-9 max-w-full rounded-lg border border-slate-200 px-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60 ${badge[order.status] || 'bg-slate-50 text-slate-700'}`}>{orderStatuses.filter((status) => status !== 'all').map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select>;

  return <div className="space-y-6">
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Store management</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Orders & payments</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Review fulfilment, check provider-confirmed payment status and open an order for its full details.</p></div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-64"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Orders shown</p><p className="mt-1 text-xl font-bold">{filteredOrders.length}</p></div><div className="rounded-xl bg-amber-50 p-3"><p className="text-xs text-amber-800">Awaiting payment</p><p className="mt-1 text-xl font-bold text-amber-950">{orders.filter((order) => order.payment_status !== 'paid').length}</p></div></div>
      </div>
    </section>

    {error && <div role="alert" className="flex flex-col justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center"><span>{error}</span><button type="button" onClick={fetchOrders} className="self-start rounded-lg border border-rose-300 px-3 py-2 font-semibold hover:bg-rose-100 sm:self-auto">Retry</button></div>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{notice}</p>}

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-sm"><span className="sr-only">Search orders</span><svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.5-4.5m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, payment…" className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100" /></label>
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter orders by status">{orderStatuses.map((status) => <button type="button" key={status} onClick={() => setFilterStatus(status)} aria-pressed={filterStatus === status} className={`min-h-9 shrink-0 rounded-full px-3.5 text-xs font-semibold capitalize transition ${filterStatus === status ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{status}{' '}<span className={filterStatus === status ? 'text-emerald-300' : 'text-slate-400'}>{status === 'all' ? orders.length : orders.filter((order) => order.status === status).length}</span></button>)}</div>
        </div>
      </div>

      {loading ? <div className="space-y-3 p-5">{[1,2,3,4,5].map((n) => <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div> : filteredOrders.length ? <>
        <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[900px] text-left"><thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"><tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Order status</th><th className="px-5 py-4">Payment</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Details</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredOrders.map((order) => <tr key={order.id} className="hover:bg-slate-50/70"><td className="px-5 py-4 text-sm font-semibold text-slate-900">{order.order_number || `#${order.id}`}</td><td className="px-5 py-4"><p className="text-sm font-medium text-slate-800">{customer(order)}</p><p className="mt-1 text-xs text-slate-500">{order.user?.email || ''}</p></td><td className="px-5 py-4 text-sm font-bold">{money(order.total_amount)}</td><td className="px-5 py-4"><StatusSelect order={order} /></td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${paymentBadge(order.payment_status)}`}>{order.payment_status || 'pending'}</span><p className="mt-1 text-[11px] text-slate-400">{order.payment_method || ''}</p></td><td className="px-5 py-4 text-sm text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}</td><td className="px-5 py-4"><Link to={`/admin/orders/${order.id}`} className="text-sm font-semibold text-emerald-800 hover:underline">Open →</Link></td></tr>)}</tbody></table></div>
        <div className="divide-y divide-slate-100 lg:hidden">{filteredOrders.map((order) => <article key={order.id} className="space-y-3 p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold text-slate-900">{order.order_number || `Order #${order.id}`}</p><p className="mt-1 truncate text-sm text-slate-500">{customer(order)}</p><p className="mt-0.5 truncate text-xs text-slate-400">{order.user?.email || ''}</p></div><p className="shrink-0 font-bold">{money(order.total_amount)}</p></div><div className="flex flex-wrap items-center gap-2"><StatusSelect order={order} /><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${paymentBadge(order.payment_status)}`}>Payment: {order.payment_status || 'pending'}</span></div><div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3"><span className="text-xs text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}</span><Link to={`/admin/orders/${order.id}`} className="text-sm font-bold text-emerald-800">View details →</Link></div></article>)}</div>
      </> : <div className="px-5 py-14 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-xl text-slate-500">▣</span><p className="mt-4 font-semibold text-slate-900">No matching orders</p><p className="mt-1 text-sm text-slate-500">{search ? 'Try a different search term.' : 'Orders will appear here when customers check out.'}</p><button type="button" onClick={() => { setSearch(''); setFilterStatus('all'); }} className="mt-4 text-sm font-bold text-emerald-800 hover:underline">Clear filters</button></div>}
    </section>
  </div>;
}
