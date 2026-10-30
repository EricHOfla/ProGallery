import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import { collectionsAPI } from "../services/api";
import { resolveImageUrl } from "../utils/image";

export default function Collections() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; collectionsAPI.getAll().then((r) => { if (active) setItems(r?.data || []); }).catch((e) => { if (active) setError(e.message || "Collections could not be loaded."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  return <div className="min-h-screen bg-[#f8faf9]"><Container className="py-12 sm:py-16"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Curated stories</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Photography collections</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Explore thoughtfully selected groups of photographs from the ProGallery community.</p>{error && <p role="alert" className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}{loading ? <p className="mt-10 text-sm text-slate-500">Loading collections…</p> : items.length ? <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <Link key={item.id} to={"/collections/" + item.slug} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="aspect-[4/3] overflow-hidden bg-slate-100">{item.cover_image ? <img src={resolveImageUrl(item.cover_image)} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-4xl text-emerald-800">◇</div>}</div><div className="p-5"><h2 className="font-bold text-slate-950">{item.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.description || "Explore this curated collection."}</p><p className="mt-4 text-xs font-semibold text-emerald-800">{item.photos_count || 0} photographs · Explore collection ↗</p></div></Link>)}</div> : <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Collections will appear here as they are published.</p>}</Container></div>;
}
