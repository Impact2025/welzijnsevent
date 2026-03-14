"use client";

import { useState } from "react";
import { Pencil, X, Check, Loader2, User, Mail, Building2, Briefcase, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  email: string;
  name: string;
  organization: string | null;
  role: string | null;
  phone: string | null;
}

export function ContactInfoEditor({ email, name, organization, role, phone }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({ name, organization: organization ?? "", role: role ?? "", phone: phone ?? "" });
  const router = useRouter();

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/crm/contacts/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overrideName: values.name || null,
          overrideOrganization: values.organization || null,
          overrideRole: values.role || null,
          phone: values.phone || null,
        }),
      });
      router.refresh();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="mt-4 space-y-1.5 group/info">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Mail size={13} className="shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-terra-500 transition-colors font-medium">{email}</a>
            </div>
            {organization && (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Building2 size={13} className="shrink-0" />
                <span className="font-medium">{organization}</span>
              </div>
            )}
            {role && (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Briefcase size={13} className="shrink-0" />
                <span className="font-medium">{role}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Phone size={13} className="shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-terra-500 transition-colors font-medium">{phone}</a>
              </div>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover/info:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-sand text-ink-muted hover:text-ink"
            title="Contactgegevens bewerken"
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2 rounded-xl border border-sand bg-cream/60 p-4">
      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-3">Contactgegevens bewerken</p>

      {[
        { key: "name" as const, label: "Naam", icon: User, placeholder: "Volledige naam" },
        { key: "organization" as const, label: "Organisatie", icon: Building2, placeholder: "Organisatienaam" },
        { key: "role" as const, label: "Functie", icon: Briefcase, placeholder: "Functietitel" },
        { key: "phone" as const, label: "Telefoon", icon: Phone, placeholder: "+31 6 00000000" },
      ].map(({ key, label, icon: Icon, placeholder }) => (
        <div key={key} className="flex items-center gap-2">
          <Icon size={13} className="shrink-0 text-ink-muted" />
          <input
            value={values[key]}
            onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
            placeholder={placeholder}
            className="flex-1 text-sm bg-white border border-sand rounded-lg px-3 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-500 placeholder:text-ink-muted/40"
          />
        </div>
      ))}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={() => { setEditing(false); setValues({ name, organization: organization ?? "", role: role ?? "", phone: phone ?? "" }); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-ink-muted hover:bg-sand transition-colors"
        >
          <X size={12} />
          Annuleren
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-terra-500 text-white hover:bg-terra-600 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Opslaan
        </button>
      </div>
    </div>
  );
}
