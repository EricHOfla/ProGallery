import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import { useAuth } from "../context/AuthContext";
import { photographersAPI, photographerWorkspaceAPI, categoriesAPI } from "../services/api";

const initialProfile = { name: "", photographer_bio: "", photographer_website: "", photographer_social_links: { instagram: "", facebook: "", x: "", youtube: "" } };
const initialUpload = { title: "", description: "", category_id: "", price: "", tags: "", image: null, copyright_confirmed: false };

export default function PhotographerWorkspace() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [stats, setStats] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialUpload);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const results = await Promise.all([photographerWorkspaceAPI.getDashboard(), photographerWorkspaceAPI.getPhotos(), categoriesAPI.getAll()]);
      setStats(results[0]); setPhotos(results[1]?.data || []); setCategories(Array.isArray(results[2]) ? results[2] : results[2]?.data || []);
      setProfile((current) => ({ ...current, name: user?.name || current.name }));
    } catch (err) { setError(err.message || "Workspace could not be loaded."); }
    finally { setLoading(false); }
  }, [user?.name]);
  useEffect(() => { load(); }, [load]);

  const saveProfile = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try { await photographersAPI.updateProfile(profile); setNotice("Your public profile has been saved."); }
    catch (err) { setError(err.message || "Profile could not be saved."); }
    finally { setSaving(false); }
  };

  const submitPhoto = async (event) => {
    event.preventDefault(); setUploading(true); setError(""); setNotice("");
    try {
      const data = new FormData();
      data.append("title", form.title); data.append("description", form.description);
      data.append("category_id", form.category_id); data.append("price", form.price);
      form.tags.split(",").map((tag) => tag.trim()).filter(Boolean).forEach((tag, index) => data.append("tags[" + index + "]", tag));
      data.append("copyright_confirmed", form.copyright_confirmed ? "1" : "0");
      data.append("image", form.image);
      await photographerWorkspaceAPI.uploadPhoto(data);
      setForm(initialUpload); setNotice("Your photo was submitted and is awaiting admin review."); await load();
    } catch (err) { setError(err.message || "Photo could not be uploaded."); }
    finally { setUploading(false); }
  };

  const deletePhoto = async (photo) => {
    if (!window.confirm("Delete " + photo.title + "?")) return;
    setError(""); setNotice("");
    try { await photographerWorkspaceAPI.deletePhoto(photo.id); setNotice("Photo deleted."); await load(); }
    catch (err) { setError(err.message || "Photo could not be deleted."); }
  };

  if (user?.role !== "photographer") return <Container className="py-16"><h1 className="text-2xl font-bold">Photographer access required</h1><p className="mt-2 text-sm text-slate-600">Contact ProGallery support if you believe this is incorrect.</p></Container>;

  return <div className="min-h-screen bg-[#f8faf9]"><Container className="py-10 sm:py-14">
    <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Creator studio</p><h1 className="mt-2 text-3xl font-bold">Photographer workspace</h1><p className="mt-2 text-sm leading-6 text-slate-300">Manage your public profile, submit photographs for review and track completed sales.</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[[stats?.total_photos ?? "—", "Total photos"], [stats?.published_photos ?? "—", "Published"], [stats?.pending_photos ?? "—", "Awaiting review"], [stats ? Number(stats.earnings || 0).toFixed(2) : "—", "Gross sales"]].map(([value, label]) => <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>)}</div><p className="mt-3 text-xs text-slate-400">Gross sales are not a payout balance. Photographer payouts are not yet configured.</p></section>

    {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
    {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold">Public profile</h2><p className="mt-1 text-sm text-slate-500">Details shown to visitors on your photographer page.</p><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Display name<input required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label><label className="block text-sm font-semibold">Biography<textarea rows={4} maxLength={3000} value={profile.photographer_bio} onChange={(e) => setProfile({ ...profile, photographer_bio: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm" /></label><label className="block text-sm font-semibold">Website<input type="url" value={profile.photographer_website} onChange={(e) => setProfile({ ...profile, photographer_website: e.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="https://" /></label><button disabled={saving} className="min-h-11 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white">{saving ? "Saving…" : "Save profile"}</button></div></form>

      <form onSubmit={submitPhoto} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold">Submit a photograph</h2><p className="mt-1 text-sm text-slate-500">New submissions remain hidden until approved by an administrator.</p><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Title<input required maxLength={255} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label><label className="block text-sm font-semibold">Description<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-semibold">Category<select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="block text-sm font-semibold">Price (USD)<input required type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label></div><label className="block text-sm font-semibold">Tags<input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="nature, landscape, travel" /></label><label className="block text-sm font-semibold">Image<input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })} className="mt-2 block w-full text-sm" /></label><label className="flex items-start gap-2 text-xs leading-5 text-slate-600"><input type="checkbox" checked={form.copyright_confirmed} onChange={(e) => setForm({ ...form, copyright_confirmed: e.target.checked })} required className="mt-1" />I confirm that I own this photograph or have permission to license it.</label><button disabled={uploading || !form.image} className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white">{uploading ? "Uploading…" : "Submit for review"}</button></div></form>
    </div>

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Your photographs</h2><Link to="/gallery" className="text-sm font-semibold text-emerald-800">View public gallery ↗</Link></div>{loading ? <p className="mt-5 text-sm text-slate-500">Loading your photos…</p> : photos.length ? <div className="mt-4 divide-y divide-slate-100">{photos.map((photo) => <div key={photo.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold">{photo.title}</p><p className="mt-1 text-xs text-slate-500">{photo.moderation_status} · {photo.is_active ? "Public" : "Not public"} · {"$" + Number(photo.price || 0).toFixed(2)}</p></div><button type="button" onClick={() => deletePhoto(photo)} className="min-h-9 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-700">Delete</button></div>)}</div> : <p className="mt-5 text-sm text-slate-500">You have not submitted any photographs yet.</p>}</section>
  </Container></div>;
}
