import { Link } from "react-router-dom";
import Container from "../common/Container";

export default function Footer() {
  const year = new Date().getFullYear();
  return <footer className="mt-16 bg-slate-950 text-white sm:mt-24">
    <Container className="py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-12">
        <div>
          <Link to="/" className="inline-flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-300 text-sm font-black text-slate-950">PG</span><span className="text-xl font-bold tracking-tight">ProdGallery</span></Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">A curated home for photography. Discover meaningful images, choose the right license, and keep the moments that matter.</p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Photography worth keeping</span>
        </div>
        <div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Explore</h2><div className="mt-5 flex flex-col items-start gap-3 text-sm text-slate-400"><Link className="hover:text-white" to="/">Home</Link><Link className="hover:text-white" to="/gallery">Photo gallery</Link><Link className="hover:text-white" to="/services">Services</Link><Link className="hover:text-white" to="/about">Our story</Link></div></div>
        <div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Your account</h2><div className="mt-5 flex flex-col items-start gap-3 text-sm text-slate-400"><Link className="hover:text-white" to="/login">Sign in</Link><Link className="hover:text-white" to="/register">Create account</Link><Link className="hover:text-white" to="/orders">Order history</Link><Link className="hover:text-white" to="/contact">Contact support</Link></div></div>
        <div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Get in touch</h2><p className="mt-5 text-sm leading-7 text-slate-400">Have a question about a photo, license or booking? We would be happy to hear from you.</p><Link to="/contact" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-200">Contact the team ↗</Link></div>
      </div>
      <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© {year} ProdGallery. All rights reserved.</p><p>Made for the moments worth remembering.</p></div>
    </Container>
  </footer>;
}
