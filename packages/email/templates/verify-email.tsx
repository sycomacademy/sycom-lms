import { Text } from "@react-email/components";
import { Button } from "../_components/button";
import { EmailLayout } from "../_components/layout";

interface VerifyEmailProps {
  name: string;
  verifyUrl: string;
}

export function VerifyEmail({
  name = "John Doe",
  verifyUrl = "https://example.com",
}: VerifyEmailProps) {
  return (
    <EmailLayout preview="Verify your email for Sycom LMS">
      <Text style={heading}>Verify your email</Text>

      <Text style={paragraph}>Hi {name},</Text>

      <Text style={paragraph}>
        Welcome to Sycom LMS! Please verify your email address by clicking the
        button below. This link is valid for 1 hour.
      </Text>

      <Button href={verifyUrl}>Verify email address</Button>

      <Text style={muted}>
        If you didn&apos;t create a Sycom account, you can safely ignore this
        email.
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
