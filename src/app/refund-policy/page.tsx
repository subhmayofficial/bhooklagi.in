import type { Metadata } from "next";
import { PolicyLayout } from "@/components/legal/PolicyLayout";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Bhook Lagi? refund and cancellation policy for food orders placed online.",
  alternates: {
    canonical: "/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      title="Refund & Cancellation Policy"
      lastUpdated="12 May 2026"
      sections={[
        {
          heading: "Overview",
          body: (
            <p>
              At Bhook Lagi?, we want every order to be a great experience. If something goes wrong,
              we will make it right. This policy explains when and how you can cancel an order and
              what you are eligible to receive as a refund.
            </p>
          ),
        },
        {
          heading: "Order Cancellation",
          body: (
            <>
              <p className="font-semibold text-gray-800">You can cancel your order in the following scenarios:</p>
              <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
                <li>
                  <strong>Within 5 minutes of placing the order:</strong> You may cancel your order
                  for any reason by contacting us immediately via WhatsApp or the number provided in
                  your confirmation. A full refund will be issued.
                </li>
                <li>
                  <strong>After 5 minutes:</strong> Once our kitchen has begun preparing your order,
                  cancellation is not possible. This is because food preparation starts immediately
                  after order confirmation to ensure freshness and timely delivery.
                </li>
                <li>
                  <strong>Non-delivery:</strong> If your order is not delivered within 90 minutes of
                  placing it (under normal circumstances), you are entitled to a full refund.
                </li>
              </ul>
              <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-[13px] font-medium text-amber-800">
                ⚠️ To cancel within the 5-minute window, please contact us immediately via
                WhatsApp at the number listed on the Contact page.
              </p>
            </>
          ),
        },
        {
          heading: "Eligible Refund Scenarios",
          body: (
            <>
              <p>You are eligible for a full or partial refund in the following cases:</p>
              <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
                <li>
                  <strong>Order not delivered:</strong> Your food was not delivered and we are
                  unable to reattempt delivery within a reasonable time. Full refund.
                </li>
                <li>
                  <strong>Wrong items delivered:</strong> You received items that do not match your
                  order. Full refund or replacement at our discretion.
                </li>
                <li>
                  <strong>Significantly substandard food quality:</strong> The food delivered is
                  unfit for consumption (e.g., foreign objects, spoiled food). Full refund after
                  verification. We may request a photo as evidence.
                </li>
                <li>
                  <strong>Duplicate payment:</strong> You were charged more than once for the same
                  order due to a payment gateway error. Full refund of the excess amount.
                </li>
                <li>
                  <strong>Order cancelled by us:</strong> If we cancel your order for any reason
                  (e.g., item unavailability, delivery area issue), you will receive a full refund.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Non-Refundable Scenarios",
          body: (
            <>
              <p>Refunds will <strong>not</strong> be provided in the following cases:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
                <li>
                  Order cancelled after 5 minutes of placement (kitchen preparation has begun).
                </li>
                <li>
                  Customer provided an incorrect or incomplete delivery address and the order could
                  not be delivered.
                </li>
                <li>
                  Customer was unavailable to receive the delivery after multiple contact attempts.
                </li>
                <li>
                  Minor variations in food appearance or portion size from what is depicted online,
                  as food may look different from photography.
                </li>
                <li>
                  Complaints about spice level or taste preferences where the item was described
                  correctly on the menu.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "How to Request a Refund",
          body: (
            <>
              <p>To initiate a refund request:</p>
              <ol className="mt-2 list-inside list-decimal space-y-2 pl-2">
                <li>
                  Contact us via WhatsApp or email within{" "}
                  <strong>24 hours of receiving your order</strong> (or within 24 hours of the
                  expected delivery time if the order was not received).
                </li>
                <li>
                  Provide your Order ID, the issue you experienced, and — where applicable — a
                  photograph of the food.
                </li>
                <li>
                  Our team will review your request and respond within <strong>2 business days</strong>.
                </li>
              </ol>
              <p className="mt-3">
                Contact us at:{" "}
                <a
                  href="mailto:orders@bhooklagi.in"
                  className="font-semibold text-brand-orange hover:underline"
                >
                  orders@bhooklagi.in
                </a>{" "}
                or via the{" "}
                <a href="/contact" className="font-semibold text-brand-orange hover:underline">
                  Contact page
                </a>
                .
              </p>
            </>
          ),
        },
        {
          heading: "Refund Processing Timeline",
          body: (
            <>
              <ul className="list-inside list-disc space-y-2 pl-2">
                <li>
                  <strong>Online payments (Razorpay):</strong> Approved refunds will be processed
                  within <strong>5–7 business days</strong> back to the original payment method
                  (UPI, card, or netbanking). The exact time depends on your bank or payment
                  provider.
                </li>
                <li>
                  <strong>Cash on Delivery (COD):</strong> If a refund is applicable on a COD
                  order (e.g., we cancel the order), we will contact you to arrange a bank transfer
                  or credit toward your next order.
                </li>
              </ul>
              <p className="mt-3 text-[13px] text-gray-500">
                Note: Refund timelines depend on banking and payment gateway processing. Bhook Lagi?
                is not responsible for delays caused by banks or payment processors once the refund
                has been initiated from our end.
              </p>
            </>
          ),
        },
        {
          heading: "Partial Refunds",
          body: (
            <p>
              In cases where only part of an order was incorrect or missing, we may issue a partial
              refund proportionate to the affected items. This will be communicated clearly when
              processing your refund.
            </p>
          ),
        },
        {
          heading: "Disputes",
          body: (
            <p>
              If you are not satisfied with our refund decision, you may escalate the matter to{" "}
              <a
                href="mailto:orders@bhooklagi.in"
                className="font-semibold text-brand-orange hover:underline"
              >
                orders@bhooklagi.in
              </a>{" "}
              marked as &quot;Refund Dispute&quot;. We are committed to resolving all disputes fairly
              and transparently.
            </p>
          ),
        },
      ]}
    />
  );
}
