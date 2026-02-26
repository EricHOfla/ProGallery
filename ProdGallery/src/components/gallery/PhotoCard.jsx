import { Link } from "react-router-dom";
import { resolveImageUrl } from "../../utils/image";

export default function PhotoCard({ photo }) {
  return (
    <div className="group border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative overflow-hidden bg-gray-100">
        <img
          src={resolveImageUrl(photo.image)}
          alt={photo.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 no-download"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <Link
            to={`/photo/${photo.id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
              View Details
            </button>
          </Link>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{photo.title}</h3>
            <p className="text-sm text-gray-500">{photo.category?.name || photo.category || "Uncategorized"}</p>
          </div>
        </div>
        <p className="text-emerald-600 font-bold text-lg">${photo.price}</p>
      </div>
    </div>
  );
}
