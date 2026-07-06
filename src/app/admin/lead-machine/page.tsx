'use client';
import React from "react";

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Star, StarOff, Download, ExternalLink, Mail, Phone,
  MapPin, Zap, Trash2, CheckCircle2, RefreshCw, Database, Users, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

interface SearchResultItem {
  kvkNumber: string;
  name: string;
  website?: string;
  email?: string;
  phone?: string;
  aiScore?: number;
  aiRationale?: string;
  alreadySaved?: boolean;
  sbiDescription?: string;
}

interface SavedLead {
  id: string;
  organisatie: string | null;
  naam: string | null;
  email: string;
  telefoon: string | null;
  website: string | null;
  plaats: string | null;
  aiScore: number | null;
  aiRationale: string | null;
  sbiBeschrijving: string | null;
  status: string;
  starred: boolean;
  createdAt: string;
}

// ── Score badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score?: number | null }) {
  if (score == null) return <span className="text-xs text-[#9E9890]">–</span>;
  const color = score >= 8
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : score >= 5
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {score}/10
    </span>
  );
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  nieuw: { label: 'Nieuw', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  benaderd: { label: 'Benaderd', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  klant: { label: 'Klant', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  niet_relevant: { label: 'Niet relevant', className: 'bg-white text-[#9E9890] border-black/10' },
};

const LOAD_STEPS = [
  'Organisaties zoeken via het web...',
  'Websites bezoeken voor contactgegevens...',
  'AI-score berekenen per organisatie...',
  'Resultaten sorteren op relevantie...',
];

// ── Search form ─────────────────────────────────────────────────────────────

function SearchForm({ onResults }: { onResults: (results: SearchResultItem[]) => void }) {
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState('10');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setStep((s) => (s + 1) % LOAD_STEPS.length), 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setStep(0);
    try {
      const res = await fetch('/api/admin/lead-machine/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim(), maxResults: Number(maxResults) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Onbekende fout');
      onResults(data.results ?? []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex gap-2">
        <input
          placeholder="bijv. welzijnsorganisaties Amsterdam"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleSearch()}
          className="flex-1 px-3 py-2.5 rounded-xl border border-black/10 text-sm text-[#1C1814] placeholder:text-[#9E9890] focus:outline-none focus:ring-2 focus:ring-[#C8522A]/30 focus:border-[#C8522A]"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { label: 'Welzijnsorg. Amsterdam', q: 'welzijnsorganisaties Amsterdam' },
          { label: 'Buurthuizen Utrecht', q: 'buurthuizen Utrecht' },
          { label: 'Gemeenten NH', q: 'gemeenten Noord-Holland welzijn' },
          { label: 'Sportverenigingen', q: 'sportverenigingen Nederland' },
          { label: 'Culturele inst.', q: 'culturele instellingen evenementen' },
        ].map((p) => (
          <button
            key={p.q}
            onClick={() => { setQuery(p.q); handleSearch(p.q); }}
            disabled={loading}
            className="px-2.5 py-1 text-xs bg-[#F5F4F0] hover:bg-[#C8522A]/10 hover:text-[#C8522A] rounded-full transition-colors disabled:opacity-50 text-[#9E9890] font-medium"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-[#6B5E54]">Aantal:</label>
        <select
          value={maxResults}
          onChange={(e) => setMaxResults(e.target.value)}
          className="text-xs border border-black/10 rounded-lg px-2 py-1.5 text-[#1C1814] focus:outline-none focus:ring-2 focus:ring-[#C8522A]/30"
        >
          <option value="10">10 (~15s)</option>
          <option value="20">20 (~25s)</option>
          <option value="30">30 (~40s)</option>
        </select>
      </div>

      <button
        onClick={() => handleSearch()}
        disabled={loading || !query.trim()}
        className="w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-xl text-sm bg-[#C8522A] hover:bg-[#B04622] text-white disabled:opacity-50 transition-all shadow-sm"
      >
        {loading ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />{LOAD_STEPS[step]}</>
        ) : (
          <><Zap size={15} />Analyseren</>
        )}
      </button>

      {loading && (
        <p className="text-xs text-[#9E9890] text-center">
          Websites worden live bezocht — dit duurt ~15-40 seconden
        </p>
      )}
    </div>
  );
}

// ── Results table ───────────────────────────────────────────────────────────

function ResultsTable({ results, onSaved }: { results: SearchResultItem[]; onSaved: () => void }) {
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(
    new Set(results.filter((r) => r.alreadySaved).map((r) => r.kvkNumber)),
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  const saveLead = async (r: SearchResultItem) => {
    setSaving((s) => new Set(s).add(r.kvkNumber));
    try {
      const res = await fetch('/api/admin/lead-machine/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organisatie: r.name,
          website: r.website,
          email: r.email,
          telefoon: r.phone,
          aiScore: r.aiScore,
          aiRationale: r.aiRationale,
          sbiDescription: r.sbiDescription,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved((s) => new Set(s).add(r.kvkNumber));
      onSaved();
    } catch {
      console.error('Save failed');
    } finally {
      setSaving((s) => { const n = new Set(s); n.delete(r.kvkNumber); return n; });
    }
  };

  const saveHighScoring = async () => {
    const toSave = results.filter((r) => !saved.has(r.kvkNumber) && (r.aiScore ?? 0) >= 6);
    for (const r of toSave) await saveLead(r);
  };

  if (results.length === 0) return null;

  const withEmail = results.filter((r) => r.email).length;
  const avgScore = (results.reduce((sum, r) => sum + (r.aiScore ?? 0), 0) / results.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-[#9E9890]"><strong className="text-[#1C1814]">{results.length}</strong> gevonden</span>
        <span className="text-[#9E9890]"><strong className="text-[#1C1814]">{withEmail}</strong> met e-mail</span>
        <span className="text-[#9E9890]">Gem. score <strong className="text-[#1C1814]">{avgScore}</strong></span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={saveHighScoring}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 hover:bg-[#C8522A]/10 text-[#6B5E54] hover:text-[#C8522A] text-xs font-semibold transition-colors"
          >
            <Database size={13} />Sla score {`>`}=6 op
          </button>
          <a
            href="/api/admin/lead-machine/export"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 hover:bg-black/5 text-[#9E9890] text-xs font-semibold transition-colors"
          >
            <Download size={13} />CSV
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/6 bg-[#F5F4F0]">
              <th className="px-4 py-3 text-left text-xs font-bold text-[#9E9890] uppercase w-16">Score</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#9E9890] uppercase">Organisatie</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#9E9890] uppercase hidden lg:table-cell">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#9E9890] uppercase hidden md:table-cell w-28">Website</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-[#9E9890] uppercase w-24">Actie</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <React.Fragment key={r.kvkNumber}>
                <tr
                  className="border-b border-black/6 cursor-pointer hover:bg-[#F5F4F0] transition-colors"
                  onClick={() => setExpanded(expanded === r.kvkNumber ? null : r.kvkNumber)}
                >
                  <td className="px-4 py-3"><ScoreBadge score={r.aiScore} /></td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#1C1814] leading-tight">{r.name}</div>
                    {r.sbiDescription && (
                      <div className="text-xs text-[#9E9890] mt-0.5 line-clamp-1">{r.sbiDescription}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {r.email ? (
                      <a href={`mailto:${r.email}`} className="text-[#C8522A] hover:underline text-sm" onClick={(e) => e.stopPropagation()}>
                        {r.email}
                      </a>
                    ) : r.phone ? (
                      <a href={`tel:${r.phone}`} className="text-[#6B5E54] text-sm" onClick={(e) => e.stopPropagation()}>{r.phone}</a>
                    ) : (
                      <span className="text-[#9E9890] text-sm">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {r.website && (
                      <a
                        href={r.website.startsWith('http') ? r.website : `https://${r.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[#9E9890] hover:text-[#6B5E54] truncate max-w-[110px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={12} className="shrink-0" />
                        {r.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {saved.has(r.kvkNumber) ? (
                      <span className="text-xs text-emerald-600 flex items-center justify-end gap-1 font-medium">
                        <CheckCircle2 size={13} /> Opgeslagen
                      </span>
                    ) : (
                      <button
                        disabled={saving.has(r.kvkNumber)}
                        onClick={(e) => { e.stopPropagation(); saveLead(r); }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-black/10 hover:bg-[#C8522A] hover:text-white hover:border-[#C8522A] text-[#6B5E54] disabled:opacity-50 transition-colors"
                      >
                        {saving.has(r.kvkNumber) ? <span className="w-3 h-3 border-2 border-[#C8522A]/30 border-t-[#C8522A] rounded-full animate-spin inline-block" /> : 'Opslaan'}
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === r.kvkNumber && (
                  <tr className="bg-[#F5F4F0]">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="space-y-2 text-sm">
                        {r.aiRationale && <p className="text-[#6B5E54] italic">{r.aiRationale}</p>}
                        <div className="flex flex-wrap gap-4 text-xs text-[#9E9890]">
                          {r.email && <span className="flex items-center gap-1"><Mail size={11} />{r.email}</span>}
                          {r.phone && <span className="flex items-center gap-1"><Phone size={11} />{r.phone}</span>}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Saved leads ─────────────────────────────────────────────────────────────

function SavedLeads({ refreshKey }: { refreshKey: number }) {
  const [leads, setLeads] = useState<SavedLead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ limit: '50' });
      if (search) qs.set('search', search);
      if (statusFilter !== 'all') qs.set('status', statusFilter);
      const res = await fetch(`/api/admin/lead-machine/leads?${qs}`);
      const data = await res.json();
      setLeads(data.leads ?? []);
      setTotal(data.total ?? 0);
    } catch {
      console.error('Fetch leads failed');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads, refreshKey]);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/lead-machine/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  };

  const toggleStar = async (lead: SavedLead) => {
    await fetch('/api/admin/lead-machine/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, starred: !lead.starred }),
    });
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, starred: !l.starred } : l));
  };

  const deleteLead = async (id: string) => {
    await fetch(`/api/admin/lead-machine/leads?id=${id}`, { method: 'DELETE' });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setTotal((t) => t - 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          placeholder="Zoeken op naam, plaats of e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-black/10 text-sm text-[#1C1814] placeholder:text-[#9E9890] focus:outline-none focus:ring-2 focus:ring-[#C8522A]/30 focus:border-[#C8522A]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-black/10 rounded-xl px-3 py-2 text-[#1C1814] focus:outline-none focus:ring-2 focus:ring-[#C8522A]/30"
        >
          <option value="all">Alle statussen</option>
          <option value="nieuw">Nieuw</option>
          <option value="benaderd">Benaderd</option>
          <option value="klant">Klant</option>
          <option value="niet_relevant">Niet relevant</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="w-6 h-6 border-2 border-black/10 border-t-[#C8522A] rounded-full animate-spin" /></div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="mx-auto mb-3 text-black/15" />
          <p className="font-medium text-[#6B5E54]">Nog geen leads</p>
          <p className="text-sm text-[#9E9890] mt-1">Zoek naar organisaties via de Lead Machine en sla ze op.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => {
            const meta = STATUS_META[lead.status] ?? STATUS_META.nieuw;
            return (
              <div key={lead.id} className="bg-white border border-black/8 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-black/15 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleStar(lead)} className="text-[#9E9890] hover:text-amber-500 transition-colors">
                        {lead.starred ? <Star size={14} className="text-amber-500 fill-amber-500" /> : <StarOff size={14} />}
                      </button>
                      <h3 className="font-semibold text-[#1C1814] truncate">{lead.organisatie ?? lead.email}</h3>
                      <ScoreBadge score={lead.aiScore} />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${meta.className}`}>{meta.label}</span>
                    </div>
                    <p className="text-sm text-[#9E9890] mt-0.5">
                      {lead.email}
                      {lead.telefoon && <span> · {lead.telefoon}</span>}
                      {lead.plaats && <span> · {lead.plaats}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noopener" className="p-1.5 text-[#9E9890] hover:text-[#6B5E54]">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className="text-xs border border-black/10 rounded-lg px-2 py-1.5 text-[#1C1814] focus:outline-none focus:ring-2 focus:ring-[#C8522A]/30"
                    >
                      <option value="nieuw">Nieuw</option>
                      <option value="benaderd">Benaderd</option>
                      <option value="klant">Klant</option>
                      <option value="niet_relevant">Niet relevant</option>
                    </select>
                    <button onClick={() => deleteLead(lead.id)} className="p-1.5 text-[#9E9890] hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function LeadMachinePage() {
  const [tab, setTab] = useState<'search' | 'saved'>('search');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [savedRefreshKey, setSavedRefreshKey] = useState(0);

  return (
    <div className="px-6 py-7 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-[10px] font-black text-[#C8522A] uppercase tracking-widest mb-1">Lead Machine</p>
        <h1 className="text-2xl font-extrabold text-[#1C1814] tracking-tight">
          Prospectie & AI-scoring
        </h1>
        <p className="text-sm text-[#9E9890] mt-1">
          Vind en beoordeel welzijnsorganisaties met AI
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        <button
          onClick={() => setTab('search')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
            tab === 'search' ? 'bg-white border border-black/8 shadow-sm text-[#1C1814]' : 'text-[#9E9890] hover:text-[#6B5E54]',
          )}
        >
          <Zap size={14} className="inline mr-1.5" />
          Zoeken
        </button>
        <button
          onClick={() => setTab('saved')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
            tab === 'saved' ? 'bg-white border border-black/8 shadow-sm text-[#1C1814]' : 'text-[#9E9890] hover:text-[#6B5E54]',
          )}
        >
          <Database size={14} className="inline mr-1.5" />
          Opgeslagen
        </button>
      </div>

      {tab === 'search' ? (
        <div className="space-y-6">
          <SearchForm onResults={setSearchResults} />
          {searchResults.length > 0 && (
            <ResultsTable results={searchResults} onSaved={() => setSavedRefreshKey((k) => k + 1)} />
          )}
        </div>
      ) : (
        <SavedLeads refreshKey={savedRefreshKey} />
      )}
    </div>
  );
}
