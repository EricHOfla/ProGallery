import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import { favoritesAPI } from "../services/api";
import { resolveImageUrl } from "../utils/image";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const data = await favoritesAPI.getAll(); setFavorites((Array.isArray(data) ? data : data?.data || []).filter((item) => item.photo || item.title)); }
    catch (err) { setError(err?.message || "Saved photos could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const remove = async (favorite) => {
    const photo = favorite.photo || favorite; setBusyId(photo.id); setError("");
    try { await favoritesAPI.remove(photo.id); setFavorites((items) => items.filter((item) => Number((item.photo || item).id) !== Number(photo.id))); }
    catch (err) { setError(err?.message || "This photo could not be removed."); }
    finally { setBusyId(null); }
  };
  return <div className="min-h-[65vh] bg-slate-50"><Container className="py-10 sm:py-16">
    <section className="mb-8 rounded-3xl bg-slate-950 p-6 text-white sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Your collection</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Saved photography</h1><p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">Keep the images you love in one place, ready to revisit whenever you need them.</p><p className="mt-5 text-sm font-semibold text-emerald-200">{favorites.length} saved {favorites.length === 1 ? "photo" : "photos"}</p></section>
    {error && <div role="alert" className="mb-6 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"><span>{error}</span><button type="button" onClick={load} className="self-start rounded-lg border border-rose-300 px-3 py-2 font-semibold">Retry</button></div>}
    {loading ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n) => <div key={n} className="h-80 animate-pulse rounded-2xl bg-white" />)}</div> : favorites.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{favorites.map((favorite) => { const photo = favorite.photo || favorite; return <article key={photo.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><Link to={`/photo/${photo.id}`} className="block"><img src={resolveImageUrl(photo.image)} alt={photo.title || "Saved photo"} className="h-64 w-full bg-slate-100 object-cover" /><div className="p-4"><p className="font-bold text-slate-900">{photo.title || "Untitled photo"}</p><p className="mt-1 text-sm text-slate-500">{photo.category?.name || "Photography"}</p><p className="mt-3 text-lg font-bold text-emerald-800">${Number(photo.price || 0).toFixed(2)}</p></div></Link><div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-4"><Link to={`/photo/${photo.id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-950 px-3 text-sm font-bold text-white hover:bg-emerald-800">View photo</Link><button type="button" disabled={busyId === photo.id} onClick={() => remove(favorite)} className="min-h-10 rounded-xl border border-rose-200 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">{busyId === photo.id ? "Removing…" : "Remove saved"}</button></div></article>; })}</div> : <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-2xl text-emerald-800">♡</span><h2 className="mt-4 text-xl font-bold text-slate-900">Your saved collection starts here</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Browse the gallery and save photos you love so they are easy to find later.</p><Link to="/gallery" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-emerald-800">Explore the gallery ↗</Link></div>}
  </Container></div>;
}
