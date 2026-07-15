"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  AlertCircle,
  BarChart3,
  Check,
  Copy,
  Download,
  ExternalLink,
  Link2,
  Plus,
  QrCode,
  RefreshCw,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { useAdminStore } from "@/stores/admin-store";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type QrCampaign = {
  id: string;
  title: string;
  slug: string;
  destinationUrl: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  scanCount: number;
  latestScanAt: string | null;
};

type QrScan = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  scannedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function formatDateTime(iso: string | null) {
  if (!iso) return "No scans";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function shortUrl(url: string) {
  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://www.bhooklagi.in");
    return `${parsed.host}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return url;
  }
}

function QrPreview({ value, title }: { value: string; title: string }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: 280,
      margin: 2,
      color: { dark: "#111827", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then((url) => {
      if (active) setDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [value]);

  function download() {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${slugify(title) || "bhook-lagi-qr"}.png`;
    link.click();
  }

  return (
    <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-gray-950">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt={`${title} QR code`} className="h-44 w-44 rounded-xl" />
      ) : (
        <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-orange" />
        </div>
      )}
      <button
        type="button"
        onClick={download}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-3 py-2 text-[12px] font-black text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100"
      >
        <Download className="h-4 w-4" strokeWidth={2.5} />
        Download PNG
      </button>
    </div>
  );
}

