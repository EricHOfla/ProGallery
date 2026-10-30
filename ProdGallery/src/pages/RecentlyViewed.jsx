import { useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import PhotoCard from "../components/gallery/PhotoCard";
import { clearRecentlyViewed, getRecentlyViewed } from "../utils/recentlyViewed";

export default function RecentlyViewed() {
  const [photos, setPhotos] = useState(() => getRecentlyViewed());

  const handleClear = () => {
    clearRecentlyViewed();
    setPhotos([]);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <Container className="py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Your browsing history</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Recently viewed photos</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Return to photographs you have opened recently on this device.</p>
          </div>
          {photos.length > 0 && <button type="button" onClick={handleClear} className="min-h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700">Clear history</button>}
        </div>

        {photos.length > 0 ? (
          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {photos.map((photo) => <PhotoCard key={photo.id} photo={photo} />)}
          </div>
        ) : (
          <div className="mt-9 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-2xl text-emerald-800" aria-hidden="true">◷</div>
            <h2 className="mt-5 text-lg font-semibold text-slate-950">Nothing here yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Photos you open will appear here, so you can find them again later.</p>
            <Link to="/gallery" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-emerald-800">Explore the gallery</Link>
          </div>
        )}
        <p className="mt-6 text-xs text-slate-500">Your recently viewed list is stored in this browser and is not shared with other devices.</p>
      </Container>
    </div>
  );
}
