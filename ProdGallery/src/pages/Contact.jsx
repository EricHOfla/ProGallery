import { useState } from "react";
import Container from "../components/common/Container";
import { contactAPI } from "../services/api";

const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitted(false);
    setLoading(true);
    try {
      await contactAPI.submit(formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (requestError) {
      setError(requestError.message || "We couldn't send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <section className="bg-slate-950 text-white">
        <Container className="py-12 sm:py-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Contact the team</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Let’s talk about what you have in mind.</h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">Questions about a photograph, a license or a project? Send us a note and we’ll help you figure out the next step.</p>
        </Container>
      </section>
      <Container className="py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-7"><h2 className="text-xl font-semibold text-slate-950">Send us a message</h2><p className="mt-2 text-sm leading-6 text-slate-500">Fields marked with * are required.</p></div>
            {submitted && <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><strong>Message sent.</strong> Thanks for reaching out. Your message has been received.</div>}
            {error && <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div><label htmlFor="contact-name" className="text-sm font-semibold text-slate-800">Full name *</label><input id="contact-name" className={inputClass} name="name" value={formData.name} onChange={handleChange} autoComplete="name" required maxLength={120} placeholder="Your name" /></div>
                <div><label htmlFor="contact-email" className="text-sm font-semibold text-slate-800">Email address *</label><input id="contact-email" className={inputClass} type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" required maxLength={254} placeholder="you@example.com" /></div>
              </div>
              <div><label htmlFor="contact-subject" className="text-sm font-semibold text-slate-800">What can we help with? *</label><input id="contact-subject" className={inputClass} name="subject" value={formData.subject} onChange={handleChange} required maxLength={180} placeholder="Photo license, booking, project..." /></div>
              <div><label htmlFor="contact-message" className="text-sm font-semibold text-slate-800">Your message *</label><textarea id="contact-message" className={inputClass + " min-h-36 resize-y"} name="message" value={formData.message} onChange={handleChange} required minLength={10} maxLength={5000} rows={6} placeholder="Tell us a little about what you need..." /><p className="mt-2 text-right text-xs text-slate-400">{formData.message.length}/5000</p></div>
              <button type="submit" disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{loading ? "Sending message..." : "Send message"}{!loading && <span aria-hidden="true">↗</span>}</button>
              <p className="text-xs leading-5 text-slate-500">Please don’t include payment card details or passwords in your message.</p>
            </form>
          </section>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Get in touch</p><h2 className="mt-3 text-xl font-semibold text-slate-950">We’re happy to help.</h2><p className="mt-2 text-sm leading-6 text-slate-600">Choose the contact method that works best for you.</p>
              <a href="mailto:prodgallery7@gmail.com" className="mt-6 flex items-start gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/50"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800">✉</span><span className="min-w-0"><span className="block text-sm font-semibold text-slate-900">Email</span><span className="mt-1 block break-all text-sm text-emerald-800">prodgallery7@gmail.com</span><span className="mt-1 block text-xs text-slate-500">For questions and project enquiries</span></span></a>
              <a href="tel:+250786079810" className="mt-3 flex items-start gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/50"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800">☎</span><span><span className="block text-sm font-semibold text-slate-900">Phone</span><span className="mt-1 block text-sm text-emerald-800">+250 786 079 810</span><span className="mt-1 block text-xs text-slate-500">Call to discuss your request</span></span></a>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-6 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Based in Rwanda</p><h2 className="mt-3 text-lg font-semibold text-slate-950">Kigali, Rwanda</h2><p className="mt-2 text-sm leading-6 text-slate-600">Have a local photography project? Tell us about your location, date and what you’d like to capture.</p><p className="mt-4 text-xs text-slate-500">Remera, Gasabo · Kigali</p></div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
