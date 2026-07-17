import { LegalLayout, H2, P, Ul, Muted } from './LegalLayout'

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" effectiveDate="[EFFECTIVE DATE]">
      <Muted>
        Draft for legal review. Governed by the laws of the Arab Republic of Egypt. An
        Arabic version will be issued and, for Egyptian users, the Arabic text prevails.
      </Muted>

      <P>
        <strong>Provider:</strong> [COMPANY LEGAL NAME], Commercial Register
        [COMMERCIAL REGISTER NO.], Tax Card [TAX CARD NO.], [REGISTERED ADDRESS], Egypt.
        <br />
        <strong>Contact:</strong> WhatsApp +20 106 027 0197 · [SUPPORT EMAIL]
      </P>

      <H2>1. Acceptance</H2>
      <P>
        By downloading or using the Lamha app you agree to these Terms and to our{' '}
        <a href="/legal/privacy" className="text-[var(--color-accent)] hover:underline">
          Privacy Policy
        </a>{' '}
        and{' '}
        <a href="/legal/refund" className="text-[var(--color-accent)] hover:underline">
          Refund &amp; Cancellation Policy
        </a>
        . If you do not agree, do not use the app.
      </P>

      <H2>2. Eligibility</H2>
      <P>
        You must be 18 or older and able to enter a binding contract. If you use the app for
        someone else or a business, you confirm you are authorised to do so.
      </P>

      <H2>3. Your account</H2>
      <Ul>
        <li>
          You may browse as a guest; some actions (payment, saving your account across
          devices) require sign-up via phone/OTP or social sign-in.
        </li>
        <li>
          You are responsible for activity under your account and for keeping access to your
          phone number/credentials secure. Tell us promptly of any unauthorised use.
        </li>
      </Ul>

      <H2>4. Licence</H2>
      <P>
        We grant you a personal, non-exclusive, non-transferable, revocable licence to use
        the app for its intended purpose. You may not copy, reverse-engineer, resell, or
        misuse the app or its content except as the law allows.
      </P>

      <H2>5. Acceptable use — your content</H2>
      <P>
        You are solely responsible for the images you upload. You must not upload or
        generate content that:
      </P>
      <Ul>
        <li>
          you do not have the right to use, or that depicts a third party without their
          consent (see Privacy Policy §5);
        </li>
        <li>is unlawful, infringing, defamatory, hateful, or sexually explicit;</li>
        <li>
          depicts a real person in a false or misleading way, or is intended to deceive,
          impersonate, or harm (including non-consensual or deceptive "deepfakes");
        </li>
        <li>violates the rights or dignity of others or any applicable Egyptian law.</li>
      </Ul>
      <P>
        We may refuse, remove, or refer to authorities any content that breaches these
        Terms, and may suspend accounts that do so.
      </P>

      <H2>6. AI-generated results</H2>
      <Ul>
        <li>
          Results are produced by automated AI and are labelled as AI-enhanced. AI output
          can vary; we do not guarantee a specific artistic outcome. The 3-variant choice and
          preview steps let you decide before you pay for any print.
        </li>
        <li>
          As between you and us, you retain rights to your own uploaded photos and to the
          results generated for you, subject to third-party rights and these Terms.
        </li>
      </Ul>

      <H2>7. Credits, trials and subscriptions</H2>
      <Ul>
        <li>
          Free features (e.g. restoration, colourisation, document photos) are provided
          subject to fair-use limits described in the app.
        </li>
        <li>
          Premium styles include a limited number of lifetime free trials; further use
          requires an active subscription.
        </li>
        <li>
          Subscriptions are billed by Apple/Google through in-app purchase and are governed
          by their terms and their refund policies. Manage or cancel via your App Store /
          Google Play account. Credits are as published and, unless stated, do not roll over
          between billing cycles.
        </li>
      </Ul>

      <H2>8. Physical products</H2>
      <P>
        Printed products are offered subject to our{' '}
        <a href="/legal/refund" className="text-[var(--color-accent)] hover:underline">
          Refund &amp; Cancellation Policy
        </a>
        . In summary: you pay 50% of the product price plus the full delivery fee online at
        checkout, and the remaining 50% as cash on delivery. Prices, sizes and delivery
        options are shown before you order.
      </P>

      <H2>9. Fees and taxes</H2>
      <P>
        Prices are shown in Egyptian Pounds and, where applicable, include or are subject to
        VAT and other taxes. We may change prices prospectively.
      </P>

      <H2>10. Intellectual property</H2>
      <P>
        The app, its design, trademarks, and the prompt/style library are our property or
        licensed to us. Nothing here transfers our IP to you.
      </P>

      <H2>11. Third-party services</H2>
      <P>
        The app relies on third-party services (AI providers, payment processor, couriers,
        Apple/Google, analytics). Their terms may also apply; we are not responsible for
        their acts or omissions beyond what the law requires.
      </P>

      <H2>12. Disclaimers</H2>
      <P>
        The app is provided "as is" and "as available" to the extent permitted by law. We do
        not warrant uninterrupted or error-free operation or that results will meet your
        expectations.
      </P>

      <H2>13. Limitation of liability</H2>
      <P>
        To the maximum extent permitted by Egyptian law, we are not liable for indirect,
        incidental or consequential losses. Nothing in these Terms excludes liability that
        cannot be excluded by law, including consumer-protection rights.
      </P>

      <H2>14. Indemnity</H2>
      <P>
        You agree to indemnify us against claims arising from your breach of these Terms or
        from content you upload, including third-party consent claims.
      </P>

      <H2>15. Suspension and termination</H2>
      <P>
        We may suspend or terminate access for breach of these Terms or applicable law. You
        may stop using the app and delete your account at any time.
      </P>

      <H2>16. Governing law and disputes</H2>
      <P>
        These Terms are governed by the laws of the Arab Republic of Egypt. Disputes are
        subject to the competent Egyptian courts, without prejudice to mandatory consumer
        rights and any agreed alternative dispute resolution.
      </P>

      <H2>17. Changes</H2>
      <P>
        We may update these Terms; the new effective date will be posted and, for material
        changes, we will notify you in-app. Continued use means acceptance.
      </P>

      <H2>18. Contact</H2>
      <P>
        <strong>WhatsApp +20 106 027 0197</strong> · [SUPPORT EMAIL] · [COMPANY LEGAL NAME],
        [REGISTERED ADDRESS], Egypt.
      </P>
    </LegalLayout>
  )
}
