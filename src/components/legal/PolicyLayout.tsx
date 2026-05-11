import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

type Section = {
  heading: string;
  body: React.ReactNode;
};

export function PolicyLayout({
  title,
  lastUpdated,
  sections,
}: {
  title: string;
  lastUpdated: string;
  sections: Section[];
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-24 md:px-6 md:pt-28">
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <p className="mb-1 text-[12px] font-bold uppercase tracking-widest text-brand-orange">
            Legal
          </p>
          <h1 className="text-[28px] font-extrabold text-gray-900 md:text-[32px]">{title}</h1>
          <p className="mt-2 text-[13px] text-gray-500">Last updated: {lastUpdated}</p>
          <p className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-[13px] text-gray-600">
            This policy applies to orders placed through{" "}
            <span className="font-semibold text-gray-800">www.bhooklagi.in</span> and all services
            operated by <span className="font-semibold text-gray-800">Bhook Lagi?</span>, a cloud
            kitchen based in Deoghar, Jharkhand.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="mb-3 text-[17px] font-bold text-gray-900">
                {i + 1}. {s.heading}
              </h2>
              <div className="space-y-2 text-[14px] leading-relaxed text-gray-600">{s.body}</div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 rounded-2xl border border-brand-orange/20 bg-brand-orange/[0.04] p-5">
          <p className="text-[13px] text-gray-700">
            For any questions regarding this policy, please contact us at{" "}
            <a
              href="mailto:orders@bhooklagi.in"
              className="font-semibold text-brand-orange hover:underline"
            >
              orders@bhooklagi.in
            </a>{" "}
            or visit our{" "}
            <a href="/contact" className="font-semibold text-brand-orange hover:underline">
              Contact page
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
