import { useCallback, useEffect, useState } from "react";
import { storeSettingsAPI } from "../../services/api";

const defaults = {
  store_name: "ProGallery",
  support_email: "",
  support_phone: "",
  personal_license_multiplier: "1",
  commercial_license_multiplier: "2",
  extended_license_multiplier: "5",
  refund_policy: "Contact support to request a refund. Refund eligibility is reviewed according to the store policy and applicable law.",
  delivery_policy: "Digital downloads become available after payment has been confirmed by the payment provider.",
};

const inputClass = "mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";
const labelClass = "block text-sm font-semibold text-slate-800";

export default function StoreSettings() {
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSettings({ ...defaults, ...(await storeSettingsAPI.get()) });
    } catch (err) {
      setError(err?.message || "Store settings could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const change = (event) => setSettings((current) => ({ ...current, [event.target.name]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await storeSettingsAPI.update(settings);
      setSettings({ ...defaults, ...(result.settings || settings) });
      setNotice("Your settings have been saved.");
    } catch (err) {
      setError(err?.message || "Settings could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="space-y-6">
    <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Store configuration</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Store settings</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Manage public store details, customer support information, licensing prices, and the policies shown to customers. Changes are saved to the backend database.</p>
    </section>

    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"><span>{error}</span><button type="button" onClick={load} className="self-start rounded-lg border border-rose-300 px-3 py-2 font-semibold hover:bg-rose-100">Retry</button></div>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{notice}</p>}

    <form onSubmit={save} className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="text-lg font-bold text-slate-950">Store identity</h3>
        <p className="mt-1 text-sm text-slate-500">The public business name and ways customers can reach you.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={labelClass}>Store name<input name="store_name" value={settings.store_name} onChange={change} required maxLength={120} className={inputClass} /></label>
          <label className={labelClass}>Support email<input type="email" name="support_email" value={settings.support_email} onChange={change} maxLength={255} className={inputClass} placeholder="support@example.com" /></label>
          <label className={labelClass}>Support phone<input name="support_phone" value={settings.support_phone} onChange={change} maxLength={40} className={inputClass} placeholder="+250 ..." /></label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="text-lg font-bold text-slate-950">Digital license pricing</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">Each value multiplies the photo's base price. Changes affect new cart calculations and new orders; existing order prices are preserved.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {[
            ["personal_license_multiplier", "Personal license", 20],
            ["commercial_license_multiplier", "Commercial license", 50],
            ["extended_license_multiplier", "Extended license", 100],
          ].map(([name, label, max]) => <label key={name} className={labelClass}>{label} multiplier<input type="number" name={name} value={settings[name]} onChange={change} min="1" max={max} step="0.1" required className={inputClass} /><span className="mt-1 block text-xs font-normal text-slate-500">Base price × {settings[name] || "—"}</span></label>)}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="text-lg font-bold text-slate-950">Customer policies</h3>
        <p className="mt-1 text-sm text-slate-500">Keep policy wording clear and consistent with your actual business process.</p>
        <div className="mt-5 space-y-5">
          <label className={labelClass}>Refund policy<textarea name="refund_policy" value={settings.refund_policy} onChange={change} required maxLength={5000} rows={4} className={inputClass} /></label>
          <label className={labelClass}>Digital delivery policy<textarea name="delivery_policy" value={settings.delivery_policy} onChange={change} required maxLength={5000} rows={4} className={inputClass} /></label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-500">Payment secret keys and email credentials must be configured securely in hosting environment variables, not stored here.</p>
        <button type="submit" disabled={loading || saving} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving…" : "Save settings"}</button>
      </div>
    </form>
  </div>;
}
