import { Link } from "react-router-dom";
import { resolveImageUrl } from "../../utils/image";

export default function PhotoCard({ photo }) {
  const price = Number(photo.price);
  const categoryName = photo.category?.name || photo.category || "Photography";
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/[0.08]">
      <Link to={`/photo/${photo.id}`} className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-emerald-400" aria-label={`View ${photo.title || "photo"} details`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={resolveImageUrl(photo.image)}
            alt={photo.title || "Photography from ProdGallery"}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] no-download"
            draggable={false}
            onContextMenu={(event) => event.preventDefault()}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
          <span className="absolute bottom-4 left-4 rounded-full border border-white/25 bg-slate-950/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">{categoryName}</span>
          <span className="absolute right-4 top-4 grid h-10 w-10 translate-y-1 place-items-center rounded-full bg-white/95 text-lg text-slate-950 opacity-0 shadow-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">↗</span>
        </div>
      </Link>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-950 sm:text-lg">{photo.title || "Untitled photograph"}</h3>
            <p className="mt-1 text-sm text-slate-500">Digital photograph · License options available</p>
          </div>
          <p className="shrink-0 text-base font-bold tabular-nums text-emerald-800">{Number.isFinite(price) ? `$${price.toFixed(2)}` : "View price"}</p>
        </div>
        <Link to={`/photo/${photo.id}`} className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-emerald-800">View photo details <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
