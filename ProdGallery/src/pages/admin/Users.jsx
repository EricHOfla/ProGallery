import { useCallback, useEffect, useMemo, useState } from "react";
import { usersAPI } from "../../services/api";

const emptyUser = { first_name: "", last_name: "", email: "", password: "", role: "customer" };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyUser);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await usersAPI.getAll(); setUsers(Array.isArray(response) ? response : response?.data || []); }
    catch (err) { setError(err?.message || "Users could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => (roleFilter === "all" || user.role === roleFilter) && (!query || [user.first_name, user.last_name, user.name, user.email, user.role].filter(Boolean).join(" ").toLowerCase().includes(query)));
  }, [users, search, roleFilter]);

  const openForm = (user = null) => {
    setEditing(user);
    setForm(user ? { first_name: user.first_name || "", last_name: user.last_name || "", email: user.email || "", password: "", role: user.role || "customer" } : emptyUser);
    setError(""); setNotice(""); setModalOpen(true);
  };
  const closeForm = () => { setModalOpen(false); setEditing(null); setForm(emptyUser); };

  const saveUser = async (event) => {
    event.preventDefault(); setError(""); setNotice("");
    const payload = { ...form, first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim() };
    if (editing && !payload.password) delete payload.password;
    if (!payload.first_name || !payload.email || (!editing && !payload.password)) { setError("Complete the required fields before saving."); return; }
    setSaving(true);
    try {
      if (editing) {
        const updated = await usersAPI.update(editing.id, payload);
        setUsers((current) => current.map((user) => user.id === editing.id ? { ...user, ...payload, ...(updated || {}), password: undefined } : user));
      } else {
        const created = await usersAPI.create(payload);
        setUsers((current) => [...current, created || { ...payload, id: Date.now() }]);
      }
      closeForm(); setNotice(editing ? "User updated successfully." : "User created successfully.");
    } catch (err) { setError(err?.message || "User could not be saved."); }
    finally { setSaving(false); }
  };

  const updateRole = async (user, role) => {
    const oldRole = user.role; setBusyId(user.id); setError(""); setNotice("");
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, role } : item));
    try { await usersAPI.update(user.id, { role }); setNotice("User role updated."); }
    catch (err) { setUsers((current) => current.map((item) => item.id === user.id ? { ...item, role: oldRole } : item)); setError(err?.message || "Role update failed. Previous role restored."); }
    finally { setBusyId(null); }
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Delete the account for ${user.email}? This cannot be undone.`)) return;
    setBusyId(user.id); setError(""); setNotice("");
    try { await usersAPI.delete(user.id); setUsers((current) => current.filter((item) => item.id !== user.id)); setNotice("User account deleted."); }
    catch (err) { setError(err?.message || "User account could not be deleted."); }
    finally { setBusyId(null); }
  };

  const fullName = (user) => [user.first_name, user.last_name].filter(Boolean).join(" ") || user.name || "Unnamed user";
  const initials = (user) => fullName(user).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return <div className="space-y-6">
    <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">People & permissions</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Customer accounts</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Manage customer profiles, review account roles and keep access organized.</p></div><button type="button" onClick={() => openForm()} className="min-h-11 rounded-xl bg-emerald-300 px-4 text-sm font-bold text-slate-950 hover:bg-emerald-200">+ Add user</button></div><div className="mt-6 grid max-w-md grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">All accounts</p><p className="mt-1 text-2xl font-bold">{users.length}</p></div><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Administrators</p><p className="mt-1 text-2xl font-bold">{users.filter((user) => user.role === "admin").length}</p></div></div></section>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"><span>{error}</span><button type="button" onClick={load} className="self-start rounded-lg border border-rose-300 px-3 py-2 font-semibold sm:self-auto">Retry</button></div>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="font-bold text-slate-900">All accounts</h3><p className="mt-1 text-sm text-slate-500">{filtered.length} accounts shown</p></div><div className="flex flex-col gap-2 sm:flex-row"><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search users" placeholder="Search name or email…" className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:w-64" /><select aria-label="Filter by role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">All roles</option><option value="customer">Customers</option><option value="admin">Administrators</option></select></div></div>
      {loading ? <div className="space-y-3 p-5">{[1,2,3,4].map((n) => <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div> : filtered.length ? <>
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"><tr><th className="px-5 py-4">Account</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((user) => <tr key={user.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-xs font-bold text-emerald-300">{initials(user)}</span><div className="min-w-0"><p className="font-semibold text-slate-900">{fullName(user)}</p><p className="mt-1 break-all text-xs text-slate-500">{user.email}</p></div></div></td><td className="px-5 py-4"><select aria-label={`Role for ${user.email}`} disabled={busyId === user.id} value={user.role || "customer"} onChange={(event) => updateRole(user, event.target.value)} className={`min-h-9 rounded-lg border px-2.5 text-xs font-semibold disabled:opacity-50 ${user.role === "admin" ? "border-violet-200 bg-violet-50 text-violet-800" : "border-slate-200 bg-white text-slate-700"}`}><option value="customer">Customer</option><option value="admin">Admin</option></select></td><td className="px-5 py-4 text-sm text-slate-500">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td><td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={() => openForm(user)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Edit</button><button type="button" disabled={busyId === user.id} onClick={() => removeUser(user)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50">Delete</button></div></td></tr>)}</tbody></table></div>
        <div className="divide-y divide-slate-100 md:hidden">{filtered.map((user) => <article key={user.id} className="p-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-xs font-bold text-emerald-300">{initials(user)}</span><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{fullName(user)}</p><p className="mt-1 break-all text-xs text-slate-500">{user.email}</p><div className="mt-3 flex flex-wrap items-center gap-2"><select aria-label={`Role for ${user.email}`} disabled={busyId === user.id} value={user.role || "customer"} onChange={(event) => updateRole(user, event.target.value)} className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold"><option value="customer">Customer</option><option value="admin">Admin</option></select><span className="text-xs text-slate-400">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "Date unavailable"}</span></div><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => openForm(user)} className="min-h-9 rounded-lg border border-slate-200 text-xs font-semibold">Edit</button><button type="button" disabled={busyId === user.id} onClick={() => removeUser(user)} className="min-h-9 rounded-lg border border-rose-200 text-xs font-semibold text-rose-700 disabled:opacity-50">Delete</button></div></div></div></article>)}</div>
      </> : <div className="px-6 py-14 text-center"><p className="font-semibold text-slate-900">{search || roleFilter !== "all" ? "No matching accounts" : "No user accounts yet"}</p><p className="mt-2 text-sm text-slate-500">Change the search or filter to find an account.</p><button type="button" onClick={() => { setSearch(""); setRoleFilter("all"); }} className="mt-3 text-sm font-bold text-emerald-800">Clear filters</button></div>}
    </section>
    {modalOpen && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) closeForm(); }}><form onSubmit={saveUser} role="dialog" aria-modal="true" aria-labelledby="user-form-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Account management</p><h3 id="user-form-title" className="mt-2 text-xl font-bold text-slate-950">{editing ? "Edit account" : "Create account"}</h3></div><button type="button" onClick={closeForm} disabled={saving} aria-label="Close form" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-xl">×</button></div>{error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}<div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">First name *<input required maxLength={100} value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal" /></label><label className="text-sm font-semibold text-slate-700">Last name<input maxLength={100} value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal" /></label><label className="text-sm font-semibold text-slate-700 sm:col-span-2">Email address *<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal" /></label><label className="text-sm font-semibold text-slate-700 sm:col-span-2">Password {editing ? "(leave blank to keep current password)" : "*"}<input type="password" autoComplete="new-password" required={!editing} minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal" /></label><label className="text-sm font-semibold text-slate-700 sm:col-span-2">Account role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal"><option value="customer">Customer</option><option value="admin">Administrator</option></select><span className="mt-1 block text-xs font-normal text-slate-500">Only grant administrator access to trusted staff.</span></label></div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={saving} onClick={closeForm} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold">Cancel</button><button type="submit" disabled={saving} className="min-h-11 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50">{saving ? "Saving…" : editing ? "Save changes" : "Create account"}</button></div></form></div>}
  </div>;
}
