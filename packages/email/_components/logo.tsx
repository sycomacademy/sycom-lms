import { Img, Section } from "@react-email/components";
import { getWebsiteUrl } from "@/packages/env/utils";

const baseUrl = getWebsiteUrl();

export function Logo() {
  return (
    <Section className="mt-8">
      <Img
        alt="Sycom Solutions"
        className="mx-auto my-0 block"
        src={`${baseUrl}/sycom-logo.png`}
        width="146"
      />
    </Section>
  );
}
