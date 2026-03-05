"use client";

import { AccountAvatar } from "./account-avatar";
import { AccountBio } from "./account-bio";
import { AccountEmail } from "./account-email";
import { AccountName } from "./account-name";

export function AccountGeneral() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <AccountAvatar />
      <AccountName />
      <AccountEmail />
      <AccountBio />
    </div>
  );
}
