import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import SectionTitle from "../components/common/SectionTitle";
import Button from "../components/common/Button";
import PhotoCard from "../components/gallery/PhotoCard";
import { photosAPI } from "../services/api";
import { resolveImageUrl } from "../utils/image";

const services = [
  { number: "01", title: "Wedding stories", description: "Thoughtful coverage of the moments, people and details that make your day yours.", icon: "♡" },
  { number: "02", title: "Portraits", description: "Natural, confident portraits for individuals, families and professional profiles.", icon: "◉" },
  { number: "03", title: "Brand & events", description: "Distinctive visuals for businesses, celebrations, products and live events.", icon: "✳" },
];

export default function Home() {
  const [featuredPhotos, setFeaturedPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  useEffect(() => {
    let active = true;
    photosAPI.getAll({ sort_by: "created_at", sort_order: "desc" })
      .then((items) => { if (active) setFeaturedPhotos((Array.isArray(items) ? items : []).slice(0, 3)); })
      .catch(() => { if (active) setFeaturedPhotos([]); })
      .finally(() => { if (active) setLoadingPhotos(false); });
    return () => { active = false; };
  }, []);

  const heroPhoto = featuredPhotos[0];

  return (
    <div className="overflow-hidden bg-white text-slate-900">
      <section className="relative isolate min-h-[640px] overflow-hidden bg-slate-950 text-white sm:min-h-[700px]">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_75%_20%,rgba(16,185,129,0.28),transparent_40%),linear-gradient(125deg,#071b19_0%,#0f2926_48%,#101827_100%)]" />
        <div className="absolute -right-24 top-20 -z-10 h-72 w-72 rounded-full border border-white/10 sm:right-10 sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute right-0 top-36 -z-10 h-52 w-52 rounded-full border border-white/10 sm:right-24 sm:h-80 sm:w-80" />
        <Container className="grid min-h-[640px] items-center gap-12 py-16 sm:min-h-[700px] sm:py-24 lg:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Photography with feeling</p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">Keep the feeling.<span className="mt-2 block font-serif italic font-normal text-emerald-300">Keep the moment.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">Thoughtful photography for the moments you want to remember — from personal milestones to the stories behind your brand.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link to="/gallery" className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-300 px-6 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200">Explore the gallery <span className="ml-3 text-lg">↗</span></Link><Link to="/contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition hover:bg-white/10">Book a session</Link></div>
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/15 pt-6 text-xs font-medium uppercase tracking-[0.14em] text-slate-400"><span>Portraits</span><span>Celebrations</span><span>Commercial</span><span>Documentary</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            <div className="absolute -inset-5 rotate-3 rounded-[2rem] border border-emerald-200/15" />
            <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-slate-800 p-2 shadow-2xl shadow-black/40">
              {heroPhoto ? <img src={resolveImageUrl(heroPhoto.image)} alt={heroPhoto.title || "Featured photography"} className="h-[390px] w-full rounded-[1.2rem] object-cover sm:h-[470px]" /> : <div className="flex h-[390px] items-end rounded-[1.2rem] bg-gradient-to-br from-emerald-700 via-slate-800 to-slate-950 p-8 sm:h-[470px]"><span className="font-serif text-4xl italic text-emerald-100">{loadingPhotos ? "Finding the next story..." : "A moment, made lasting."}</span></div>}
              {heroPhoto && <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 rounded-2xl border border-white/15 bg-slate-950/70 p-4 backdrop-blur-md"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Selected work</p><p className="mt-1 text-base font-semibold">{heroPhoto.title}</p></div><Link to="/gallery" aria-label="Browse featured photography" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-slate-950 transition hover:bg-emerald-200">↗</Link></div>}
            </div>
            <div className="absolute -bottom-7 -left-5 hidden rounded-2xl border border-white/10 bg-slate-900/95 px-5 py-4 shadow-xl sm:block"><p className="text-sm font-semibold">Made to be remembered</p><p className="mt-1 text-xs text-slate-400">Real moments. Lasting images.</p></div>
          </div>
        </Container>
      </section>

      <section className="border-b border-slate-100 bg-white py-7"><Container className="flex flex-wrap items-center justify-between gap-4"><p className="max-w-sm text-sm leading-6 text-slate-500">A creative studio for honest moments, beautiful details and stories worth sharing.</p><Link to="/about" className="text-sm font-bold text-emerald-800 transition hover:text-emerald-600">Get to know us <span aria-hidden="true">→</span></Link></Container></section>

      <section className="py-16 sm:py-24"><Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5 sm:mb-12"><div className="max-w-xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">A few favourites</p><SectionTitle title="Work that speaks for itself" subtitle="A glimpse into the people, places and moments we have captured." /></div><Link to="/gallery" className="inline-flex min-h-11 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:border-emerald-600 hover:text-emerald-800">Browse all work ↗</Link></div>
        {loadingPhotos ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n) => <div key={n} className="h-80 animate-pulse rounded-2xl bg-slate-100" />)}</div> : featuredPhotos.length > 0 ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{featuredPhotos.map((photo) => <PhotoCard key={photo.id} photo={photo} />)}</div> : <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center"><p className="font-semibold">New work is on the way.</p><p className="mt-2 text-sm text-slate-500">Published photos added through the admin panel will appear here.</p><Link to="/gallery" className="mt-4 inline-flex text-sm font-bold text-emerald-800">Explore the gallery →</Link></div>}
      </Container></section>

      <section className="bg-[#f5f7f4] py-16 sm:py-24"><Container>
        <div className="mb-10 max-w-xl sm:mb-12"><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">What we do</p><SectionTitle title="Your story, our perspective" subtitle="From the first conversation to the final image, we make the experience feel considered and personal." /></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{services.map((service) => <article key={service.number} className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-slate-900/5 sm:p-8"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-2xl text-emerald-800">{service.icon}</span><span className="text-xs font-bold tracking-[0.18em] text-slate-400">{service.number}</span></div><h3 className="mt-7 text-xl font-bold tracking-tight">{service.title}</h3><p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-600">{service.description}</p><Link to="/contact" className="mt-6 inline-flex items-center text-sm font-bold text-emerald-800">Let's talk <span className="ml-2 transition group-hover:translate-x-1">→</span></Link></article>)}</div>
        <div className="mt-8 text-center"><Button variant="outline"><Link to="/services">Discover our services</Link></Button></div>
      </Container></section>

      <section className="px-4 py-16 sm:px-6 sm:py-24"><div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Let's create something meaningful</p><h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">Some moments deserve more than a memory.</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">Tell us what you have in mind. We'll help turn it into images you'll want to return to.</p><Link to="/contact" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-300 px-6 text-sm font-bold text-slate-950 transition hover:bg-emerald-200">Start a conversation ↗</Link></div></section>
    </div>
  );
}
