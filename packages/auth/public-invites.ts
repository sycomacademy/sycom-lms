import { createHash } from "node:crypto";
import { auth } from "@/packages/auth/auth";
import { baseURL } from "@/packages/auth/config";
import { type Database, db } from "@/packages/db";
import {
  createPublicInviteRecord,
  findActivePublicInviteByEmail,
  findUserByEmail,
  getPublicInviteByTokenHash,
  markPublicInviteAccepted,
  markPublicInviteRejected,
  markPublicInviteRevoked,
  updateUserInviteCompletion,
} from "@/packages/db/queries";
import type { UserRole } from "@/packages/db/schema/auth";
import { render } from "@/packages/email/render";
import { sendEmail } from "@/packages/email/resend";
import { PlatformInviteEmail } from "@/packages/email/templates/platform-invite-email";

const PUBLIC_INVITE_TTL_MS = 1000 * 60 * 60 * 24;

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createRawInviteToken() {
  return crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID();
}

export async function createPublicInvite(
  params: {
    email: string;
    name: string;
    role: UserRole;
    createdBy: string;
    inviterName: string;
  },
  database: Database = db
) {
  const [existingUser, existingInvite] = await Promise.all([
    findUserByEmail(database, { email: params.email }),
    findActivePublicInviteByEmail(database, { email: params.email }),
  ]);

  if (existingUser) {
    return { invite: null, conflict: "user_exists" as const, emailSent: false };
  }

  if (existingInvite) {
    return {
      invite: null,
      conflict: "invite_exists" as const,
      emailSent: false,
    };
  }

  const token = createRawInviteToken();
  const expiresAt = new Date(Date.now() + PUBLIC_INVITE_TTL_MS);
  const invite = await createPublicInviteRecord(database, {
    email: params.email,
    name: params.name,
    role: params.role,
    tokenHash: hashInviteToken(token),
    expiresAt,
    createdBy: params.createdBy,
  });

  const inviteUrl = `${baseURL}/invite?token=${encodeURIComponent(token)}`;
  const emailResponse = await sendEmail({
    to: params.email,
    subject: "You're invited to Sycom LMS",
    html: await render(
      PlatformInviteEmail({
        inviteUrl,
        inviterName: params.inviterName,
        name: params.name,
        role: params.role,
      })
    ),
  });

  return {
    invite,
    conflict: null,
    emailSent: !emailResponse.error,
  };
}

export async function resolvePublicInviteByToken(
  params: { token: string },
  database: Database = db
) {
  const invite = await getPublicInviteByTokenHash(database, {
    tokenHash: hashInviteToken(params.token),
  });

  if (!invite) {
    return { invite: null, error: "not_found" as const };
  }

  if (invite.displayStatus !== "pending") {
    return { invite, error: invite.displayStatus };
  }

  return { invite, error: null };
}

export async function acceptPublicInvite(
  params: { token: string; password: string },
  database: Database = db
) {
  const resolvedInvite = await resolvePublicInviteByToken(params, database);
  if (!resolvedInvite.invite || resolvedInvite.error) {
    return {
      accepted: false as const,
      error: resolvedInvite.error ?? "not_found",
      email: null,
    };
  }

  const existingUser = await findUserByEmail(database, {
    email: resolvedInvite.invite.email,
  });
  if (existingUser) {
    return {
      accepted: false as const,
      error: "user_exists" as const,
      email: resolvedInvite.invite.email,
    };
  }

  await auth.api.signUpEmail({
    body: {
      email: resolvedInvite.invite.email,
      name: resolvedInvite.invite.name,
      password: params.password,
    },
  });

  const createdUser = await findUserByEmail(database, {
    email: resolvedInvite.invite.email,
  });

  if (!createdUser) {
    return {
      accepted: false as const,
      error: "create_failed" as const,
      email: resolvedInvite.invite.email,
    };
  }

  await Promise.all([
    updateUserInviteCompletion(database, {
      userId: createdUser.id,
      role: resolvedInvite.invite.role,
    }),
    markPublicInviteAccepted(database, {
      inviteId: resolvedInvite.invite.id,
      acceptedUserId: createdUser.id,
    }),
  ]);

  return {
    accepted: true as const,
    error: null,
    email: resolvedInvite.invite.email,
  };
}

export async function rejectPublicInvite(
  params: { token: string },
  database: Database = db
) {
  const resolvedInvite = await resolvePublicInviteByToken(params, database);
  if (!resolvedInvite.invite || resolvedInvite.error) {
    return {
      rejected: false as const,
      error: resolvedInvite.error ?? "not_found",
    };
  }

  await markPublicInviteRejected(database, {
    inviteId: resolvedInvite.invite.id,
  });

  return { rejected: true as const, error: null };
}

export async function revokePublicInvite(
  params: { inviteId: string },
  database: Database = db
) {
  const invite = await markPublicInviteRevoked(database, params);

  return invite ?? null;
}
