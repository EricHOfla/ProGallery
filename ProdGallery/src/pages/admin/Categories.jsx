import { useCallback, useEffect, useMemo, useState } from "react";
import { categoriesAPI } from "../../services/api";

const blankForm = { name: "", slug: "", description: "" };
const makeSlug = (value) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [autoSlug, setAutoSlug] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await categoriesAPI.getAll();
      setCategories(Array.isArray(response) ? response : response?.data || []);
    } catch (err) { setError(err?.message || "Categories could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories.filter((category) => !query || [category.name, category.slug, category.description].filter(Boolean).join(" ").toLowerCase().includes(query));
  }, [categories, search]);

  const openCreate = () => { setEditing(null); setForm(blankForm); setAutoSlug(true); setError(""); setNotice(""); setShowForm(true); };
  const openEdit = (category) => { setEditing(category); setForm({ name: category.name || "", slug: category.slug || "", description: category.description || "" }); setAutoSlug(false); setError(""); setNotice(""); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(blankForm); };

  const save = async (event) => {
    event.preventDefault(); setError(""); setNotice("");
    const payload = { ...form, name: form.name.trim(), slug: form.slug.trim() || makeSlug(form.name) };
    if (!payload.name || !payload.slug) { setError("Enter a category name to continue."); return; }
    setSaving(true);
    try {
      const result = editing ? await categoriesAPI.update(editing.id, payload) : await categoriesAPI.create(payload);
      if (editing) setCategories((items) => items.map((item) => item.id === editing.id ? { ...item, ...payload, ...(result || {}) } : item));
      else setCategories((items) => [...items, result || payload].sort((a, b) => String(a.name).localeCompare(String(b.name))));
      closeForm(); setNotice(editing ? "Category updated." : "Category created.");
    } catch (err) { setError(err?.message || "Category could not be saved. Your changes have not been applied."); }
    finally { setSaving(false); }
  };

  const remove = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"? Photos using this category may be affected.`)) return;
    setDeletingId(category.id); setError(""); setNotice("");
    try { await categoriesAPI.delete(category.id); setCategories((items) => items.filter((item) => item.id !== category.id)); setNotice("Category deleted."); }
    catch (err) { setError(err?.message || "Category could not be deleted."); }
    finally { setDeletingId(null); }
  };

  return <div className="space-y-6">
    <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Catalogue structure</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Categories</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Make the gallery easier to browse by grouping photography into clear collections.</p></div><button type="button" onClick={openCreate} className="min-h-11 rounded-xl bg-emerald-300 px-4 text-sm font-bold text-slate-950 hover:bg-emerald-200">+ New category</button></div><div className="mt-6 grid max-w-md grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Total categories</p><p className="mt-1 text-2xl font-bold">{categories.length}</p></div><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Search results</p><p className="mt-1 text-2xl font-bold">{filtered.length}</p></div></div></section>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"><span>{error}</span><button type="button" onClick={load} className="self-start rounded-lg border border-rose-300 px-3 py-2 font-semibold sm:self-auto">Retry loading</button></div>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h3 className="font-bold text-slate-900">All categories</h3><p className="mt-1 text-sm text-slate-500">Manage names and customer-facing URLs.</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories…" aria-label="Search categories" className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:max-w-xs" /></div>
      {loading ? <div className="space-y-3 p-5">{[1,2,3,4].map((n) => <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div> : filtered.length ? <div className="divide-y divide-slate-100">{filtered.map((category) => <article key={category.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="flex min-w-0 items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-800">▤</span><div className="min-w-0"><h3 className="font-bold text-slate-900">{category.name}</h3><p className="mt-1 break-all text-xs font-medium text-emerald-800">/{category.slug}</p>{category.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{category.description}</p>}</div></div><div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0"><button type="button" onClick={() => openEdit(category)} className="min-h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50">Edit</button><button type="button" disabled={deletingId === category.id} onClick={() => remove(category)} className="min-h-10 rounded-xl border border-rose-200 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">{deletingId === category.id ? "Deleting…" : "Delete"}</button></div></article>)}</div> : <div className="px-6 py-14 text-center"><p className="font-semibold text-slate-900">{search ? "No matching categories" : "No categories yet"}</p><p className="mt-2 text-sm text-slate-500">{search ? "Try another search." : "Create a category to organize your photo catalogue."}</p><button type="button" onClick={search ? () => setSearch("") : openCreate} className="mt-4 text-sm font-bold text-emerald-800">{search ? "Clear search" : "Create first category"}</button></div>}
    </section>
    {showForm && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) closeForm(); }}><form onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="category-form-title" className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Catalogue setup</p><h3 id="category-form-title" className="mt-2 text-xl font-bold text-slate-950">{editing ? "Edit category" : "Create category"}</h3></div><button type="button" disabled={saving} onClick={closeForm} aria-label="Close form" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-xl">×</button></div>{error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}<div className="mt-5 space-y-4"><label className="block text-sm font-semibold text-slate-700">Category name *<input required maxLength={120} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value, slug: autoSlug ? makeSlug(event.target.value) : current.slug }))} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="e.g. Nature & Landscapes" /></label><label className="block text-sm font-semibold text-slate-700">URL slug *<input required maxLength={140} value={form.slug} onChange={(event) => { setAutoSlug(false); setForm((current) => ({ ...current, slug: makeSlug(event.target.value) })); }} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="nature-landscapes" /><span className="mt-1 block text-xs font-normal text-slate-500">Used in category links. Keep it short and readable.</span></label><label className="block text-sm font-semibold text-slate-700">Description<textarea maxLength={500} rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="Briefly describe this collection…" /></label></div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={saving} onClick={closeForm} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button type="submit" disabled={saving} className="min-h-11 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50">{saving ? "Saving…" : editing ? "Save changes" : "Create category"}</button></div></form></div>}
  </div>;
}
