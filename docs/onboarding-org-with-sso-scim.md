# Onboarding an Organization with SSO and SCIM

Step-by-step guide for onboarding a new organization that uses an Identity Provider (IdP) for SSO and SCIM-based user provisioning.

## Prerequisites

- The organization has an IdP that supports SSO (SAML 2.0 or OIDC) and SCIM 2.0 (e.g. Okta, Azure AD, OneLogin, Google Workspace).
- A platform admin account on the LMS.
- The organization owns a verified email domain (e.g. `acmecorp.com`).

## Step 1: Create the Organization

A platform admin creates the organization:

```ts
await auth.api.createOrganization({
  body: {
    name: "Acme Corp",
    slug: "acme-corp",
  },
  headers, // platform admin session
});
```

Note the returned `organizationId` -- it is needed for SSO and SCIM setup.

## Step 2: Register the SSO Provider

Register an SSO provider (OIDC or SAML) and link it to the organization.

### OIDC Example (Okta)

```ts
await auth.api.registerSSOProvider({
  body: {
    providerId: "acme-corp-okta",
    issuer: "https://acme-corp.okta.com",
    domain: "acmecorp.com",
    organizationId: "org_acme_corp_id",
    oidcConfig: {
      clientId: "your-oidc-client-id",
      clientSecret: "your-oidc-client-secret",
    },
  },
  headers, // platform admin session
});
```

Most OIDC endpoints are auto-discovered from `{issuer}/.well-known/openid-configuration`.

### SAML Example

```ts
await auth.api.registerSSOProvider({
  body: {
    providerId: "acme-corp-saml",
    issuer: "https://acme-corp.okta.com",
    domain: "acmecorp.com",
    organizationId: "org_acme_corp_id",
    samlConfig: {
      entryPoint: "https://acme-corp.okta.com/app/xxx/sso/saml",
      cert: "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
      callbackUrl: "/dashboard",
    },
  },
  headers,
});
```

### IdP Configuration

In the IdP (Okta, Azure AD, etc.):

**For OIDC:**
- Set the redirect URI to: `{APP_URL}/api/auth/sso/callback/acme-corp-okta`

**For SAML:**
- Set the ACS URL to: `{APP_URL}/api/auth/sso/saml2/callback/acme-corp-saml`
- Set the Audience URI (SP Entity ID) to: `{APP_URL}`
- Download SP metadata from: `{APP_URL}/api/auth/sso/saml2/sp/metadata?providerId=acme-corp-saml`

## Step 3: Domain Verification

When domain verification is enabled, the SSO provider is untrusted until the domain is verified.

1. The `registerSSOProvider` response includes a `domainVerified: false` status and a verification token.
2. Add a DNS TXT record:
   - **Host**: `_better-auth-token-acme-corp-okta`
   - **Value**: The verification token from the registration response
3. Wait for DNS propagation (usually minutes, can take up to 48 hours).
4. Submit the verification request:

```ts
await auth.api.verifyDomain({
  body: { providerId: "acme-corp-okta" },
  headers,
});
```

Once verified, SSO sign-ins and automatic account linking are enabled for `@acmecorp.com` emails.

## Step 4: Configure SCIM Provisioning

### Generate a SCIM Token

```ts
const { data } = await auth.api.generateSCIMToken({
  body: {
    providerId: "acme-corp-okta",
    organizationId: "org_acme_corp_id",
  },
  headers, // must be platform admin or org admin
});

// data.token is the plain SCIM bearer token
```

Only platform admins or org owners/admins can generate tokens (enforced by the `beforeSCIMTokenGenerated` hook).

### Configure the IdP

In the IdP's SCIM provisioning settings:

| Setting | Value |
|---------|-------|
| SCIM Base URL | `{APP_URL}/api/auth/scim/v2` |
| Authentication | Bearer Token |
| Bearer Token | Base64-encode: `{token}:{providerId}:{organizationId}` |
| Provisioning actions | Create Users, Update User Attributes, Deactivate Users |

### Attribute Mapping

The SCIM endpoint automatically maps:

| SCIM Attribute | LMS Field |
|----------------|-----------|
| `userName` / `externalId` | `account.accountId` |
| `name.formatted` or `name.givenName` + `name.familyName` | `user.name` |
| Primary email | `user.email` |

SCIM-provisioned users are automatically added as members of the linked organization.

## Step 5: Test the Integration

### Test SSO Sign-In

1. Go to the sign-in page.
2. Enter an email with the org domain (e.g. `user@acmecorp.com`).
3. The form should redirect to the IdP.
4. After IdP authentication, the user should land on `/dashboard`.
5. Verify the user is a member of the Acme Corp organization.

### Test SCIM Provisioning

1. In the IdP, assign a test user to the SCIM application.
2. The IdP should POST to the SCIM endpoint.
3. Verify the user exists in the LMS database and is a member of Acme Corp.
4. Update the user in the IdP and verify the change propagates.
5. Remove the user from the IdP application and verify deactivation.

## CSV Import Fallback

For organizations without SCIM support, users can be imported via CSV:

1. Prepare a CSV with columns: `email`, `name`, `role` (optional, defaults to `student`).
2. Use the admin import tool to bulk-create users and add them to the organization.
3. Each imported user receives an invitation email to set their password or link an OAuth account.

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| SSO redirect fails | Domain not verified | Complete domain verification (Step 3) |
| OIDC discovery error | IdP issuer URL incorrect | Verify the issuer URL returns a valid `.well-known/openid-configuration` |
| SAML assertion error | Certificate mismatch | Re-download the IdP certificate and update the provider |
| SCIM 401 Unauthorized | Invalid or expired token | Generate a new SCIM token |
| SCIM 403 Forbidden | Token not base64 encoded correctly | Encode as `base64({token}:{providerId}:{organizationId})` |
| Users not added to org | `organizationId` missing on provider | Re-register with the correct `organizationId` |
| Domain verification fails | DNS not propagated | Wait and retry; verify TXT record host and value |

## Onboarding Checklist

- [ ] Create organization in the LMS
- [ ] Register SSO provider with domain and `organizationId`
- [ ] Add DNS TXT record for domain verification
- [ ] Verify domain via API
- [ ] Configure IdP redirect/ACS URLs
- [ ] Generate SCIM token
- [ ] Configure SCIM in IdP with base URL and bearer token
- [ ] Test SSO sign-in with a domain email
- [ ] Test SCIM user provisioning (create, update, delete)
- [ ] Assign org roles and cohorts as needed
