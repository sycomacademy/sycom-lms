import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="mb-8 font-bold text-4xl">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm italic">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">1. Introduction</h2>
            <p className="text-muted-foreground">
              SYCOM LMS ("we," "our," or "us") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our learning
              management system and related services.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              2. Information We Collect
            </h2>
            <h3 className="mb-2 font-semibold text-xl">
              2.1 Personal Information
            </h3>
            <p className="text-muted-foreground">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>
                Name and contact information (email address, phone number)
              </li>
              <li>Account credentials (username, password)</li>
              <li>
                Payment information (processed securely through third-party
                providers)
              </li>
              <li>Profile information and preferences</li>
            </ul>

            <h3 className="mt-4 mb-2 font-semibold text-xl">
              2.2 Usage Information
            </h3>
            <p className="text-muted-foreground">
              We automatically collect information about how you interact with
              our platform, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Device information and IP address</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on pages</li>
              <li>Course progress and completion data</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>
                Send you course updates, newsletters, and promotional materials
              </li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-muted-foreground">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information only in the following
              circumstances:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>
                With service providers who assist in operating our platform
                (under strict confidentiality agreements)
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              5. Cookies and Tracking
            </h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to track activity
              on our platform and store certain information. You can instruct
              your browser to refuse all cookies or to indicate when a cookie is
              being sent.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">6. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. However, no method
              of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              7. Your Rights and Choices
            </h2>
            <p className="text-muted-foreground">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Access and update your personal information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              8. Children's Privacy
            </h2>
            <p className="text-muted-foreground">
              Our services are not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children. If
              you become aware that a child has provided us with personal
              information, please contact us.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              9. Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">10. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please
              contact us using the information provided on our website.
            </p>
          </section>

          <div className="mt-12 rounded-lg border border-border bg-muted/50 p-6">
            <p className="text-muted-foreground text-sm italic">
              <strong>Note:</strong> This is a template Privacy Policy document.
              Please review and customize it according to your specific data
              collection practices, legal requirements (including GDPR, CCPA,
              etc.), and business needs. It is recommended to consult with a
              legal professional before finalizing.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
