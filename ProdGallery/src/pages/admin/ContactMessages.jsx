import { useCallback, useEffect, useMemo, useState } from "react";
import { contactMessagesAPI } from "../../services/api";

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await contactMessagesAPI.getAll();
      setMessages(Array.isArray(response) ? response : response?.data || []);
    } catch (err) { setError(err?.message || "Messages could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return messages.filter((message) => !query || [message.name, message.email, message.subject, message.message].filter(Boolean).join(" ").toLowerCase().includes(query));
  }, [messages, search]);

  const deleteMessage = async (message) => {
    if (!window.confirm(`Delete the message from ${message.name || message.email || "this sender"}?`)) return;
    setDeletingId(message.id); setError(""); setNotice("");
    try {
      await contactMessagesAPI.delete(message.id);
      setMessages((current) => current.filter((item) => item.id !== message.id));
      setSelectedMessage((current) => current?.id === message.id ? null : current);
      setNotice("Message deleted successfully.");
    } catch (err) { setError(err?.message || "The message could not be deleted."); }
    finally { setDeletingId(null); }
  };

  const date = (value) => value ? new Date(value).toLocaleString() : "Date unavailable";

  return <div className="space-y-6">
    <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Customer care</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Contact messages</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Keep customer questions organized and respond directly to the people contacting your store.</p><div className="mt-6 grid max-w-md grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">All messages</p><p className="mt-1 text-2xl font-bold">{messages.length}</p></div><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Search results</p><p className="mt-1 text-2xl font-bold">{filtered.length}</p></div></div></section>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"><span>{error}</span><button type="button" onClick={load} className="self-start rounded-lg border border-rose-300 px-3 py-2 font-semibold sm:self-auto">Retry</button></div>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4 sm:p-5"><label className="block"><span className="sr-only">Search messages</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sender, email, subject or message…" className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100" /></label></div>
      {loading ? <div className="space-y-3 p-5">{[1,2,3,4].map((n) => <div key={n} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}</div> : filtered.length ? <div className="divide-y divide-slate-100">{filtered.map((message) => <article key={message.id} className="p-4 transition hover:bg-slate-50/70 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="font-bold text-slate-900">{message.name || "Unknown sender"}</p><a href={`mailto:${message.email}`} className="mt-1 block break-all text-sm text-emerald-800 hover:underline">{message.email}</a><p className="mt-1 text-xs text-slate-400">{date(message.created_at)}</p></div><div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => setSelectedMessage(message)} className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-white">Read message</button><button type="button" disabled={deletingId === message.id} onClick={() => deleteMessage(message)} className="min-h-9 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">{deletingId === message.id ? "Deleting…" : "Delete"}</button></div></div>{message.subject && <p className="mt-3 text-sm font-semibold text-slate-800">{message.subject}</p>}<p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{message.message?.length > 240 ? `${message.message.slice(0, 240)}…` : message.message}</p><div className="mt-3 border-t border-slate-100 pt-3"><a href={`mailto:${message.email}?subject=${encodeURIComponent(message.subject ? `Re: ${message.subject}` : "Re: your message to ProdGallery")}`} className="inline-flex min-h-9 items-center rounded-lg bg-slate-950 px-3 text-xs font-bold text-white hover:bg-emerald-800">Reply by email ↗</a></div></article>)}</div> : <div className="px-6 py-16 text-center"><p className="font-semibold text-slate-900">{search ? "No messages match your search" : "No contact messages yet"}</p><p className="mt-2 text-sm text-slate-500">{search ? "Try another name, email or keyword." : "New customer messages will appear here."}</p>{search && <button type="button" onClick={() => setSearch("")} className="mt-3 text-sm font-bold text-emerald-800">Clear search</button>}</div>}
    </section>

    {selectedMessage && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedMessage(null); }}><section role="dialog" aria-modal="true" aria-labelledby="message-dialog-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Customer enquiry</p><h3 id="message-dialog-title" className="mt-2 text-xl font-bold text-slate-950">Message details</h3></div><button type="button" onClick={() => setSelectedMessage(null)} aria-label="Close message details" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-xl text-slate-600 hover:bg-slate-50">×</button></div><div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">From</p><p className="mt-1 font-semibold text-slate-900">{selectedMessage.name || "Unknown sender"}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Received</p><p className="mt-1 text-sm text-slate-800">{date(selectedMessage.created_at)}</p></div><div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p><a href={`mailto:${selectedMessage.email}`} className="mt-1 block break-all text-sm font-semibold text-emerald-800">{selectedMessage.email}</a></div>{selectedMessage.subject && <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</p><p className="mt-1 font-semibold text-slate-900">{selectedMessage.subject}</p></div>}</div><div className="mt-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{selectedMessage.message}</p></div><div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setSelectedMessage(null)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold">Close</button><a href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(selectedMessage.subject ? `Re: ${selectedMessage.subject}` : "Re: your message to ProdGallery")}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white">Reply by email ↗</a></div></section></div>}
  </div>;
}
