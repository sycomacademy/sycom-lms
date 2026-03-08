import {
  Body,
  Container,
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { UserRole } from "@/packages/db/schema/auth";
import { ROLE_LABELS } from "@/packages/utils/schema";
import { Button } from "../_components/button";
import { Footer } from "../_components/footer";
import { Logo } from "../_components/logo";
import { colors, EmailThemeProvider } from "../_components/theme";

interface PlatformInviteEmailProps {
  inviteUrl: string;
  inviterName: string;
  name: string;
  role: UserRole;
}

export function PlatformInviteEmail({
  inviteUrl = "https://example.com/invite?token=abc123",
  inviterName = "Jane Smith",
  name = "Alex Doe",
  role = "content_creator",
}: PlatformInviteEmailProps) {
  const roleLabel = ROLE_LABELS[role];

  return (
    <EmailThemeProvider
      preview={
        <Preview>
          You have been invited to join Sycom LMS as a {roleLabel}
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
            Your Sycom LMS invitation
          </Heading>

          <Text
            className="text-sm leading-6"
            style={{ color: colors.foreground }}
          >
            Hi {name},
          </Text>

          <Text
            className="text-sm leading-6"
            style={{ color: colors.foreground }}
          >
            <strong>{inviterName}</strong> invited you to join Sycom LMS as a{" "}
            <strong>{roleLabel}</strong>.
          </Text>

          <Text
            className="text-sm leading-6"
            style={{ color: colors.foreground }}
          >
            Click the button below to set your password and finish creating your
            account.
          </Text>

          <Section className="mt-8 mb-8 text-center">
            <Button href={inviteUrl}>Accept invite</Button>
          </Section>

          <Text className="text-xs" style={{ color: colors.muted }}>
            This invite is valid for 24 hours. If you were not expecting it, you
            can safely ignore this email.
          </Text>

          <Footer />
        </Container>
      </Body>
    </EmailThemeProvider>
  );
}

export default PlatformInviteEmail;
