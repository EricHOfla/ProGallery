import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import Reviews from "../components/gallery/Reviews";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { photosAPI, favoritesAPI } from "../services/api";
import { resolveImageUrl } from "../utils/image";
import { recordRecentlyViewed } from "../utils/recentlyViewed";

export default function PhotoDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [addedToCart, setAddedToCart] = useState(false);
  const [licenseType, setLicenseType] = useState("personal");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [relatedPhotos, setRelatedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        setLoading(true);
        const [photoResponse, allPhotosResponse] = await Promise.all([
          photosAPI.getById(id),
          photosAPI.getAll(),
        ]);

        const allPhotos = Array.isArray(allPhotosResponse)
          ? allPhotosResponse
          : allPhotosResponse?.data || [];

        setPhoto(photoResponse);
        setRelatedPhotos(allPhotos.filter((p) => p.id !== photoResponse.id).slice(0, 3));
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load photo");
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [id]);

  useEffect(() => {
    if (photo) recordRecentlyViewed(photo);
  }, [photo]);

  useEffect(() => {
    let active = true;
    if (user) {
      favoritesAPI.getAll().then((favorites) => {
        if (active) setIsFavorite(favorites.some((favorite) => Number(favorite.photo_id || favorite.photo?.id) === Number(id)));
      }).catch(() => { if (active) setIsFavorite(false); });
    } else { setIsFavorite(false); }
    return () => { active = false; };
  }, [id, user]);

  const handleFavorite = async () => {
    if (!user) { navigate("/login"); return; }
    setFavoriteLoading(true);
    setFavoriteError("");
    try {
      if (isFavorite) { await favoritesAPI.remove(photo.id); setIsFavorite(false); }
      else { await favoritesAPI.add(photo.id); setIsFavorite(true); }
    } catch (favoriteRequestError) { setFavoriteError(favoriteRequestError.message || "Could not update favorites."); }
    finally { setFavoriteLoading(false); }
  };

  const handleShare = async () => {
    const shareData = { title: photo?.title || "Photo on ProGallery", text: photo?.description || "Take a look at this photograph on ProGallery.", url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        window.alert("Photo link copied to clipboard.");
      } else {
        window.prompt("Copy this photo link:", shareData.url);
      }
    } catch (shareError) {
      if (shareError.name !== "AbortError") window.alert("Unable to share this photo right now.");
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    addToCart(photo, 1, licenseType);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <Container className="py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-12 md:mb-16">
          <div className="h-80 md:h-[28rem] bg-gray-200 rounded-lg animate-pulse" />
          <div className="space-y-6">
            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-16">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={`related-skeleton-${index}`} className="border rounded-lg overflow-hidden">
                <div className="h-64 bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (error || !photo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Container className="text-center">
          <h2 className="text-2xl font-bold mb-4">Photo Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "Sorry, the photo you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate("/gallery")}>Back to Gallery</Button>
        </Container>
      </div>
    );
  }

  return (
    <Container className="py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-12 md:mb-16">
        <div>
          <img
            src={resolveImageUrl(photo.image)}
            alt={photo.title}
            className="w-full rounded-lg shadow-lg no-download"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{photo.title}</h1>

          <div className="mb-6">
            <p className="text-2xl md:text-3xl font-bold text-emerald-600 mb-2">
              ${photo.price}
            </p>
            <p className="text-gray-600 text-sm md:text-base">{photo.description}</p>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-2">Category</h3>
            <p className="text-gray-700">{photo.category?.name || "Uncategorized"}</p>
          </div>

          <div className="mb-6 rounded-lg border border-gray-200 p-4">
            <label htmlFor="license-type" className="mb-2 block font-semibold">Choose a photo license</label>
            <select id="license-type" value={licenseType} onChange={(event) => setLicenseType(event.target.value)} className="w-full rounded-lg border border-gray-300 p-3">
              <option value="personal">Personal use — ${Number(photo.price).toFixed(2)}</option>
              <option value="commercial">Commercial use — ${(Number(photo.price) * 2).toFixed(2)}</option>
              <option value="extended">Extended use — ${(Number(photo.price) * 5).toFixed(2)}</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">Personal 1× · Commercial 2× · Extended 5×. Confirm your actual license terms before selling.</p>
          </div>
          <div className="mb-4 flex flex-wrap gap-2"><button type="button" onClick={handleShare} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-800">Share photo</button>{user && <button type="button" onClick={handleFavorite} disabled={favoriteLoading} className="mb-4 rounded-lg border border-emerald-700 px-4 py-2 font-medium text-emerald-800 disabled:opacity-50">{favoriteLoading ? "Saving..." : isFavorite ? "♥ Remove from Favorites" : "♡ Save to Favorites"}</button>}</div>
          {favoriteError && <p role="alert" className="mb-4 text-sm text-red-700">{favoriteError}</p>}

          <div className="mb-8">
            <h3 className="font-semibold mb-2">Details</h3>
            <ul className="space-y-2 text-gray-700 text-sm md:text-base">
              <li>
                <strong>Resolution:</strong> High resolution
              </li>
              <li>
                <strong>Format:</strong> {photo.format || "JPEG"}
              </li>
              <li>
                <strong>Usage Rights:</strong> Personal and commercial use
              </li>
            </ul>
          </div>

          {!user && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-800 mb-3">
                Please login to add items to your cart
              </p>
              <Button 
                variant="primary"
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Login to Shop
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            {user && (
              <Button 
                variant="primary"
                onClick={handleAddToCart}
                className={`${addedToCart ? "bg-green-600 hover:bg-green-700" : ""} flex-1`}
              >
                {addedToCart ? "✓ Added to Cart" : "Add to Cart"}
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate("/gallery")} className={user ? "flex-1" : "w-full"}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>

      {relatedPhotos.length > 0 && (
        <div className="mt-12 md:mt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Related Photos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {relatedPhotos.map((p) => (
              <div
                key={p.id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/photo/${p.id}`)}
              >
                <img
                  src={resolveImageUrl(p.image)}
                  alt={p.title}
                  className="w-full h-64 object-cover no-download"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                <div className="p-4">
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-gray-600">${p.price}</p>
                </div>
              </div>
            ))}

      {/* Reviews Section */}
      <Reviews photoId={id} />
          </div>
        </div>
      )}
    </Container>
  );
}