export default function AdminQrPage() {
  const { theme, toggleTheme } = useAdminStore();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<QrCampaign[] | null>(null);
  const [scans, setScans] = useState<QrScan[]>([]);
  const [setupWarning, setSetupWarning] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("/menu");
  const [notes, setNotes] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.bhooklagi.in";
  const suggestedSlug = slug || slugify(title);
  const previewUrl = `${origin}/q/${suggestedSlug || "your-qr"}`;

  const totals = useMemo(() => {
    const totalScans = campaigns?.reduce((sum, campaign) => sum + campaign.scanCount, 0) ?? 0;
    const activeCampaigns = campaigns?.filter((campaign) => campaign.isActive).length ?? 0;
    const mobileScans = scans.filter((scan) => scan.deviceType === "mobile").length;
    return { totalScans, activeCampaigns, mobileScans };
  }, [campaigns, scans]);

  async function load() {
    setError("");
    const res = await fetch("/api/admin/qr");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const payload = await res.json();
    if (!res.ok) {
      setError(payload?.error || "Could not load QR campaigns.");
      return;
    }
    setCampaigns(payload.campaigns ?? []);
    setScans(payload.scans ?? []);
    setSetupWarning(payload.setupWarning ?? null);
  }

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: suggestedSlug,
          destinationUrl,
          notes,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Could not create QR campaign.");
      setCampaigns((prev) => prev ? [payload.campaign, ...prev] : [payload.campaign]);
      setTitle("");
      setSlug("");
      setDestinationUrl("/menu");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create QR campaign.");
    } finally {
      setCreating(false);
    }
  }

  async function copy(value: string, id: string) {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1600);
  }

  async function toggleCampaign(campaign: QrCampaign) {
    setBusyId(campaign.id);
    const res = await fetch("/api/admin/qr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: campaign.id, isActive: !campaign.isActive }),
    });
    if (res.ok) {
      setCampaigns((prev) => prev ? prev.map((item) => item.id === campaign.id ? { ...item, isActive: !campaign.isActive } : item) : prev);
    }
    setBusyId(null);
  }

  async function deleteCampaign(campaign: QrCampaign) {
    if (!confirm(`Delete QR "${campaign.title}" and all scan history?`)) return;
    setBusyId(campaign.id);
    const res = await fetch(`/api/admin/qr?id=${campaign.id}`, { method: "DELETE" });
    if (res.ok) {
      setCampaigns((prev) => prev ? prev.filter((item) => item.id !== campaign.id) : prev);
      setScans((prev) => prev.filter((scan) => scan.campaignId !== campaign.id));
    }
    setBusyId(null);
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-dvh bg-gray-50 pb-24 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white">
        <AdminPageHeader
          icon={<span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-white shadow-md shadow-brand-orange/25"><QrCode className="h-4 w-4" strokeWidth={2.5} /></span>}
          title="QR Tracking"
          subtitle="Generate QR codes and measure scans"
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          maxWidth="max-w-7xl"
        >
          <button
            type="button"
            onClick={load}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </AdminPageHeader>

        <main className="mx-auto max-w-7xl px-4 py-7 md:px-6">
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Total scans", value: totals.totalScans, icon: <BarChart3 className="h-5 w-5" />, tone: "text-brand-orange" },
              { label: "Active QR codes", value: totals.activeCampaigns, icon: <QrCode className="h-5 w-5" />, tone: "text-green-600 dark:text-green-300" },
              { label: "Mobile scans", value: totals.mobileScans, icon: <Smartphone className="h-5 w-5" />, tone: "text-blue-600 dark:text-blue-300" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-200/60 dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/20">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 ${stat.tone} dark:bg-white/10`}>{stat.icon}</div>
                <p className="mt-4 text-[28px] font-black leading-none text-gray-950 dark:text-white">{stat.value}</p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {setupWarning && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-bold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <AlertCircle className="h-4 w-4" />
              {setupWarning}
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-200/60 dark:border-white/10 dark:bg-gray-900 dark:shadow-black/20">
              <div className="mb-5">
                <h1 className="text-[20px] font-black text-gray-950 dark:text-white">Create QR</h1>
                <p className="mt-1 text-[13px] font-medium text-gray-500">Every scan goes through your tracking link first.</p>
              </div>

              <form onSubmit={createCampaign} className="space-y-4">
                <div>
                  <label className="mb-1 block text-[12px] font-black text-gray-700 dark:text-gray-300">QR name</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!slug) setSlug(slugify(e.target.value));
                    }}
                    placeholder="College poster campaign"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-[14px] font-bold text-gray-950 outline-none focus:border-brand-orange focus:bg-white focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-black text-gray-700 dark:text-gray-300">Tracking slug</label>
                  <div className="flex rounded-xl border border-gray-200 bg-gray-50 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20">
                    <span className="flex items-center border-r border-gray-200 px-3 text-[12px] font-bold text-gray-500 dark:border-white/10">/q/</span>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="college-poster"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[14px] font-bold text-gray-950 outline-none dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-black text-gray-700 dark:text-gray-300">Destination after scan</label>
                  <input
                    required
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="/menu or https://..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-[14px] font-bold text-gray-950 outline-none focus:border-brand-orange focus:bg-white focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-black text-gray-700 dark:text-gray-300">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Where this QR will be used..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-[14px] font-medium text-gray-950 outline-none focus:border-brand-orange focus:bg-white focus:ring-2 focus:ring-brand-orange/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  />
                </div>

                <div className="rounded-2xl bg-gray-50 p-3 dark:bg-black/20">
                  <p className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500"><Link2 className="h-3.5 w-3.5" /> Preview link</p>
                  <p className="break-all rounded-xl bg-white px-3 py-2 font-mono text-[12px] font-bold text-gray-700 dark:bg-white/5 dark:text-gray-300">{previewUrl}</p>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-3.5 text-[14px] font-black text-white shadow-md shadow-brand-orange/25 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  {creating ? "Creating..." : "Create QR Campaign"}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-200/60 dark:border-white/10 dark:bg-gray-900 dark:shadow-black/20">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[20px] font-black text-gray-950 dark:text-white">QR Campaigns</h2>
                  <p className="mt-1 text-[13px] font-medium text-gray-500">Download, share, pause, and track performance.</p>
                </div>
              </div>

              {!campaigns ? (
                <div className="flex items-center justify-center py-20 text-[14px] font-bold text-gray-500">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-brand-orange" />
                  <span className="ml-3">Loading QR data...</span>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center dark:border-white/10 dark:bg-black/20">
                  <QrCode className="h-11 w-11 text-gray-300 dark:text-gray-700" />
                  <p className="mt-4 text-[14px] font-black text-gray-900 dark:text-white">No QR campaigns yet</p>
                  <p className="mt-1 text-[12px] text-gray-500">Create your first QR to start tracking scans.</p>
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {campaigns.map((campaign) => {
                    const trackingUrl = `${origin}/q/${campaign.slug}`;
                    const isBusy = busyId === campaign.id;
                    return (
                      <article key={campaign.id} className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/20 md:grid-cols-[190px_1fr]">
                        <QrPreview value={trackingUrl} title={campaign.title} />
                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-[15px] font-black text-gray-950 dark:text-white">{campaign.title}</h3>
                              <p className="mt-1 truncate text-[12px] font-bold text-brand-orange">/q/{campaign.slug}</p>
                            </div>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => toggleCampaign(campaign)}
                              title={campaign.isActive ? "Pause QR" : "Activate QR"}
                              className={`shrink-0 transition-colors ${campaign.isActive ? "text-green-600 dark:text-green-300" : "text-gray-400"}`}
                            >
                              {campaign.isActive ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                            </button>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-white p-3 dark:bg-white/5">
                              <p className="text-[19px] font-black text-gray-950 dark:text-white">{campaign.scanCount}</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Scans</p>
                            </div>
                            <div className="rounded-xl bg-white p-3 dark:bg-white/5">
                              <p className="truncate text-[11px] font-black text-gray-950 dark:text-white">{formatDateTime(campaign.latestScanAt)}</p>
                              <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-gray-500">Latest scan</p>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <p className="truncate rounded-xl bg-white px-3 py-2 text-[12px] font-bold text-gray-600 dark:bg-white/5 dark:text-gray-300">{shortUrl(campaign.destinationUrl)}</p>
                            {campaign.notes && <p className="line-clamp-2 text-[12px] text-gray-500">{campaign.notes}</p>}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => copy(trackingUrl, campaign.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-black text-gray-700 transition-colors hover:text-gray-950 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-white"
                            >
                              {copied === campaign.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                              {copied === campaign.id ? "Copied" : "Copy link"}
                            </button>
                            <a
                              href={trackingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-black text-gray-700 transition-colors hover:text-gray-950 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-white"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Open
                            </a>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => deleteCampaign(campaign)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-black text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <section className="mt-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-200/60 dark:border-white/10 dark:bg-gray-900 dark:shadow-black/20">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-black text-gray-950 dark:text-white">Recent Scans</h2>
                <p className="mt-1 text-[12px] font-medium text-gray-500">Shows device, browser, referrer, IP, and scan time.</p>
              </div>
            </div>

            {scans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center dark:border-white/10 dark:bg-black/20">
                <p className="text-[13px] font-black text-gray-500">No scans yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-[12px]">
                  <thead className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <tr className="border-b border-gray-200 dark:border-white/10">
                      <th className="px-3 py-3">QR</th>
                      <th className="px-3 py-3">When</th>
                      <th className="px-3 py-3">Device</th>
                      <th className="px-3 py-3">Browser / OS</th>
                      <th className="px-3 py-3">Referrer</th>
                      <th className="px-3 py-3">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {scans.map((scan) => (
                      <tr key={scan.id} className="align-top">
                        <td className="px-3 py-3 font-black text-gray-900 dark:text-white">{scan.campaignTitle}</td>
                        <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{formatDateTime(scan.scannedAt)}</td>
                        <td className="px-3 py-3 capitalize text-gray-600 dark:text-gray-400">{scan.deviceType ?? "Unknown"}</td>
                        <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{scan.browser ?? "Unknown"} / {scan.os ?? "Unknown"}</td>
                        <td className="max-w-[260px] truncate px-3 py-3 text-gray-600 dark:text-gray-400">{scan.referrer || "Direct scan"}</td>
                        <td className="px-3 py-3 font-mono text-gray-500">{scan.ipAddress || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
