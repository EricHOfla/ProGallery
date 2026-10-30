import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { newsletterAPI, storeSettingsAPI } from "../../services/api";
import Container from "../common/Container";

export default function Footer() {
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState({ store_name: "ProGallery", support_email: "", support_phone: "" });
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState({ loading: false, message: "", error: false });

  useEffect(() => {
    let active = true;
    storeSettingsAPI.getPublic().then((data) => { if (active) setSettings((current) => ({ ...current, ...data })); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const subscribe = async (event) => {
    event.preventDefault();
    setNewsletterState({ loading: true, message: "", error: false });
    try {
      const result = await newsletterAPI.subscribe(email);
      setNewsletterState({ loading: false, message: result.message || "Thanks for subscribing.", error: false });
      setEmail("");
    } catch (error) {
      setNewsletterState({ loading: false, message: error.message || "Subscription failed. Please try again.", error: true });
    }
  };

  return <footer className="mt-16 bg-slate-950 text-white sm:mt-24">
    <Container className="py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-12">
        <div>
          <Link to="/" className="inline-flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-300 text-sm font-black text-slate-950">PG</span><span className="text-xl font-bold tracking-tight">{settings.store_name || "ProGallery"}</span></Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">A curated home for photography. Discover meaningful images, choose the right license, and keep the moments that matter.</p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Photography worth keeping</span>
        </div>
        <div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Explore</h2><div className="mt-5 flex flex-col items-start gap-3 text-sm text-slate-400"><Link className="hover:text-white" to="/">Home</Link><Link className="hover:text-white" to="/gallery">Photo gallery</Link><Link className="hover:text-white" to="/collections">Collections</Link><Link className="hover:text-white" to="/photographers">Photographers</Link><Link className="hover:text-white" to="/recently-viewed">Recently viewed</Link><Link className="hover:text-white" to="/services">Services</Link><Link className="hover:text-white" to="/about">Our story</Link></div></div>
        <div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Your account</h2><div className="mt-5 flex flex-col items-start gap-3 text-sm text-slate-400"><Link className="hover:text-white" to="/login">Sign in</Link><Link className="hover:text-white" to="/register">Create account</Link><Link className="hover:text-white" to="/orders">Order history</Link><Link className="hover:text-white" to="/contact">Contact support</Link></div></div>
        <div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Stay connected</h2><p className="mt-5 text-sm leading-7 text-slate-400">Get occasional updates about new photography, collections and stories.</p><form onSubmit={subscribe} className="mt-4 flex flex-col gap-2"><label htmlFor="footer-newsletter-email" className="sr-only">Email address</label><input id="footer-newsletter-email" type="email" required maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" className="min-h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300" /><button type="submit" disabled={newsletterState.loading} className="min-h-11 rounded-xl bg-emerald-300 px-4 text-sm font-bold text-slate-950 hover:bg-emerald-200 disabled:opacity-60">{newsletterState.loading ? "Subscribing…" : "Subscribe"}</button></form>{newsletterState.message && <p role={newsletterState.error ? "alert" : "status"} className={`mt-3 text-xs leading-5 ${newsletterState.error ? "text-rose-300" : "text-emerald-200"}`}>{newsletterState.message}</p>}{settings.support_email && <a href={`mailto:${settings.support_email}`} className="mt-5 block break-all text-sm text-emerald-200 hover:text-white">{settings.support_email}</a>}{settings.support_phone && <a href={`tel:${settings.support_phone}`} className="mt-2 block text-sm text-emerald-200 hover:text-white">{settings.support_phone}</a>}</div>
      </div>
      <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© {year} {settings.store_name || "ProGallery"}. All rights reserved.</p><p>Made for the moments worth remembering.</p></div>
    </Container>
  </footer>;
}
