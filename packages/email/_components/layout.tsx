import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { getWebsiteUrl } from "@/packages/env/utils";
/**
 * Shared email layout. Wraps every transactional email with a consistent
 * header (logo), content area, and footer.
 */
export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              alt="Sycom LMS"
              height={28}
              src={`${getWebsiteUrl()}/sycom-logo.png`}
              width={28}
            />
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Text style={footer}>
            Sycom Solutions &mdash; Cybersecurity Training Platform
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

/* -- Inline styles (email clients ignore CSS classes) -- */

const body: React.CSSProperties = {
  backgroundColor: "#fafafa",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e5e5",
  borderRadius: "6px",
  margin: "40px auto",
  maxWidth: "480px",
  padding: "0",
};

const header: React.CSSProperties = {
  borderBottom: "1px solid #e5e5e5",
  padding: "20px 24px",
};

const content: React.CSSProperties = {
  padding: "24px",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "0",
};

const footer: React.CSSProperties = {
  color: "#8c8c8c",
  fontSize: "12px",
  padding: "16px 24px",
  textAlign: "center" as const,
};
