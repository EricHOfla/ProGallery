import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { photosAPI } from "../../services/api";
import { resolveImageUrl } from "../../utils/image";

export default function AdminPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await photosAPI.getAll();
      setPhotos(Array.isArray(response) ? response : response?.data || []);
    } catch (err) { setError(err?.message || "Photos could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const visiblePhotos = useMemo(() => {
    const query = search.trim().toLowerCase();
    return photos.filter((photo) => !query || [photo.title, photo.description, photo.photographer, photo.category?.name].filter(Boolean).join(" ").toLowerCase().includes(query));
  }, [photos, search]);

  const handleDelete = async (photo) => {
    if (!window.confirm(`Delete "${photo.title}"? This action cannot be undone.`)) return;
    setDeletingId(photo.id); setError(""); setNotice("");
    try {
      await photosAPI.delete(photo.id);
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
      setNotice("Photo deleted successfully.");
    } catch (err) { setError(err?.message || "Photo could not be deleted. It is still in your gallery."); }
    finally { setDeletingId(null); }
  };

  return <div className="space-y-6">
    <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Catalogue management</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Photos & gallery</h2><p className="mt-2 text-sm leading-6 text-slate-300">Publish, update and organize the images customers can discover and license.</p></div><Link to="/admin/photos/new" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-300 px-4 text-sm font-bold text-slate-950 hover:bg-emerald-200">+ Add a photo</Link></div><div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md"><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Total listings</p><p className="mt-1 text-2xl font-bold">{photos.length}</p></div><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Featured work</p><p className="mt-1 text-2xl font-bold">{photos.filter((photo) => photo.featured).length}</p></div></div></section>

    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"><span>{error}</span><button onClick={load} type="button" className="self-start rounded-lg border border-rose-300 px-3 py-2 font-semibold sm:self-auto">Try again</button></div>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h3 className="font-bold text-slate-900">Your catalogue</h3><p className="mt-1 text-sm text-slate-500">{visiblePhotos.length} of {photos.length} listings</p></div><label className="block w-full sm:max-w-sm"><span className="sr-only">Search photos</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, category, photographer…" className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100" /></label></div>
      {loading ? <div className="space-y-3 p-5">{[1,2,3,4,5].map((n) => <div key={n} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}</div> : visiblePhotos.length ? <>
        <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[800px] text-left"><thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"><tr><th className="px-5 py-4">Photo</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Visibility</th><th className="px-5 py-4">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visiblePhotos.map((photo) => <tr key={photo.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><img src={resolveImageUrl(photo.image)} alt="" className="h-14 w-16 rounded-lg bg-slate-100 object-cover" /><div className="min-w-0"><p className="max-w-xs truncate text-sm font-bold text-slate-900">{photo.title}</p><p className="mt-1 max-w-xs truncate text-xs text-slate-500">{photo.photographer || "Photographer not specified"}</p></div></div></td><td className="px-5 py-4 text-sm text-slate-600">{photo.category?.name || "Uncategorized"}</td><td className="px-5 py-4 text-sm font-bold">${Number(photo.price || 0).toFixed(2)}</td><td className="px-5 py-4"><div className="flex flex-wrap gap-1.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${photo.is_active === false ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-800"}`}>{photo.is_active === false ? "Hidden" : "Published"}</span>{photo.featured && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">Featured</span>}</div></td><td className="px-5 py-4"><div className="flex items-center gap-2"><Link to={`/admin/photos/edit/${photo.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">Edit</Link><button type="button" disabled={deletingId === photo.id} onClick={() => handleDelete(photo)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">{deletingId === photo.id ? "Deleting…" : "Delete"}</button></div></td></tr>)}</tbody></table></div>
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">{visiblePhotos.map((photo) => <article key={photo.id} className="overflow-hidden rounded-2xl border border-slate-200"><img src={resolveImageUrl(photo.image)} alt={photo.title || "Gallery photo"} className="h-48 w-full bg-slate-100 object-cover" /><div className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-bold text-slate-900">{photo.title}</h3><p className="mt-1 text-sm text-slate-500">{photo.category?.name || "Uncategorized"}</p></div><p className="shrink-0 font-bold">${Number(photo.price || 0).toFixed(2)}</p></div><div className="flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${photo.is_active === false ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-800"}`}>{photo.is_active === false ? "Hidden" : "Published"}</span>{photo.featured && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">Featured</span>}</div><div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3"><Link to={`/admin/photos/edit/${photo.id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold">Edit photo</Link><button type="button" disabled={deletingId === photo.id} onClick={() => handleDelete(photo)} className="min-h-10 rounded-xl border border-rose-200 text-sm font-semibold text-rose-700 disabled:opacity-50">{deletingId === photo.id ? "Deleting…" : "Delete"}</button></div></div></article>)}</div>
      </> : <div className="px-6 py-16 text-center"><p className="font-semibold text-slate-900">{search ? "No photos match your search" : "Your gallery is ready for its first photo"}</p><p className="mt-2 text-sm text-slate-500">{search ? "Try another title or category." : "Add a photo to start building your catalogue."}</p>{search ? <button type="button" onClick={() => setSearch("")} className="mt-4 text-sm font-bold text-emerald-800">Clear search</button> : <Link to="/admin/photos/new" className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white">Add first photo</Link>}</div>}
    </section>
  </div>;
}
