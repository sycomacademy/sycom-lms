import type { Metadata } from "next";
import { BackButton } from "@/components/layout/back-button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Terms of Service | Sycom LMS",
  description: "Terms of Service for Sycom LMS.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <BackButton className="pl-0" />
      <Separator className="my-4" />
      <h1 className="font-semibold text-3xl tracking-tight">
        Terms of Service
      </h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Last updated: February 10, 2026
      </p>

      <div className="mt-10 space-y-8 text-foreground/80 text-sm leading-relaxed">
        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Sycom LMS (&ldquo;the Service&rdquo;),
            operated by Sycom (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;), you agree to be bound by these Terms of Service.
            If you do not agree to all of these terms, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            2. Description of Service
          </h2>
          <p>
            Sycom LMS is an online learning management system that provides
            cybersecurity education, including but not limited to interactive
            courses, hands-on labs, certification preparation materials, and
            progress tracking tools.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            3. User Accounts
          </h2>
          <p>
            You must create an account to access certain features of the
            Service. You are responsible for maintaining the confidentiality of
            your account credentials and for all activities that occur under
            your account. You agree to provide accurate, current, and complete
            information during registration and to update such information to
            keep it accurate.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            4. Acceptable Use
          </h2>
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              Use the Service for any unlawful purpose or in violation of any
              applicable laws or regulations.
            </li>
            <li>
              Share, distribute, or reproduce course materials without prior
              written consent.
            </li>
            <li>
              Attempt to gain unauthorized access to any part of the Service,
              other accounts, or computer systems.
            </li>
            <li>
              Interfere with or disrupt the integrity or performance of the
              Service.
            </li>
            <li>
              Use the knowledge gained from the Service to conduct unauthorized
              security testing on systems you do not own or have permission to
              test.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            5. Intellectual Property
          </h2>
          <p>
            All content provided through the Service, including text, graphics,
            logos, icons, images, audio clips, video clips, and software, is the
            property of Sycom or its content suppliers and is protected by
            applicable intellectual property laws. You are granted a limited,
            non-exclusive, non-transferable license to access and use the
            content for personal, non-commercial educational purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            6. Payment and Refunds
          </h2>
          <p>
            Certain features of the Service may require payment. All fees are
            stated in US dollars unless otherwise specified. Refund requests
            must be submitted within 14 days of purchase and are subject to
            review and approval at our discretion.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            7. Disclaimer of Warranties
          </h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, whether express or
            implied, including but not limited to implied warranties of
            merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            8. Limitation of Liability
          </h2>
          <p>
            In no event shall Sycom, its officers, directors, employees, or
            agents be liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of or in connection
            with your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            9. Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate your account and access
            to the Service at our sole discretion, without notice, for conduct
            that we determine violates these Terms or is harmful to other users,
            us, or third parties, or for any other reason.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            10. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these Terms at any time. We will
            notify users of significant changes by posting the updated Terms on
            the Service. Your continued use of the Service after changes
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-medium text-base text-foreground">
            11. Contact
          </h2>
          <p>
            If you have questions about these Terms, please contact us at{" "}
            <a
              className="underline underline-offset-4 transition-colors hover:text-foreground"
              href="mailto:support@sycom.dev"
            >
              support@sycom.dev
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
