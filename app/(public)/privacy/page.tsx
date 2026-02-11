import type { Metadata } from "next";
import { BackButton } from "@/components/layout/back-button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy Policy | Sycom LMS",
  description: "Privacy Policy for Sycom LMS.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <BackButton className="pl-0" />
      <Separator className="my-4" />
      <h1 className="font-semibold text-3xl tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Last updated: February 10, 2026
      </p>

      <div className="mt-10 space-y-8 text-foreground/80 text-sm leading-relaxed">
        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            1. Introduction
          </h2>
          <p>
            Sycom (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)
            operates the Sycom LMS platform. This Privacy Policy describes how
            we collect, use, and protect your personal information when you use
            our Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            2. Information We Collect
          </h2>
          <p>We may collect the following types of information:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Account information:</strong> name, email address, and
              password when you create an account.
            </li>
            <li>
              <strong>Profile information:</strong> optional details such as job
              title, company, location, and bio.
            </li>
            <li>
              <strong>Usage data:</strong> course progress, completion rates,
              quiz scores, and interaction with labs.
            </li>
            <li>
              <strong>Technical data:</strong> IP address, browser type, device
              information, and access times collected through server logs.
            </li>
            <li>
              <strong>Payment information:</strong> billing details processed
              securely through third-party payment processors. We do not store
              credit card numbers.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            3. How We Use Your Information
          </h2>
          <p>We use the information we collect to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Provide, maintain, and improve the Service.</li>
            <li>
              Personalize your learning experience and recommend relevant
              courses.
            </li>
            <li>
              Send you transactional emails (account verification, password
              resets, course updates).
            </li>
            <li>
              Send marketing communications (with your consent, which you can
              withdraw at any time).
            </li>
            <li>Analyze usage patterns to improve our platform and content.</li>
            <li>Detect, prevent, and address security issues and fraud.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            4. Data Sharing
          </h2>
          <p>
            We do not sell your personal information. We may share your data
            with:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Service providers:</strong> trusted third parties who
              assist us in operating the Service (hosting, analytics, email
              delivery, payment processing).
            </li>
            <li>
              <strong>Legal requirements:</strong> when required by law,
              regulation, or legal process.
            </li>
            <li>
              <strong>Business transfers:</strong> in connection with a merger,
              acquisition, or sale of assets.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            5. Data Security
          </h2>
          <p>
            We implement industry-standard security measures to protect your
            personal information, including encryption in transit (TLS) and at
            rest, secure authentication mechanisms, and regular security audits.
            However, no method of transmission over the Internet is 100% secure,
            and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            6. Data Retention
          </h2>
          <p>
            We retain your personal information for as long as your account is
            active or as needed to provide you the Service. We may also retain
            certain information as required by law or for legitimate business
            purposes (e.g., fraud prevention, analytics).
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            7. Your Rights
          </h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Access, correct, or delete your personal information.</li>
            <li>Object to or restrict certain data processing.</li>
            <li>Export your data in a portable format.</li>
            <li>Withdraw consent for marketing communications.</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at{" "}
            <a
              className="underline underline-offset-4 transition-colors hover:text-foreground"
              href="mailto:privacy@sycom.dev"
            >
              privacy@sycom.dev
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            8. Cookies
          </h2>
          <p>
            We use cookies and similar technologies to maintain your session,
            remember your preferences, and analyze usage. You can control cookie
            settings through your browser. Disabling cookies may affect the
            functionality of the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            9. Children&apos;s Privacy
          </h2>
          <p>
            The Service is not intended for individuals under the age of 16. We
            do not knowingly collect personal information from children. If we
            become aware that we have collected data from a child, we will take
            steps to delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            10. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes by posting the updated policy on the
            Service. Your continued use of the Service after changes constitutes
            acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            11. Contact
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact us
            at{" "}
            <a
              className="underline underline-offset-4 transition-colors hover:text-foreground"
              href="mailto:privacy@sycom.dev"
            >
              privacy@sycom.dev
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
