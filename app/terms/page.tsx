import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="mb-8 font-bold text-4xl">Terms of Service</h1>
          <p className="text-muted-foreground text-sm italic">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to SYCOM LMS. These Terms of Service ("Terms") govern your
              access to and use of our learning management system and related
              services. By accessing or using our platform, you agree to be
              bound by these Terms.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              2. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground">
              By creating an account, accessing, or using our services, you
              acknowledge that you have read, understood, and agree to be bound
              by these Terms and our Privacy Policy.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              3. User Accounts and Registration
            </h2>
            <p className="text-muted-foreground">
              To access certain features of our platform, you must register for
              an account. You agree to provide accurate, current, and complete
              information during registration and to update such information to
              keep it accurate, current, and complete.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              4. User Responsibilities
            </h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account. You agree to notify us immediately of any unauthorized
              use of your account.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              5. Course Content and Intellectual Property
            </h2>
            <p className="text-muted-foreground">
              All course materials, content, and resources provided on our
              platform are protected by copyright and other intellectual
              property laws. You may not reproduce, distribute, or create
              derivative works from our content without explicit written
              permission.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              6. Payment and Refunds
            </h2>
            <p className="text-muted-foreground">
              Course fees are as displayed on our platform. All payments are
              processed securely. Refund policies are outlined in our separate
              Refund Policy document.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              7. Prohibited Activities
            </h2>
            <p className="text-muted-foreground">
              You agree not to engage in any activity that interferes with or
              disrupts the platform, violates any laws, infringes on the rights
              of others, or attempts to gain unauthorized access to our systems.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              8. Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, SYCOM LMS shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages arising from your use of our platform.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">9. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will
              notify users of any material changes. Your continued use of the
              platform after such modifications constitutes acceptance of the
              updated Terms.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">10. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms, please contact us at
              the information provided on our website.
            </p>
          </section>

          <div className="mt-12 rounded-lg border border-border bg-muted/50 p-6">
            <p className="text-muted-foreground text-sm italic">
              <strong>Note:</strong> This is a template Terms of Service
              document. Please review and customize it according to your
              specific business requirements and legal obligations. It is
              recommended to consult with a legal professional before
              finalizing.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
