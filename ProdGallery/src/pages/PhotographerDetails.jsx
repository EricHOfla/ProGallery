import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "../components/common/Container";
import PhotoCard from "../components/gallery/PhotoCard";
import { photographersAPI } from "../services/api";
import { resolveImageUrl } from "../utils/image";

export default function PhotographerDetails() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; photographersAPI.getById(id).then((r) => { if (active) setProfile(r); }).catch((e) => { if (active) setError(e.message || "Photographer profile could not be loaded."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [id]);
  const photos = profile?.photos?.data || [];
  return <div className="min-h-screen bg-[#f8faf9]"><Container className="py-12 sm:py-16"><Link to="/photographers" className="text-sm font-semibold text-emerald-800">← All photographers</Link>{loading ? <p className="mt-8 text-sm text-slate-500">Loading profile…</p> : error ? <p role="alert" className="mt-8 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : <><section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-9"><div className="flex flex-col gap-5 sm:flex-row sm:items-center">{profile.avatar ? <img src={resolveImageUrl(profile.avatar)} alt="" className="h-24 w-24 rounded-full object-cover" /> : <div className="grid h-24 w-24 place-items-center rounded-full bg-emerald-50 text-3xl font-bold text-emerald-800">{profile.name?.[0] || "P"}</div>}<div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Photographer profile</p><h1 className="mt-1 text-3xl font-bold text-slate-950">{profile.name}</h1>{profile.verified && <p className="mt-2 text-sm font-semibold text-emerald-800">✓ Verified photographer</p>}</div></div><p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-600">{profile.bio || "This photographer has not added a biography yet."}</p>{profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-emerald-800">Visit website ↗</a>}</section><div className="mt-10"><h2 className="text-xl font-bold text-slate-950">Published photographs</h2>{photos.length ? <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo) => <PhotoCard key={photo.id} photo={photo} />)}</div> : <p className="mt-5 text-sm text-slate-500">No public photographs are available yet.</p>}</div></>}</Container></div>;
}
