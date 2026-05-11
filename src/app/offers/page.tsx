import { SiteHeader } from "@/components/layout/SiteHeader";
import { OffersRail } from "@/components/home/OffersRail";
import { offers } from "@/data/offers";

export default function OffersPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-24 md:px-6 md:pb-16 md:pt-28">
        <div className="max-w-2xl">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-brand-orange">
            Offers
          </p>
          <h1 className="mt-2 font-display text-4xl uppercase tracking-[0.06em] text-ink md:text-5xl">
            Deals that hit{" "}
            <span className="text-gradient-brand">different</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-brand-brown/55">
            Stack these with your cart — we&apos;ll honour them automatically at
            checkout once payments go live.
          </p>
        </div>

        <div className="mt-12">
          <OffersRail dense />
        </div>

        <section className="mt-16 grid gap-6 md:grid-cols-2">
          {offers.map((o) => (
            <article
              key={`detail-${o.id}`}
              className="rounded-3xl border border-brand-orange/12 bg-white p-6 shadow-sm"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-orange">
                {o.badge}
              </p>
              <h2 className="mt-3 font-display text-2xl uppercase tracking-[0.08em] text-ink">
                {o.title}
              </h2>
              <p className="mt-2 text-sm text-brand-brown/55">{o.subtitle}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
