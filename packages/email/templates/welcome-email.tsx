import { Text } from "@react-email/components";
import { Button } from "../_components/button";
import { EmailLayout } from "../_components/layout";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name = "there" }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to Sycom LMS — you're all set!">
      <Text style={heading}>Welcome aboard 👋</Text>

      <Text style={paragraph}>Hi {name},</Text>

      <Text style={paragraph}>
        Your email is verified and your Sycom LMS account is ready. Start
        exploring your courses, labs, and learning paths.
      </Text>

      <Button href="https://lms.sycom.io/dashboard">Go to dashboard</Button>

      <Text style={muted}>
        If you have any questions, reply to this email — we&apos;re happy to
        help.
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

export default WelcomeEmail;
WelcomeEmail.PreviewProps = {
  name: "Jane Smith",
} as WelcomeEmailProps;
