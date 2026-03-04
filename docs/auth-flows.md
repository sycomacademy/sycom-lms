# Authentication Flows

This document describes the three sign-up/sign-in flows supported by the platform.

## Flow A: Org with Domain (SSO)

For organizations that own an email domain (e.g. `@university.edu`, `@sycomsolutions.com`).

### How it works

1. User enters their email on the sign-in page (e.g. `ali@sycomsolutions.com`).
2. The form calls `authClient.signIn.sso({ email })`.
3. Better Auth extracts the domain (`sycomsolutions.com`), looks up the `ssoProvider` table for a matching domain.
4. If a provider is found, the user is redirected to the IdP (SAML or OIDC).
5. After authentication at the IdP, the user is redirected back via the SSO callback.
6. Better Auth creates or finds the user, adds them to the linked organization (via `organizationProvisioning`), and creates a session.
7. If no SSO provider matches the domain, the form falls through to standard email/password sign-in.

### Provisioning

- **SCIM**: The org's IdP pushes user creates/updates/deletes to the SCIM endpoint (`/api/auth/scim/v2`). Users are created in the DB and added to the org before they ever sign in.
- **Manual/CSV import**: Platform admins can create users and add them to the org via admin tools.
- **Account linking**: Users who sign in via Google or LinkedIn with a matching email domain are automatically linked to the same account (via `accountLinking` with `trustedProviders`).

### Domain verification

SSO providers require domain verification via DNS TXT record. When a provider is registered, a verification token is returned. The org admin adds a TXT record (`_better-auth-token-{providerId}`) and then calls the verify endpoint.

---

## Flow B: Org without Domain

For organizations without a dedicated email domain (e.g. training groups, bootcamps, corporate workshops).

### How it works

1. An org admin creates the organization and sends invitation links.
2. Invited users receive an email with a link (e.g. `/invite/{invitationId}`).
3. The user clicks the link, creates an account (email/password) or links an existing Google/LinkedIn account.
4. Upon accepting the invitation, they are added to the organization with the specified role.

### Provisioning

- **Invitations**: The primary method. Org admins send invitations via email; each invitation specifies a role and optionally a cohort.
- **CSV import**: Bulk user creation by uploading a CSV with emails, names, and roles (future enhancement).
- **No SSO**: Since there is no domain, SSO routing does not apply. Users sign in with email/password or OAuth.

### Sign-in

Standard email/password or Google/LinkedIn OAuth. No domain-based SSO redirect.

---

## Flow C: Public Users

Individual learners who sign up on their own without being tied to any organization.

### How it works

1. User signs up via email/password, Google, or LinkedIn on the public sign-up page.
2. After account creation, the `databaseHooks.user.create.after` hook automatically:
   - Adds the user to the "Platform" public organization as a `student` member.
   - Adds the user to the "General" public cohort within that organization.
3. On session creation, if `activeOrganizationId` is null, it is set to the public org.

### Why a public org exists

Every user belongs to at least one organization. This eliminates `activeOrganizationId IS NULL` branches throughout the codebase. Queries, permissions, and UI logic treat public users identically to org users.

### Sign-in

- Email/password (with email verification)
- Google OAuth
- LinkedIn OAuth

### The public org and cohort

| Entity | Slug/Name | Purpose |
|--------|-----------|---------|
| Organization | `platform` | Implicit org for all public users |
| Cohort | `General` | Default cohort within the public org |

These are created by the seed script (`bun run db:seed`).

---

## Summary

| Aspect | Org with Domain | Org without Domain | Public Users |
|--------|----------------|-------------------|--------------|
| Sign-in | SSO (SAML/OIDC) via domain | Email/password, OAuth | Email/password, OAuth |
| Provisioning | SCIM, SSO auto-provision | Invitations, CSV | Self-service sign-up |
| Organization | Linked via SSO provider | Linked via invitation | Auto-added to public org |
| Domain required | Yes | No | No |
| Account linking | SSO + OAuth by email | OAuth by email | OAuth by email |
