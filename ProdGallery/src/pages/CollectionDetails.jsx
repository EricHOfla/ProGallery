import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "../components/common/Container";
import PhotoCard from "../components/gallery/PhotoCard";
import { collectionsAPI } from "../services/api";

export default function CollectionDetails() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; collectionsAPI.getBySlug(slug).then((r) => { if (active) setCollection(r); }).catch((e) => { if (active) setError(e.message || "This collection could not be found."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [slug]);
  const photos = Array.isArray(collection?.photos) ? collection.photos : collection?.photos?.data || [];
  return <div className="min-h-screen bg-[#f8faf9]"><Container className="py-12 sm:py-16"><Link to="/collections" className="text-sm font-semibold text-emerald-800">← All collections</Link>{loading ? <p className="mt-8 text-sm text-slate-500">Loading collection…</p> : error ? <p role="alert" className="mt-8 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : <><p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Curated collection</p><h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">{collection.title}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{collection.description}</p>{photos.length ? <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo) => <PhotoCard key={photo.id} photo={photo} />)}</div> : <p className="mt-9 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">There are no published photographs in this collection yet.</p>}</>}</Container></div>;
}
