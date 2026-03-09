import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/packages/env/server";
import { getWebsiteUrl } from "@/packages/env/utils";

const UNSUBSCRIBE_SALT = "sycom-lms-resend-unsubscribe";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

interface UnsubscribeTokenPayload {
  email: string;
  exp: number;
  type: "marketing";
  userId: string;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", `${env.BETTER_AUTH_SECRET}:${UNSUBSCRIBE_SALT}`)
    .update(value)
    .digest("base64url");
}

export function createUnsubscribeToken(input: {
  email: string;
  ttlInSeconds?: number;
  userId: string;
}) {
  const payload: UnsubscribeTokenPayload = {
    email: input.email,
    exp:
      Math.floor(Date.now() / 1000) +
      (input.ttlInSeconds ?? ONE_YEAR_IN_SECONDS),
    type: "marketing",
    userId: input.userId,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyUnsubscribeToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!(encodedPayload && signature)) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      fromBase64Url(encodedPayload)
    ) as UnsubscribeTokenPayload;

    if (payload.type !== "marketing") {
      return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getUnsubscribeUrl(token: string) {
  return `${getWebsiteUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
}
