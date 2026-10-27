import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import PhotoCard from "../components/gallery/PhotoCard";
import { photosAPI, categoriesAPI } from "../services/api";

const fieldClass = "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => { setPage(1); }, [searchTerm, minPrice, maxPrice, sortBy, sortOrder, selectedCategory]);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [photoResponse, categoryResponse] = await Promise.all([
          photosAPI.getPage({ search: searchTerm, min_price: minPrice, max_price: maxPrice, sort_by: sortBy, sort_order: sortOrder, category: selectedCategory, page }),
          categoriesAPI.getAll(),
        ]);
        if (!active) return;
        const items = Array.isArray(photoResponse) ? photoResponse : (photoResponse?.data || []);
        setPhotos(items);
        setPagination({
          current_page: Number(photoResponse?.current_page || page),
          last_page: Math.max(1, Number(photoResponse?.last_page || 1)),
          total: Number(photoResponse?.total ?? items.length),
        });
        const categoryItems = Array.isArray(categoryResponse) ? categoryResponse : (categoryResponse?.data || []);
        setCategories(categoryItems.map((item) => ({ name: item.name, slug: item.slug })));
      } catch (requestError) {
        if (active) setError(requestError.message || "We couldn't load the gallery. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [searchTerm, minPrice, maxPrice, sortBy, sortOrder, selectedCategory, page, reload]);

  const clearFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory("");
    setSortBy("created_at");
    setSortOrder("desc");
    setPage(1);
  };
  const hasFilters = Boolean(searchTerm || minPrice || maxPrice || selectedCategory);

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <section className="border-b border-slate-200 bg-white">
        <Container className="py-10 sm:py-14 lg:py-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">The collection</p>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Find your next favourite frame.</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Explore photographs for your personal projects, creative work and the stories you want to tell.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">Thoughtfully curated</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">Flexible usage licenses</span>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-8 sm:py-10">
        <section aria-label="Search and filter photos" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(180px,1fr)_minmax(150px,.8fr)]">
            <div>
              <label htmlFor="gallery-search" className="mb-2 block text-sm font-semibold text-slate-800">Search the collection</label>
              <div className="relative">
                <svg aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7" strokeWidth="1.7" /><path d="m16 16 4 4" strokeWidth="1.7" strokeLinecap="round" /></svg>
                <input id="gallery-search" className={fieldClass + " pl-11"} type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Try portraits, nature, city..." />
              </div>
            </div>
            <div>
              <label htmlFor="gallery-category" className="mb-2 block text-sm font-semibold text-slate-800">Category</label>
              <select id="gallery-category" className={fieldClass} value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                <option value="">All categories</option>
                {categories.map((category) => <option key={category.slug || category.name} value={category.slug}>{category.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="gallery-sort" className="mb-2 block text-sm font-semibold text-slate-800">Sort photos</label>
              <select id="gallery-sort" className={fieldClass} value={sortBy + ":" + sortOrder} onChange={(event) => { const [field, order] = event.target.value.split(":"); setSortBy(field); setSortOrder(order); }}>
                <option value="created_at:desc">Newest first</option>
                <option value="created_at:asc">Oldest first</option>
                <option value="price:asc">Price: low to high</option>
                <option value="price:desc">Price: high to low</option>
                <option value="title:asc">Name: A–Z</option>
                <option value="title:desc">Name: Z–A</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <label htmlFor="gallery-min-price" className="mb-2 block text-sm font-semibold text-slate-800">Minimum price ($)</label>
              <input id="gallery-min-price" className={fieldClass} type="number" min="0" step="0.01" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="No minimum" />
            </div>
            <div>
              <label htmlFor="gallery-max-price" className="mb-2 block text-sm font-semibold text-slate-800">Maximum price ($)</label>
              <input id="gallery-max-price" className={fieldClass} type="number" min="0" step="0.01" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="No maximum" />
            </div>
            <button type="button" onClick={clearFilters} disabled={!hasFilters && sortBy === "created_at" && sortOrder === "desc"} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:text-slate-400">Clear filters</button>
          </div>
        </section>

        <div className="flex flex-col gap-2 py-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Photography to explore</h2>
            <p className="mt-1 text-sm text-slate-500">{loading ? "Finding photographs..." : `${pagination.total} ${pagination.total === 1 ? "photo" : "photos"} in the collection`}</p>
          </div>
          {hasFilters && <button type="button" onClick={clearFilters} className="self-start text-sm font-semibold text-emerald-800 hover:text-emerald-600 sm:self-auto">Reset your search ↗</button>}
        </div>

        {error ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-white px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">The gallery is taking a break.</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{error}</p>
            <button type="button" onClick={() => setReload((value) => value + 1)} className="mt-5 min-h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-emerald-800">Try again</button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="aspect-[4/3] animate-pulse bg-slate-200" /><div className="space-y-3 p-4"><div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" /><div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" /></div></div>)}</div>
        ) : photos.length ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{photos.map((photo) => <PhotoCard key={photo.id} photo={photo} />)}</div>
            {pagination.last_page > 1 && <nav aria-label="Gallery pagination" className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button type="button" disabled={page <= 1} onClick={() => { setPage((value) => Math.max(1, value - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-40">← Previous</button>
              <span className="px-3 text-sm text-slate-500">Page <strong className="text-slate-900">{pagination.current_page}</strong> of <strong className="text-slate-900">{pagination.last_page}</strong></span>
              <button type="button" disabled={page >= pagination.last_page} onClick={() => { setPage((value) => Math.min(pagination.last_page, value + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-40">Next →</button>
            </nav>}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-2xl text-emerald-800">⌕</div>
            <h3 className="mt-5 text-xl font-semibold text-slate-950">No photos found</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Try a different keyword or remove a filter to see more of the collection.</p>
            <button type="button" onClick={clearFilters} className="mt-5 min-h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-emerald-800">Clear search</button>
            <p className="mt-4 text-sm text-slate-500">Need help finding something? <Link to="/contact" className="font-semibold text-emerald-800 hover:underline">Contact us</Link>.</p>
          </div>
        )}
      </Container>
    </div>
  );
}
