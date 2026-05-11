import type { Metadata } from "next";
import { PolicyLayout } from "@/components/legal/PolicyLayout";

export const metadata: Metadata = {
  title: "Delivery Policy",
  description: "Bhook Lagi? delivery area, charges, timelines, and delivery terms for Deoghar.",
};

export default function DeliveryPolicyPage() {
  return (
    <PolicyLayout
      title="Delivery Policy"
      lastUpdated="12 May 2026"
      sections={[
        {
          heading: "Delivery Area",
          body: (
            <>
              <p>
                Bhook Lagi? currently delivers within <strong>Deoghar, Jharkhand</strong> only. We
                do not deliver to areas outside Deoghar at this time.
              </p>
              <p className="mt-2">
                If your address falls outside our serviceable area, you will be notified during
                checkout before payment is collected. Orders placed with an out-of-area address will
                be cancelled and any payment collected will be fully refunded.
              </p>
            </>
          ),
        },
        {
          heading: "Delivery Charges",
          body: (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="border-b border-gray-200 px-4 py-2.5 font-bold text-gray-700">
                        Order Value
                      </th>
                      <th className="border-b border-gray-200 px-4 py-2.5 font-bold text-gray-700">
                        Delivery Charge
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-b border-gray-100 px-4 py-2.5 text-gray-600">
                        Below ₹299
                      </td>
                      <td className="border-b border-gray-100 px-4 py-2.5 font-semibold text-gray-900">
                        ₹49
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-gray-600">₹299 and above</td>
                      <td className="px-4 py-2.5 font-bold text-green-600">FREE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[13px] text-gray-500">
                Delivery charges are shown clearly at checkout before you confirm your order.
              </p>
            </>
          ),
        },
        {
          heading: "Estimated Delivery Time",
          body: (
            <>
              <p>
                Our standard estimated delivery time is <strong>30 to 45 minutes</strong> from the
                time your order is confirmed by our kitchen.
              </p>
              <p className="mt-2">
                Actual delivery times may vary due to:
              </p>
              <ul className="mt-1 list-inside list-disc space-y-1 pl-2">
                <li>High order volumes during peak hours (lunch: 12–2 PM, dinner: 7–10 PM).</li>
                <li>Traffic conditions or road closures in Deoghar.</li>
                <li>Adverse weather conditions.</li>
                <li>Complexity of your order (larger orders may take slightly longer to prepare).</li>
              </ul>
              <p className="mt-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-[13px] text-blue-700">
                ℹ️ If your order is significantly delayed, our delivery rider will contact you on
                the mobile number provided at checkout.
              </p>
            </>
          ),
        },
        {
          heading: "Delivery Process",
          body: (
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>
                Once your order is confirmed, it goes into preparation in our kitchen. You will
                receive a confirmation on the mobile number provided.
              </li>
              <li>
                Our delivery rider will be assigned once your food is ready and packaged.
              </li>
              <li>
                The rider will contact you via the mobile number you provided when they are nearby.
              </li>
              <li>
                Please ensure you or someone you authorise is available at the delivery address to
                receive the order.
              </li>
            </ul>
          ),
        },
        {
          heading: "Failed Delivery",
          body: (
            <>
              <p>A delivery is considered &quot;failed&quot; if:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
                <li>
                  The delivery address provided is incorrect, incomplete, or inaccessible.
                </li>
                <li>
                  The customer is unreachable by phone and is not present at the address after two
                  contact attempts.
                </li>
                <li>
                  The customer refuses delivery without a valid reason (e.g., tampered packaging,
                  wrong items — which should be raised immediately).
                </li>
              </ul>
              <p className="mt-2">
                In case of a failed delivery due to customer unavailability or incorrect address,
                the order will be marked as delivered and <strong>no refund will be issued</strong>.
                Please double-check your address and ensure you are available before placing your
                order.
              </p>
            </>
          ),
        },
        {
          heading: "Packaging",
          body: (
            <p>
              All orders are packed in clean, tamper-evident packaging to ensure food quality and
              hygiene during transit. If you receive an order with damaged, opened, or tampered
              packaging, please do not consume the food and contact us immediately with a photo for
              a full refund or replacement.
            </p>
          ),
        },
        {
          heading: "Order Tracking",
          body: (
            <p>
              Real-time order tracking is not available currently. You will receive order status
              updates via WhatsApp or call from our team. We are working on adding live tracking in
              a future update.
            </p>
          ),
        },
        {
          heading: "Operational Hours",
          body: (
            <>
              <p>
                We currently operate during the following hours in Deoghar:
              </p>
              <div className="mt-2 overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="border-b border-gray-200 px-4 py-2.5 font-bold text-gray-700">
                        Days
                      </th>
                      <th className="border-b border-gray-200 px-4 py-2.5 font-bold text-gray-700">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-b border-gray-100 px-4 py-2.5 text-gray-600">
                        Monday – Sunday
                      </td>
                      <td className="border-b border-gray-100 px-4 py-2.5 font-semibold text-gray-900">
                        11:00 AM – 11:00 PM
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[13px] text-gray-500">
                Orders placed outside operational hours will be processed on the next available
                working window. Hours may vary on public holidays — check our Instagram for updates.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
