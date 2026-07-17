import { LegalLayout, H2, P, Ul, Muted } from './LegalLayout'

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate="[EFFECTIVE DATE]">
      <Muted>
        Draft for legal review. Intended to align with Egypt's Personal Data Protection Law
        (Law No. 151 of 2020, the "PDPL") and its executive regulations, and with Apple App
        Store and Google Play requirements. An Arabic version will be issued and, for
        Egyptian users, the Arabic text prevails.
      </Muted>

      <P>
        <strong>Data controller:</strong> [COMPANY LEGAL NAME], Commercial Register
        [COMMERCIAL REGISTER NO.], [REGISTERED ADDRESS], Egypt.
        <br />
        <strong>Contact:</strong> WhatsApp +20 106 027 0197 · [SUPPORT EMAIL]
      </P>

      <H2>1. Who we are</H2>
      <P>
        Lamha ("we", "us") operates the Lamha mobile application, an AI photo studio that
        enhances, restores and styles photos and, optionally, delivers printed products.
        This policy explains what personal data we process, why, and your rights.
      </P>

      <H2>2. Data we process</H2>
      <Ul>
        <li>
          <strong>Account data:</strong> phone number (for phone/OTP sign-in), and — if you
          use social sign-in — the name and email your provider shares. Guests use an
          anonymous session until they sign up.
        </li>
        <li>Photos and content you upload, and the AI results generated from them.</li>
        <li>
          <strong>Order and delivery data:</strong> delivery address, landmark, contact
          phone, order history and status.
        </li>
        <li>
          <strong>Payment metadata:</strong> transaction identifiers and status. We never
          receive or store your full card details — card and wallet payments are handled by
          our payment processor; subscription payments are handled by Apple/Google.
        </li>
        <li>
          <strong>Device and usage data:</strong> device model, OS, app version, language,
          crash diagnostics and in-app events used to operate and improve the service.
        </li>
        <li>Support communications you send us.</li>
      </Ul>

      <H2>3. Why we process it (purposes &amp; legal basis)</H2>
      <P>
        We process data on the basis of your <strong>consent</strong> and of the{' '}
        <strong>necessity to perform the service</strong> you request, and to comply with{' '}
        <strong>legal obligations</strong>:
      </P>
      <Ul>
        <li>to create your account and let you use the app;</li>
        <li>to run the AI enhancement you ask for and show/save the result;</li>
        <li>to fulfil, deliver and support print orders;</li>
        <li>to process payments and prevent fraud;</li>
        <li>to moderate content for safety and legal compliance (see §6);</li>
        <li>to provide customer support;</li>
        <li>to understand usage and improve the product (aggregated analytics);</li>
        <li>to meet accounting, tax and other legal requirements.</li>
      </Ul>

      <H2>4. AI processing of your photos</H2>
      <Ul>
        <li>
          Your photo is processed by automated AI models to produce the result you
          requested. Processing may be performed by third-party AI providers acting as our
          processors (see §7), which may be located outside Egypt; by using the AI features
          you consent to this transfer for that purpose.
        </li>
        <li>
          We do not use your photos to train AI models, and we do not use them for
          marketing or any purpose beyond fulfilling your own request, without your
          separate, explicit opt-in consent.
        </li>
        <li>Results are labelled as AI-enhanced in the app.</li>
      </Ul>

      <H2>5. Third-party photo consent</H2>
      <P>
        Many photos include people other than the account holder (for example, family or
        wedding photos). By uploading an image of any third party, you confirm you have the
        right to use it and to have it processed as described here. Do not upload images of
        others without their permission.
      </P>

      <H2>6. Content moderation</H2>
      <P>
        To comply with law and store policies, uploaded images may be screened by an
        automated safety classifier, and flagged content may be reviewed by our staff before
        any print is produced. We do not knowingly process unlawful content.
      </P>

      <H2>7. Who we share data with (processors)</H2>
      <P>
        We share the minimum necessary data with service providers who process it on our
        behalf under contract:
      </P>
      <Ul>
        <li>AI providers (image processing);</li>
        <li>Payment processor (card/wallet payments) and Apple/Google (subscriptions);</li>
        <li>Courier/print partners (to fulfil and deliver orders);</li>
        <li>Cloud/hosting, analytics and crash-reporting providers (to run and improve the app).</li>
      </Ul>
      <P>We may also disclose data where required by law or to protect our rights.</P>

      <H2>8. International transfers</H2>
      <P>
        Some processors operate outside Egypt. Where personal data is transferred abroad, we
        rely on your consent and/or appropriate safeguards as required by the PDPL and its
        executive regulations.
      </P>

      <H2>9. Retention</H2>
      <Ul>
        <li>
          Photos and results are retained while your account is active or until you delete
          them (Gallery → delete).
        </li>
        <li>
          On account deletion, your photos, results and personal data are permanently
          deleted within 30 days, except records we must keep by law (e.g. financial records
          tied to a completed order).
        </li>
      </Ul>

      <H2>10. Your rights (PDPL)</H2>
      <P>
        Subject to the PDPL, you may access, correct, update or delete your data, object to
        or restrict certain processing, withdraw consent, and request portability. You can
        delete your account in-app (Profile → Delete account) or contact us. You may also
        complain to Egypt's Data Protection Center.
      </P>

      <H2>11. Security</H2>
      <P>
        We apply technical and organisational measures including encryption in transit,
        access controls and row-level database security. No system is perfectly secure, but
        we work to protect your data and to notify you and the authorities of any breach as
        required by law.
      </P>

      <H2>12. Children</H2>
      <P>
        Lamha is not directed to children under 18. If you believe a child has provided us
        data, contact us and we will delete it.
      </P>

      <H2>13. Changes</H2>
      <P>
        We may update this policy; we will post the new effective date and, for material
        changes, notify you in-app.
      </P>

      <H2>14. Contact</H2>
      <P>
        Questions or requests: <strong>WhatsApp +20 106 027 0197</strong> · [SUPPORT EMAIL] ·
        [COMPANY LEGAL NAME], [REGISTERED ADDRESS], Egypt.
      </P>
    </LegalLayout>
  )
}
