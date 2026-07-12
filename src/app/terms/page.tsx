import type { Metadata } from "next";
import { PolicyLayout } from "@/components/legal/PolicyLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions governing use of the Bhook Lagi? platform and food ordering service.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      lastUpdated="12 May 2026"
      sections={[
        {
          heading: "Acceptance of Terms",
          body: (
            <p>
              By accessing or using the Bhook Lagi? website (www.bhooklagi.in) or placing an order
              through our platform, you agree to be bound by these Terms and Conditions. If you do
              not agree, please refrain from using our services. These terms apply to all users,
              including browsers, customers, and any person accessing the platform.
            </p>
          ),
        },
        {
          heading: "About Bhook Lagi?",
          body: (
            <p>
              Bhook Lagi? is a cloud kitchen based in Deoghar, Jharkhand, India. We prepare and
              deliver food orders within the Deoghar delivery area. We are not a restaurant
              aggregator — all food listed on our platform is prepared by us in our own kitchen.
            </p>
          ),
        },
        {
          heading: "Placing an Order",
          body: (
            <>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>
                  You must provide accurate delivery information including your name, mobile number,
                  and full address. Orders placed with incorrect or incomplete information may not
                  be fulfilled.
                </li>
                <li>
                  By placing an order, you confirm that you are placing a genuine purchase request
                  and agree to pay the total amount shown at checkout.
                </li>
                <li>
                  We reserve the right to refuse or cancel any order at our discretion, including
                  orders placed outside our delivery area, orders during non-operational hours, or
                  orders that appear fraudulent.
                </li>
                <li>
                  Order confirmation is subject to the availability of items. In the rare case an
                  item is unavailable after you place your order, we will contact you via the
                  mobile number provided.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Pricing & Payment",
          body: (
            <>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>
                  All prices listed on our platform are in Indian Rupees (INR) and are inclusive of
                  applicable taxes unless stated otherwise.
                </li>
                <li>
                  A delivery charge of ₹49 applies on orders below ₹299. Delivery is free for
                  orders of ₹299 and above.
                </li>
                <li>
                  We accept Cash on Delivery (COD) and online payments via Razorpay (UPI, debit
                  card, credit card, netbanking). Payment must be made in full before or upon
                  delivery as applicable.
                </li>
                <li>
                  We reserve the right to change prices at any time without prior notice. The price
                  at the time of placing your order will be honoured.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Delivery",
          body: (
            <p>
              We deliver within the Deoghar, Jharkhand area only. Estimated delivery times are
              30–45 minutes from the time your order is confirmed. Actual delivery time may vary
              due to traffic, weather, or high order volume. Please refer to our{" "}
              <a href="/delivery-policy" className="font-semibold text-brand-orange hover:underline">
                Delivery Policy
              </a>{" "}
              for full details.
            </p>
          ),
        },
        {
          heading: "Food Quality & Allergens",
          body: (
            <>
              <p>
                We take food safety and hygiene seriously and operate from a clean, inspected
                kitchen. However:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
                <li>
                  Our kitchen handles ingredients including gluten, dairy, eggs, nuts, and soy.
                  Cross-contamination is possible.
                </li>
                <li>
                  Customers with food allergies or dietary restrictions must inform us before
                  placing an order by contacting us via WhatsApp or the contact form. We will do
                  our best to accommodate requests but cannot guarantee allergen-free preparation.
                </li>
                <li>
                  Bhook Lagi? is not liable for any allergic reactions resulting from consumption
                  of our food unless the customer has specifically disclosed their allergy prior to
                  ordering and we have confirmed accommodation.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Cancellation & Refunds",
          body: (
            <p>
              Our cancellation and refund policy is detailed in the{" "}
              <a href="/refund-policy" className="font-semibold text-brand-orange hover:underline">
                Refund & Cancellation Policy
              </a>{" "}
              page. Please review it before placing an order.
            </p>
          ),
        },
        {
          heading: "Intellectual Property",
          body: (
            <p>
              All content on www.bhooklagi.in — including the brand name &quot;Bhook Lagi?&quot;,
              logo, taglines, design, images, and text — is the intellectual property of Bhook
              Lagi?. You may not reproduce, distribute, or use any content from this website
              without our prior written consent.
            </p>
          ),
        },
        {
          heading: "Limitation of Liability",
          body: (
            <>
              <p>
                To the maximum extent permitted by applicable law, Bhook Lagi? shall not be liable
                for:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
                <li>
                  Any indirect, incidental, or consequential loss arising from the use of our
                  services.
                </li>
                <li>
                  Delays caused by circumstances beyond our reasonable control (force majeure,
                  natural events, government orders, etc.).
                </li>
                <li>
                  Any health issues arising from consumption of our food, provided the food was
                  prepared in accordance with standard food safety practices.
                </li>
              </ul>
              <p className="mt-2">
                Our total liability in connection with any order shall not exceed the value of that
                specific order.
              </p>
            </>
          ),
        },
        {
          heading: "Governing Law",
          body: (
            <p>
              These Terms and Conditions are governed by the laws of India. Any disputes arising out
              of or in connection with these terms shall be subject to the exclusive jurisdiction of
              the courts of Deoghar, Jharkhand.
            </p>
          ),
        },
        {
          heading: "Changes to Terms",
          body: (
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Changes will
              be effective immediately upon posting to this page. Continued use of the platform
              after any modifications constitutes acceptance of the updated terms.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              For any questions about these terms, please contact us via our{" "}
              <a href="/contact" className="font-semibold text-brand-orange hover:underline">
                Contact page
              </a>{" "}
              or email{" "}
              <a
                href="mailto:orders@bhooklagi.in"
                className="font-semibold text-brand-orange hover:underline"
              >
                orders@bhooklagi.in
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
