import { useCallback, useEffect, useState } from "react";
import { marketplaceAdminAPI, photosAPI } from "../../services/api";

const tabs = ["Collections", "Photographers", "Photo reports", "Newsletter"];
const panelClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const buttonClass = "min-h-10 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-50";

function records(response) {
  return Array.isArray(response) ? response : response?.data || [];
}

export default function MarketplaceManagement() {
  const [activeTab, setActiveTab] = useState("Collections");
  const [collections, setCollections] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [reports, setReports] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [availablePhotos, setAvailablePhotos] = useState([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", status: "draft", is_featured: false });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [c, p, r, n, photoList] = await Promise.all([
        marketplaceAdminAPI.getCollections(),
        marketplaceAdminAPI.getPhotographers(),
        marketplaceAdminAPI.getPhotoReports(),
        marketplaceAdminAPI.getNewsletterSubscribers(),
        photosAPI.getAll(),
      ]);
      setCollections(records(c)); setPhotographers(records(p)); setReports(records(r)); setSubscribers(records(n)); setAvailablePhotos(records(photoList));
    } catch (err) { setError(err?.message || "Marketplace management data could not be loaded."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveCollection = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      await marketplaceAdminAPI.createCollection({ ...form, photo_ids: selectedPhotoIds });
      setForm({ title: "", description: "", status: "draft", is_featured: false }); setSelectedPhotoIds([]);
      setNotice("Collection created."); await load();
    } catch (err) { setError(err?.message || "Collection could not be saved."); }
    finally { setSaving(false); }
  };

  const updatePhotographer = async (person, data) => {
    setError(""); setNotice("");
    try { await marketplaceAdminAPI.updatePhotographer(person.id, data); setNotice("Photographer updated."); await load(); }
    catch (err) { setError(err?.message || "Photographer could not be updated."); }
  };

  const updateReport = async (report, status, deactivate_photo = false) => {
    setError(""); setNotice("");
    try { await marketplaceAdminAPI.updatePhotoReport(report.id, { status, deactivate_photo }); setNotice("Report updated."); await load(); }
    catch (err) { setError(err?.message || "Report could not be updated."); }
  };

  const deleteCollection = async (item) => {
    if (!window.confirm("Delete the collection “" + item.title + "”?")) return;
    setError(""); setNotice("");
    try { await marketplaceAdminAPI.deleteCollection(item.id); setNotice("Collection deleted."); await load(); }
    catch (err) { setError(err?.message || "Collection could not be deleted."); }
  };

  return <div className="space-y-6">
    <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Marketplace operations</p>
      <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Marketplace management</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Manage curated collections, photographer verification, copyright reports and newsletter subscribers. Changes are saved through the Laravel API.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[[collections.length, "Collections"], [photographers.length, "Photographers"], [reports.filter((x) => x.status === "open").length, "Open reports"], [subscribers.filter((x) => !x.unsubscribed_at).length, "Active subscribers"]].map(([value, label]) => <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>)}
      </div>
    </section>

    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
      {tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={buttonClass + " whitespace-nowrap " + (activeTab === tab ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100")}>{tab}</button>)}
    </div>

    {loading ? <div className={panelClass}><p className="text-sm text-slate-500">Loading marketplace data…</p></div> : <>
      {activeTab === "Collections" && <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <form onSubmit={saveCollection} className={panelClass + " space-y-4"}>
          <div><h3 className="font-bold text-slate-950">Create a collection</h3><p className="mt-1 text-sm text-slate-500">Add a curated group of photos for visitors.</p></div>
          <label className="block text-sm font-semibold">Title<input required maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
          <label className="block text-sm font-semibold">Description<textarea rows={4} maxLength={5000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm" /></label>
          <label className="block text-sm font-semibold">Visibility<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select></label>
          <div><p className="text-sm font-semibold">Include photographs</p><div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">{availablePhotos.map((photo) => <label key={photo.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedPhotoIds.includes(photo.id)} onChange={(e) => setSelectedPhotoIds((current) => e.target.checked ? [...current, photo.id] : current.filter((id) => id !== photo.id))} />{photo.title}</label>)}{!availablePhotos.length && <p className="text-xs text-slate-500">No photos available yet.</p>}</div></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Feature this collection</label>
          <button disabled={saving} className={buttonClass + " w-full bg-emerald-600 text-white hover:bg-emerald-700"}>{saving ? "Saving…" : "Create collection"}</button>
        </form>
        <section className={panelClass}><h3 className="font-bold text-slate-950">Existing collections</h3><div className="mt-4 divide-y divide-slate-100">{collections.length ? collections.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="font-semibold text-slate-900">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.photos_count || 0} photos · {item.status} {item.is_featured ? "· Featured" : ""}</p></div><div className="flex gap-2"><button type="button" onClick={async () => { try { await marketplaceAdminAPI.updateCollection(item.id, { status: item.status === "published" ? "draft" : "published" }); setNotice("Collection visibility updated."); await load(); } catch (err) { setError(err.message || "Collection could not be updated."); } }} className={buttonClass + " border border-slate-200 text-slate-700"}>{item.status === "published" ? "Unpublish" : "Publish"}</button><button type="button" onClick={() => deleteCollection(item)} className={buttonClass + " border border-rose-200 text-rose-700 hover:bg-rose-50"}>Delete</button></div></div>) : <p className="py-6 text-sm text-slate-500">No collections have been created.</p>}</div></section>
      </div>}

      {activeTab === "Photographers" && <section className={panelClass}><h3 className="font-bold text-slate-950">Photographer accounts</h3><div className="mt-4 divide-y divide-slate-100">{photographers.length ? photographers.map((person) => <div key={person.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"><div><p className="font-semibold text-slate-900">{person.name}</p><p className="mt-1 text-xs text-slate-500">{person.email} · {person.photos_count || 0} photos</p><p className="mt-1 text-xs text-slate-500">{person.photographer_verified_at ? "Verified photographer" : "Not verified"}{person.is_suspended ? " · Suspended" : ""}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => updatePhotographer(person, { verified: !person.photographer_verified_at })} className={buttonClass + " border border-slate-200 text-slate-700"}>{person.photographer_verified_at ? "Remove verification" : "Verify"}</button><button type="button" onClick={() => updatePhotographer(person, { suspended: !person.is_suspended })} className={buttonClass + " border border-rose-200 text-rose-700"}>{person.is_suspended ? "Unsuspend" : "Suspend"}</button></div></div>) : <p className="py-6 text-sm text-slate-500">No photographer accounts yet. Admins can assign the photographer role from User Management.</p>}</div></section>}

      {activeTab === "Photo reports" && <section className={panelClass}><h3 className="font-bold text-slate-950">Copyright and content reports</h3><div className="mt-4 divide-y divide-slate-100">{reports.length ? reports.map((report) => <div key={report.id} className="space-y-3 py-4"><div><p className="font-semibold text-slate-900">{report.photo?.title || "Photo #" + report.photo_id} · {report.reason}</p><p className="mt-1 text-sm text-slate-600">{report.details || "No additional details provided."}</p><p className="mt-1 text-xs text-slate-500">Reported by {report.reporter?.name || "Visitor"} · {report.status}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => updateReport(report, "reviewing")} className={buttonClass + " border border-slate-200"}>Mark reviewing</button><button type="button" onClick={() => updateReport(report, "resolved")} className={buttonClass + " bg-emerald-600 text-white"}>Resolve</button><button type="button" onClick={() => updateReport(report, "resolved", true)} className={buttonClass + " border border-rose-200 text-rose-700"}>Remove photo & resolve</button><button type="button" onClick={() => updateReport(report, "rejected")} className={buttonClass + " border border-slate-200"}>Reject</button></div></div>) : <p className="py-6 text-sm text-slate-500">No photo reports have been submitted.</p>}</div></section>}

      {activeTab === "Newsletter" && <section className={panelClass}><h3 className="font-bold text-slate-950">Newsletter subscribers</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="py-3 pr-3">Email</th><th className="py-3 pr-3">Subscribed</th><th className="py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{subscribers.map((person) => <tr key={person.id}><td className="py-3 pr-3 font-medium">{person.email}</td><td className="py-3 pr-3 text-slate-500">{person.subscribed_at ? new Date(person.subscribed_at).toLocaleDateString() : "—"}</td><td className="py-3">{person.unsubscribed_at ? "Unsubscribed" : "Active"}</td></tr>)}</tbody></table>{!subscribers.length && <p className="py-6 text-sm text-slate-500">No subscribers yet.</p>}</div></section>}
    </>}
  </div>;
}
