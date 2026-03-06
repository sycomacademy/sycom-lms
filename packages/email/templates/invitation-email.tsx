import { Text } from "@react-email/components";
import { Button } from "../_components/button";
import { EmailLayout } from "../_components/layout";

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
    <EmailLayout
      preview={`You've been invited to join ${organizationName} on Sycom LMS`}
    >
      <Text style={heading}>You&apos;re invited</Text>

      <Text style={paragraph}>
        <strong>{inviterName}</strong> has invited you to join{" "}
        <strong>{organizationName}</strong> as a {role} on Sycom LMS.
      </Text>

      <Text style={paragraph}>
        Click the button below to accept the invitation and get started.
      </Text>

      <Button href={inviteUrl}>Accept invitation</Button>

      <Text style={muted}>
        If you weren&apos;t expecting this invitation, you can safely ignore
        this email. The invitation will expire in 48 hours.
      </Text>
    </EmailLayout>
  );
}

const heading: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 600,
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#333333",
  margin: "0 0 16px",
};

const muted: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "1.5",
  color: "#8c8c8c",
  margin: "24px 0 0",
};

export default InvitationEmail;
InvitationEmail.PreviewProps = {
  organizationName: "Acme Corp",
  inviterName: "Jane Smith",
  inviteUrl: "https://example.com/invite/abc123",
  role: "student",
} as InvitationEmailProps;
