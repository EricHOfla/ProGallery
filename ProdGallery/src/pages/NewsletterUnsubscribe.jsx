import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Container from "../components/common/Container";
import { newsletterAPI } from "../services/api";

export default function NewsletterUnsubscribe() {
  const [params] = useSearchParams();
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("Processing your request…");
  useEffect(() => {
    let active = true;
    const token = params.get("token");
    if (!token) { setState("error"); setMessage("This unsubscribe link is incomplete."); return; }
    newsletterAPI.unsubscribe(token).then((r) => { if (active) { setState("success"); setMessage(r.message || "You have been unsubscribed."); } }).catch((e) => { if (active) { setState("error"); setMessage(e.message || "We could not process this link."); } });
    return () => { active = false; };
  }, [params]);
  return <div className="min-h-[60vh] bg-[#f8faf9]"><Container className="py-20"><div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center"><h1 className="text-2xl font-bold text-slate-950">Newsletter preferences</h1><p role={state === "error" ? "alert" : "status"} className="mt-4 text-sm leading-6 text-slate-600">{message}</p>{state !== "loading" && <Link to="/" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white">Return to ProGallery</Link>}</div></Container></div>;
}
