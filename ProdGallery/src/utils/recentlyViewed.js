const STORAGE_KEY = "prodgallery_recently_viewed";
const MAX_ITEMS = 12;

export function getRecentlyViewed() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(photo) {
  if (!photo?.id) return;
  const current = getRecentlyViewed().filter((item) => String(item.id) !== String(photo.id));
  const safePhoto = {
    id: photo.id,
    title: photo.title || "Untitled photograph",
    image: photo.image || "",
    price: photo.price ?? null,
    category: photo.category || null,
    viewedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([safePhoto, ...current].slice(0, MAX_ITEMS)));
  } catch {
    // Browsing history is optional; storage restrictions must not break the photo page.
  }
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage restrictions.
  }
}
