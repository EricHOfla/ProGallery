import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsAPI } from "../../services/api";
import { resolveImageUrl } from "../../utils/image";

const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Number(value || 0));
const statusTone = (status) => ({ completed: "bg-emerald-500", processing: "bg-blue-500", pending: "bg-amber-400", cancelled: "bg-rose-500", paid: "bg-emerald-500" }[String(status || "").toLowerCase()] || "bg-slate-400");

export default function Analytics() {
  const [revenue, setRevenue] = useState([]);
  const [topPhotos, setTopPhotos] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  const load = useCallback(async () => {
    setLoading(true); setErrors([]);
    const requests = [["Revenue", analyticsAPI.getRevenue], ["Top photos", analyticsAPI.getTopPhotos], ["Order status", analyticsAPI.getOrderStatus], ["Category sales", analyticsAPI.getSalesByCategory]];
    const results = await Promise.allSettled(requests.map(([, request]) => request()));
    const issues = [];
    const values = results.map((result, index) => {
      if (result.status === "fulfilled") return Array.isArray(result.value) ? result.value : result.value?.data || [];
      issues.push(`${requests[index][0]} data could not be loaded.`);
      return [];
    });
    setRevenue(values[0]); setTopPhotos(values[1]); setOrderStatus(values[2]); setSalesByCategory(values[3]); setErrors(issues); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const revenueTotal = useMemo(() => revenue.reduce((sum, item) => sum + Number(item.revenue || item.total || 0), 0), [revenue]);
  const maxRevenue = Math.max(1, ...revenue.map((item) => Number(item.revenue || item.total || 0)));
  const orderTotal = orderStatus.reduce((sum, item) => sum + Number(item.count || item.total || item.orders || 0), 0);
  const categoryTotal = salesByCategory.reduce((sum, item) => sum + Number(item.revenue || item.total || item.sales || 0), 0);
  const statusName = (item) => item.status || item.order_status || item.name || "Other";
  const statusCount = (item) => Number(item.count || item.total || item.orders || 0);
  const categoryName = (item) => item.category_name || item.category?.name || item.name || "Uncategorized";
  const categoryValue = (item) => Number(item.revenue || item.total || item.sales || 0);

  return <div className="space-y-6">
    <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Business intelligence</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Store analytics</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Understand sales trends, popular photography and order activity across your store.</p></div><button type="button" onClick={load} disabled={loading} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm font-semibold hover:bg-white/10 disabled:opacity-50">{loading ? "Refreshing…" : "↻ Refresh data"}</button></div></section>
    {errors.length > 0 && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">Some analytics are unavailable</p><p className="mt-1">{errors.join(" ")}</p></div><button type="button" onClick={load} className="self-start rounded-lg border border-amber-300 px-3 py-2 font-semibold sm:self-auto">Retry</button></div>}
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[{ label: "Revenue in results", value: money(revenueTotal), sub: "Summed from returned revenue data", tone: "text-emerald-800", icon: "$" }, { label: "Orders in breakdown", value: orderTotal.toLocaleString(), sub: "Orders represented by status data", tone: "text-blue-800", icon: "▣" }, { label: "Categories tracked", value: salesByCategory.length.toLocaleString(), sub: "Categories with sales data", tone: "text-violet-800", icon: "▤" }, { label: "Top photos", value: topPhotos.length.toLocaleString(), sub: "Popular listings returned by API", tone: "text-amber-800", icon: "▧" }].map((card) => <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl bg-slate-50 text-lg font-bold ${card.tone}`}>{card.icon}</span><span className="text-xs font-semibold text-slate-400">Live data</span></div><p className="mt-5 text-sm font-medium text-slate-500">{card.label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{loading ? "—" : card.value}</p><p className="mt-2 text-xs leading-5 text-slate-400">{card.sub}</p></article>)}
    </section>
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-950">Revenue trend</h3><p className="mt-1 text-sm text-slate-500">Revenue by month from the analytics API</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{revenue.length} periods</span></div>
        {loading ? <div className="mt-6 h-48 animate-pulse rounded-xl bg-slate-100" /> : revenue.length ? <div className="mt-6 space-y-4">{revenue.map((item, index) => { const value = Number(item.revenue || item.total || 0); return <div key={item.month || item.period || index}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium text-slate-700">{item.month || item.period || item.label || "Period"}</span><span className="shrink-0 font-bold text-slate-950">{money(value)}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.max(2, value / maxRevenue * 100)}%` }} /></div></div>; })}</div> : <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">No revenue data available yet.</div>}
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h3 className="font-bold text-slate-950">Order status</h3><p className="mt-1 text-sm text-slate-500">Current distribution returned by the backend</p>
        {loading ? <div className="mt-6 h-48 animate-pulse rounded-xl bg-slate-100" /> : orderStatus.length ? <><div className="mt-6 flex h-3 overflow-hidden rounded-full bg-slate-100">{orderStatus.map((item, index) => <span key={statusName(item) + index} className={statusTone(statusName(item))} style={{ width: `${orderTotal ? statusCount(item) / orderTotal * 100 : 0}%` }} />)}</div><div className="mt-5 space-y-3">{orderStatus.map((item, index) => <div key={statusName(item) + index} className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusTone(statusName(item))}`} /><span className="truncate text-sm capitalize text-slate-600">{statusName(item)}</span></div><span className="text-sm font-bold text-slate-950">{statusCount(item).toLocaleString()}</span></div>)}</div></> : <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">No order status data available yet.</div>}
      </article>
    </section>
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h3 className="font-bold text-slate-950">Top-selling photos</h3><p className="mt-1 text-sm text-slate-500">Products customers purchase most</p></div>{loading ? <div className="space-y-3 p-5">{[1,2,3].map((n) => <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div> : topPhotos.length ? <div className="divide-y divide-slate-100">{topPhotos.map((photo, index) => <div key={photo.id || index} className="flex items-center gap-3 p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{index + 1}</span><img src={resolveImageUrl(photo.image)} alt="" className="h-14 w-16 shrink-0 rounded-lg bg-slate-100 object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{photo.title || "Untitled photo"}</p><p className="mt-1 text-xs text-slate-500">{photo.sales_count ?? photo.total_sold ?? photo.quantity_sold ?? "Sales"} sales</p></div><span className="shrink-0 text-sm font-bold text-slate-900">{photo.revenue != null ? money(photo.revenue) : money(photo.price)}</span></div>)}</div> : <p className="p-8 text-center text-sm text-slate-500">No sales data yet. Published products will appear here when orders are recorded.</p>}</article>
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h3 className="font-bold text-slate-950">Sales by category</h3><p className="mt-1 text-sm text-slate-500">See which collections contribute to sales</p></div>{loading ? <div className="space-y-3 p-5">{[1,2,3].map((n) => <div key={n} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div> : salesByCategory.length ? <div className="divide-y divide-slate-100">{salesByCategory.map((item, index) => <div key={item.category_id || categoryName(item) + index} className="p-4"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold text-slate-800">{categoryName(item)}</p><p className="shrink-0 text-sm font-bold text-slate-950">{money(categoryValue(item))}</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.max(2, categoryTotal ? categoryValue(item) / categoryTotal * 100 : 0)}%` }} /></div></div>)}</div> : <p className="p-8 text-center text-sm text-slate-500">No category sales data available yet.</p>}</article>
    </section>
    <div className="flex flex-wrap gap-3"><Link to="/admin/orders" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-emerald-300">Manage orders ↗</Link><Link to="/admin/photos" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-emerald-300">Manage photos ↗</Link></div>
  </div>;
}
