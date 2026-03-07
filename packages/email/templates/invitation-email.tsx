import {
  Body,
  Container,
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Button } from "../_components/button";
import { Footer } from "../_components/footer";
import { Logo } from "../_components/logo";
import { colors, EmailThemeProvider } from "../_components/theme";

interface InvitationEmailProps {
  organizationName: string;
  inviterName: string;
  inviteUrl: string;
  role?: string;
}

export function InvitationEmail({
  organizationName = "Acme Corp",
  inviterName = "Jane Smith",
  inviteUrl = "https://example.com/invite/abc123",
  role = "member",
}: InvitationEmailProps) {
  return (
    <EmailThemeProvider
      preview={
        <Preview>
          You've been invited to join {organizationName} on Sycom LMS
        </Preview>
      }
    >
      <Body
        className="mx-auto my-auto font-sans"
        style={{ backgroundColor: colors.surface, color: colors.foreground }}
      >
        <Container
          className="mx-auto my-10 max-w-xl border border-solid p-5"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          <Logo />

          <Heading
            className="mx-0 my-8 p-0 text-center font-semibold text-xl"
            style={{ color: colors.foreground }}
          >
            You're invited
          </Heading>

          <Text
            className="text-sm leading-6"
            style={{ color: colors.foreground }}
          >
            <strong>{inviterName}</strong> has invited you to join{" "}
            <strong>{organizationName}</strong> as a {role} on Sycom LMS.
          </Text>

          <Text
            className="text-sm leading-6"
            style={{ color: colors.foreground }}
          >
            Click the button below to accept the invitation and get started.
          </Text>

          <Section className="mt-8 mb-8 text-center">
            <Button href={inviteUrl}>Accept invitation</Button>
          </Section>

          <Text className="text-xs" style={{ color: colors.muted }}>
            If you weren't expecting this invitation, you can safely ignore this
            email. The invitation will expire in 48 hours.
          </Text>

          <Footer />
        </Container>
      </Body>
    </EmailThemeProvider>
  );
}

export default InvitationEmail;
InvitationEmail.PreviewProps = {
  organizationName: "Acme Corp",
  inviterName: "Jane Smith",
  inviteUrl: "https://example.com/invite/abc123",
  role: "student",
} as InvitationEmailProps;
