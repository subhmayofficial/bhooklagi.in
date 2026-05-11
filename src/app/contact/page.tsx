import type { Metadata } from "next";
import { Mail, Phone, MapPin, Instagram, Clock, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Bhook Lagi? for orders, refunds, or any query. Based in Deoghar, Jharkhand.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-24 md:px-6 md:pt-28">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-1 text-[12px] font-bold uppercase tracking-widest text-brand-orange">
            Get in touch
          </p>
          <h1 className="text-[28px] font-extrabold text-gray-900 md:text-[32px]">Contact Us</h1>
          <p className="mt-2 text-[14px] text-gray-500">
            Questions, feedback, refund requests, or just want to say hi — we&apos;re here.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Left: contact info */}
          <div className="space-y-4">

            {/* WhatsApp — primary */}
            <a
              href="https://wa.me/919296834048"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-2xl border-2 border-green-100 bg-green-50 p-5 transition-all hover:border-green-300 hover:shadow-sm"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-green-500 text-white text-xl shadow-sm">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-green-700">
                  WhatsApp (Fastest)
                </p>
                <p className="mt-0.5 text-[15px] font-bold text-gray-900">+91 92968 34048</p>
                <p className="mt-0.5 text-[12px] text-gray-500">
                  For order queries, cancellations &amp; refunds
                </p>
                <span className="mt-2 inline-block rounded-full bg-green-500 px-3 py-1 text-[11px] font-bold text-white">
                  Chat on WhatsApp →
                </span>
              </div>
            </a>

            {/* Phone */}
            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Phone</p>
                <p className="mt-0.5 text-[15px] font-bold text-gray-900">+91 92968 34048</p>
                <p className="mt-0.5 text-[12px] text-gray-500">Mon–Sun · 11 AM – 11 PM</p>
              </div>
            </div>

            {/* Email */}
            <a
              href="mailto:orders@bhooklagi.in"
              className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-brand-orange/30"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Email</p>
                <p className="mt-0.5 text-[15px] font-bold text-gray-900">orders@bhooklagi.in</p>
                <p className="mt-0.5 text-[12px] text-gray-500">
                  For refunds, complaints & business inquiries
                </p>
              </div>
            </a>

            {/* Location */}
            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Address</p>
                <p className="mt-0.5 text-[15px] font-bold text-gray-900">Bhook Lagi?</p>
                <p className="mt-0.5 text-[13px] text-gray-600 leading-relaxed">
                  Kunda, Shanti Nagar<br />
                  Deoghar, Jharkhand – 814112<br />
                  India
                </p>
                <p className="mt-1 text-[11px] text-gray-400">Cloud kitchen · No dine-in</p>
              </div>
            </div>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/bhooklagi.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-pink-200"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                <Instagram className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Instagram</p>
                <p className="mt-0.5 text-[15px] font-bold text-gray-900">@bhooklagi.in</p>
                <p className="mt-0.5 text-[12px] text-gray-500">Sneak peeks, offers & updates</p>
              </div>
            </a>
          </div>

          {/* Right: hours + quick links */}
          <div className="space-y-4">

            {/* Hours */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-orange" />
                <h2 className="text-[15px] font-bold text-gray-900">Operational Hours</h2>
              </div>
              <div className="space-y-2">
                {[
                  { day: "Monday",    hours: "11:00 AM – 11:00 PM" },
                  { day: "Tuesday",   hours: "11:00 AM – 11:00 PM" },
                  { day: "Wednesday", hours: "11:00 AM – 11:00 PM" },
                  { day: "Thursday",  hours: "11:00 AM – 11:00 PM" },
                  { day: "Friday",    hours: "11:00 AM – 11:00 PM" },
                  { day: "Saturday",  hours: "11:00 AM – 11:00 PM" },
                  { day: "Sunday",    hours: "11:00 AM – 11:00 PM" },
                ].map(({ day, hours }) => (
                  <div key={day} className="flex justify-between text-[13px]">
                    <span className="text-gray-600">{day}</span>
                    <span className="font-semibold text-gray-900">{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Response time note */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-[13px] font-semibold text-amber-800">
                ⏱ Response times
              </p>
              <ul className="mt-2 space-y-1 text-[12px] text-amber-700">
                <li>WhatsApp: Usually within 30 minutes (during operational hours)</li>
                <li>Email: Within 2 business days</li>
                <li>Refund queries: Within 2 business days</li>
              </ul>
            </div>

            {/* Legal links */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-gray-400">
                Legal & Policies
              </h2>
              <ul className="space-y-2 text-[13px]">
                {[
                  { href: "/privacy-policy",   label: "Privacy Policy" },
                  { href: "/terms",            label: "Terms & Conditions" },
                  { href: "/refund-policy",    label: "Refund & Cancellation Policy" },
                  { href: "/delivery-policy",  label: "Delivery Policy" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="font-medium text-brand-orange hover:underline"
                    >
                      {label} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
