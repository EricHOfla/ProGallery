import { Link } from "react-router-dom";
import Container from "../components/common/Container";

const services = [
  { number: "01", title: "Wedding & celebrations", description: "Preserve the big feelings and little details of the days you never want to forget.", tags: "Weddings · Milestones" },
  { number: "02", title: "Portraits & headshots", description: "Natural, thoughtful portraits for individuals, families and professional profiles.", tags: "Personal · Professional" },
  { number: "03", title: "Brand & product", description: "Clear, distinctive imagery that helps your products and business tell their story.", tags: "Products · Campaigns" },
  { number: "04", title: "Events & documentary", description: "Real moments, people and atmosphere captured with care, from conferences to community events.", tags: "Events · Stories" },
  { number: "05", title: "Commercial licensing", description: "Choose a suitable usage license for photographs used in your business or creative work.", tags: "Personal · Commercial" },
  { number: "06", title: "Custom projects", description: "Have a particular brief in mind? Tell us what you need and we can discuss the right approach.", tags: "Made for your brief" },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <section className="bg-slate-950 text-white">
        <Container className="py-14 sm:py-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">What we do</p>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div><h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Photography for real stories and ambitious ideas.</h1><p className="mt-5 max-w-xl text-base leading-8 text-slate-300">From personal milestones to commercial projects, we help you find imagery that feels right for your purpose.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><p className="text-sm font-semibold text-emerald-300">Not sure where to start?</p><p className="mt-2 text-sm leading-6 text-slate-300">Share your idea, timing and intended use. We’ll help you work out the next step.</p><Link to="/contact" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-300 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-200">Discuss your project ↗</Link></div>
          </div>
        </Container>
      </section>
      <Container className="py-12 sm:py-16">
        <div className="mb-8 max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Ways we can help</p><h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">A thoughtful approach, tailored to you.</h2><p className="mt-3 text-sm leading-7 text-slate-600">Every project is different. Contact us to discuss availability, deliverables and a quote before making a booking.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => <article key={service.number} className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-900/[0.04] sm:p-7"><p className="text-xs font-bold tracking-[0.18em] text-emerald-700">{service.number}</p><h3 className="mt-5 text-xl font-semibold text-slate-950">{service.title}</h3><p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-600">{service.description}</p><p className="mt-5 border-t border-slate-100 pt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{service.tags}</p><Link to="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-600">Ask about this service <span aria-hidden="true">→</span></Link></article>)}
        </div>
        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"><div><h2 className="text-xl font-semibold text-slate-950">Have a unique project in mind?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Tell us what you’re creating and we’ll help you explore the options. No made-up package prices — every quote is based on your brief.</p></div><Link to="/contact" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-emerald-800">Request a quote ↗</Link></div>
      </Container>
    </div>
  );
}
