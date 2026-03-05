"use client";

import { SecurityChangePassword } from "./security-change-password";
import { SecurityLinkOAuth } from "./security-link-oauth";
import { SecuritySessionsPasskey } from "./security-sessions-passkey";
import { SecurityTwoFactor } from "./security-two-factor";

export function AccountSecurity() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <SecurityChangePassword />
      <SecuritySessionsPasskey />
      <SecurityLinkOAuth />
      <SecurityTwoFactor />
    </div>
  );
}
