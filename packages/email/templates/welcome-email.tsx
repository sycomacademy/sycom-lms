import {
  Body,
  Container,
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { getWebsiteUrl } from "@/packages/env/utils";
import { Button } from "../_components/button";
import { Footer } from "../_components/footer";
import { Logo } from "../_components/logo";
import { colors, EmailThemeProvider } from "../_components/theme";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name = "there" }: WelcomeEmailProps) {
  const firstName = name ? name.split(" ").at(0) : "";
  const previewText = `${firstName ? `Hi ${firstName}, welcome` : "Welcome"} to Sycom LMS — built for aspiring cybersecurity professionals like you.`;

  const baseUrl = getWebsiteUrl();

  return (
    <EmailThemeProvider preview={<Preview>{previewText}</Preview>}>
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
            Welcome to Sycom LMS
          </Heading>

          <br />

          <span
            className="font-medium text-sm"
            style={{ color: colors.foreground }}
          >
            {firstName ? `Hi ${firstName},` : "Hello,"}
          </span>

          <Text
            className="text-sm leading-6"
            style={{ color: colors.foreground }}
          >
            I'm Abdul, the CEO of Sycom Solutions.
            <br />
            <br />
            We built Sycom LMS after years of training security teams, tired of
            platforms that teach theory but skip the hands-on work. If that
            sounds familiar, you're in the right place.
            <br />
            <br />
            If you have any questions, please feel free to reach out to me. I
            read and reply to every email.
            <br />
            <br />
            Cheers, Abdul
          </Text>

          <Section className="mt-8 mb-8 text-center">
            <Button href={`${baseUrl}/dashboard`}>Get started</Button>
          </Section>
          <br />

          <Footer />
        </Container>
      </Body>
    </EmailThemeProvider>
  );
}

export default WelcomeEmail;
WelcomeEmail.PreviewProps = {
  name: "Jane Smith",
} as WelcomeEmailProps;
