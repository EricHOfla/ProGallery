import PhotoCard from "./PhotoCard";

export default function PhotoGrid({ photos = [], loading = false, error = "", onRetry }) {
  if (loading) return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading photos" aria-busy="true">
      {Array.from({ length: 6 }, (_, index) => <div key={index} className="overflow-hidden rounded-xl border border-gray-200"><div className="h-64 animate-pulse bg-gray-200" /><div className="space-y-3 p-4"><div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" /><div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" /></div></div>)}
    </div>
  );
  if (error) return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-semibold text-red-800">We could not load the photos.</p><p className="mt-1 text-sm text-red-700">{error}</p>
      {onRetry && <button type="button" onClick={onRetry} className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800">Try again</button>}
    </div>
  );
  if (!photos.length) return <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-600">No photos match your filters. Try changing your search or category.</div>;
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">{photos.map((photo) => <PhotoCard key={photo.id} photo={photo} />)}</div>;
}
