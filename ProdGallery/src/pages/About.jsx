import { Link } from "react-router-dom";
import Container from "../components/common/Container";

const values = [
  { title: "Care in every frame", text: "We value thoughtful composition, meaningful moments and the details that make an image memorable." },
  { title: "Clear choices", text: "We make it easier to explore photography and understand which usage option suits your needs." },
  { title: "People first", text: "We listen to the story behind each project and aim to make the process welcoming and straightforward." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <section className="bg-slate-950 text-white">
        <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div><p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">About ProdGallery</p><h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Every photograph has a story. Find one that speaks to you.</h1><p className="mt-6 max-w-xl text-base leading-8 text-slate-300">ProdGallery brings photography together in one place, helping people discover images for personal memories, creative projects and business needs.</p><Link to="/gallery" className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-emerald-300 px-5 text-sm font-bold text-slate-950 hover:bg-emerald-200">Explore the collection ↗</Link></div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900 via-slate-800 to-slate-950 p-8 sm:p-10"><div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" /><div className="absolute -right-2 top-2 h-36 w-36 rounded-full border border-white/10" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Our point of view</p><p className="mt-5 font-serif text-3xl italic leading-snug text-white sm:text-4xl">“The right image can make a feeling last — and an idea come alive.”</p><p className="mt-6 text-sm text-slate-300">Photography for people, places and possibilities.</p></div></div>
        </Container>
      </section>
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">What matters to us</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">A more considered way to discover photography.</h2></div>
          <div className="grid gap-4 sm:grid-cols-3">{values.map((value, index) => <article key={value.title} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-800">0{index + 1}</span><h3 className="mt-5 font-semibold text-slate-950">{value.title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{value.text}</p></article>)}</div>
        </div>
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-9"><div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><h2 className="text-2xl font-semibold text-slate-950">Let’s find the right image for your idea.</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">Browse the gallery, compare available license options, or get in touch if you need help choosing.</p></div><div className="flex flex-wrap gap-3"><Link to="/gallery" className="inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-emerald-800">Browse photos</Link><Link to="/contact" className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-800">Contact us</Link></div></div></div>
      </Container>
    </div>
  );
}
