import { LegalLayout, H2, P, Ul, Muted } from './LegalLayout'

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund & Cancellation Policy" effectiveDate="[EFFECTIVE DATE]">
      <Muted>
        Draft for legal review, consistent with Egyptian consumer-protection principles
        (including Consumer Protection Law No. 181 of 2018). An Arabic version will be
        issued and, for Egyptian users, the Arabic text prevails.
      </Muted>

      <P>
        <strong>Provider:</strong> [COMPANY LEGAL NAME], [REGISTERED ADDRESS], Egypt.
        <br />
        <strong>Contact:</strong> WhatsApp +20 106 027 0197 · [SUPPORT EMAIL]
      </P>

      <H2>1. How payment works for prints</H2>
      <P>For physical print orders you pay, at checkout via our online processor:</P>
      <Ul>
        <li>50% of the product price (deposit), plus 100% of the delivery fee.</li>
      </Ul>
      <P>
        The remaining 50% of the product price is collected as cash on delivery by the
        courier. Digital subscriptions are billed separately by Apple/Google.
      </P>

      <H2>2. Cancellation</H2>
      <Ul>
        <li>
          An order may be cancelled free of charge, with the deposit refunded in full to the
          original payment method, provided it has not entered production.
        </li>
        <li>
          The cancellation window closes automatically 60 minutes after deposit payment, or
          immediately when the order status changes to "In Production", whichever is first.
        </li>
        <li>
          Within the same window you may edit the delivery address, size and finish via
          Order History → the order → Edit.
        </li>
        <li>
          Once production has begun, the order can no longer be cancelled or modified,
          because materials and labour have been committed by our print partner.
        </li>
        <li>
          Approved refunds are processed within 5–7 business days, subject to the payment
          processor's settlement timelines.
        </li>
      </Ul>

      <H2>3. Refunds and reprints</H2>
      <Ul>
        <li>
          A print that arrives defective, damaged in transit, or materially incorrect (wrong
          size or wrong photo) is eligible for a free reprint or a full refund, at your
          choice, if reported within 7 days of delivery with photo evidence.
        </li>
        <li>
          AI-generation failures never consume a credit and are retried automatically at no
          charge — this is not a refund case, as nothing was charged for the failed attempt.
        </li>
        <li>
          The deposit is non-refundable where you refuse delivery or cannot be reached by
          the courier after two delivery attempts, reflecting production and delivery costs
          already committed. This is disclosed at checkout before you pay.
        </li>
        <li>
          Dissatisfaction with a creative result that matches its on-screen preview is not,
          by itself, grounds for a refund once printed — the preview and 3-variant selection
          exist so this is decided digitally, before any print cost.
        </li>
      </Ul>

      <H2>4. Subscriptions</H2>
      <P>
        Subscription payments are governed by Apple's and Google's own refund policies, as
        they are billed through their in-app purchase systems. Manage or request
        subscription refunds through your App Store / Google Play account.
      </P>

      <H2>5. Mandatory rights</H2>
      <P>
        Nothing in this policy limits any non-waivable rights you have under Egyptian
        consumer-protection law.
      </P>

      <H2>6. How to request</H2>
      <P>
        Contact <strong>WhatsApp +20 106 027 0197</strong> or [SUPPORT EMAIL] with your order
        number and, for damage/defect claims, clear photos. Target first response: within 24
        hours.
      </P>
    </LegalLayout>
  )
}
