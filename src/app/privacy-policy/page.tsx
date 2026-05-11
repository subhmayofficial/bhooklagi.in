import type { Metadata } from "next";
import { PolicyLayout } from "@/components/legal/PolicyLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Bhook Lagi? collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      lastUpdated="12 May 2026"
      sections={[
        {
          heading: "Information We Collect",
          body: (
            <>
              <p>
                When you place an order or interact with our platform, we collect the following
                personal information:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
                <li>
                  <strong>Contact details:</strong> Full name and mobile number provided at
                  checkout.
                </li>
                <li>
                  <strong>Delivery address:</strong> Street address, area, and any landmark you
                  provide.
                </li>
                <li>
                  <strong>Order data:</strong> Items ordered, order value, timestamps, and order ID.
                </li>
                <li>
                  <strong>Payment information:</strong> For online payments processed via Razorpay,
                  we do not store any card or UPI credentials. Razorpay&apos;s own privacy policy
                  governs payment data.
                </li>
                <li>
                  <strong>Usage data:</strong> Browser type, pages visited, and session data
                  collected through cookies and Google Analytics / Google Tag Manager.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "How We Use Your Information",
          body: (
            <ul className="list-inside list-disc space-y-1 pl-2">
              <li>To process and deliver your food orders.</li>
              <li>
                To contact you via the mobile number you provide for order updates, delivery
                coordination, or issue resolution.
              </li>
              <li>To improve our menu, pricing, and service quality.</li>
              <li>
                To send promotional offers or launch announcements — only if you have opted in via
                WhatsApp or other channels.
              </li>
              <li>To comply with applicable laws and prevent fraud.</li>
            </ul>
          ),
        },
        {
          heading: "Data Sharing",
          body: (
            <>
              <p>We do not sell, rent, or trade your personal information to third parties.</p>
              <p className="mt-2">
                We may share your information with:
              </p>
              <ul className="mt-1 list-inside list-disc space-y-1 pl-2">
                <li>
                  <strong>Delivery partners:</strong> Your name, phone number, and delivery address
                  are shared with our delivery riders solely for fulfilling your order.
                </li>
                <li>
                  <strong>Payment processors:</strong> Razorpay processes online payment
                  transactions. We share only the order amount and order ID with them.
                </li>
                <li>
                  <strong>Legal authorities:</strong> When required by law, court order, or
                  government regulation.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Cookies & Analytics",
          body: (
            <>
              <p>
                Our website uses cookies and similar technologies to improve your browsing
                experience. We use:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
                <li>
                  <strong>Essential cookies:</strong> Required for the cart and checkout to
                  function correctly.
                </li>
                <li>
                  <strong>Analytics cookies:</strong> Google Tag Manager and Google Analytics to
                  understand how visitors use our site. These do not identify you personally.
                </li>
              </ul>
              <p className="mt-2">
                You can disable cookies in your browser settings; however, this may affect the
                functionality of the checkout process.
              </p>
            </>
          ),
        },
        {
          heading: "Data Retention",
          body: (
            <p>
              We retain your order data for a period of 3 years for accounting, legal compliance, and
              customer support purposes. You may request deletion of your personal data by emailing
              us at{" "}
              <a
                href="mailto:orders@bhooklagi.in"
                className="font-semibold text-brand-orange hover:underline"
              >
                orders@bhooklagi.in
              </a>
              . We will process deletion requests within 30 days, subject to any legal retention
              obligations.
            </p>
          ),
        },
        {
          heading: "Data Security",
          body: (
            <p>
              We implement appropriate technical and organisational measures to protect your personal
              information against unauthorised access, loss, or misuse. Our website is served over
              HTTPS. Online payments are handled entirely by Razorpay, which is PCI-DSS compliant.
              We do not store any payment card details on our servers.
            </p>
          ),
        },
        {
          heading: "Children's Privacy",
          body: (
            <p>
              Our services are not directed to individuals under 13 years of age. We do not
              knowingly collect personal information from children. If you believe a child has
              provided us with personal information, please contact us and we will delete it
              promptly.
            </p>
          ),
        },
        {
          heading: "Your Rights",
          body: (
            <>
              <p>You have the right to:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your data (subject to legal retention requirements).</li>
                <li>Opt out of marketing communications at any time.</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, contact us at{" "}
                <a
                  href="mailto:orders@bhooklagi.in"
                  className="font-semibold text-brand-orange hover:underline"
                >
                  orders@bhooklagi.in
                </a>
                .
              </p>
            </>
          ),
        },
        {
          heading: "Changes to This Policy",
          body: (
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on
              this page with an updated &quot;Last updated&quot; date. Continued use of our services
              after changes constitutes your acceptance of the revised policy.
            </p>
          ),
        },
      ]}
    />
  );
}
