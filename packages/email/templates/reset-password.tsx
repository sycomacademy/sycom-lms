import { Text } from "@react-email/components";
import { Button } from "../_components/button";
import { EmailLayout } from "../_components/layout";

interface ResetPasswordEmailProps {
  name: string;
  resetUrl: string;
}

export function ResetPasswordEmail({
  name = "John Doe",
  resetUrl = "https://example.com",
}: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Reset your Sycom LMS password">
      <Text style={heading}>Reset your password</Text>

      <Text style={paragraph}>Hi {name},</Text>

      <Text style={paragraph}>
        We received a request to reset your password. Click the button below to
        choose a new one. This link is valid for 1 hour.
      </Text>

      <Button href={resetUrl}>Reset password</Button>

      <Text style={muted}>
        If you didn&apos;t request a password reset, you can safely ignore this
        email. Your password will remain unchanged.
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

export default ResetPasswordEmail;
ResetPasswordEmail.PreviewProps = {
  name: "John Doe",
  resetUrl: "https://example.com/reset?token=abc123",
} as ResetPasswordEmailProps;
