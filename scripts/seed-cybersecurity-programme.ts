#!/usr/bin/env bun
/**
 * Seed Cybersecurity Programme: 1 pathway, 1 course, 5 sections (modules), 38 lessons.
 * Content is Plate editor–compatible JSON (block nodes: h1, h2, h3, p, blockquote).
 *
 * Idempotent: uses ON CONFLICT DO NOTHING / fixed IDs.
 *
 * Usage: bun run scripts/seed-cybersecurity-programme.ts
 * Requires: DATABASE_URL, and at least one admin/instructor user (e.g. from seed-users).
 */

import "dotenv/config";
import { eq, inArray } from "drizzle-orm";
import { db } from "../packages/db";
import { user } from "../packages/db/schema/auth";
import {
  course,
  courseInstructor,
  lesson,
  pathway,
  pathwayCourse,
  section,
} from "../packages/db/schema/course";

// ---------------------------------------------------------------------------
// Plate-compatible content (Value = array of block elements)
// ---------------------------------------------------------------------------

type BlockType = "h1" | "h2" | "h3" | "p" | "blockquote";

function block(
  type: BlockType,
  text: string
): { type: BlockType; children: [{ text: string }] } {
  return { type, children: [{ text }] };
}

/** Build Plate Value from a list of blocks (no lists, just headings and paragraphs). */
function toPlateValue(
  blocks: Array<{ type: BlockType; text: string }>
): unknown {
  return blocks.map((b) => block(b.type, b.text));
}

// ---------------------------------------------------------------------------
// Course summary (Plate-compatible long-form description)
// ---------------------------------------------------------------------------

const courseSummary = toPlateValue([
  { type: "h1", text: "Cybersecurity Programme — Course Summary" },
  {
    type: "p",
    text: "This programme gives you an end-to-end path from security fundamentals to detection, response, and secure delivery. Over 38 lessons in five sections, you’ll build the knowledge and mindset needed to design, implement, and operate security controls in modern environments.",
  },
  { type: "h2", text: "What This Programme Covers" },
  {
    type: "p",
    text: "The content is organised into five modules. You’ll start with core security and systems (networking, OS internals, cryptography, threat modelling, and secure design). You’ll then move into web and API security: OWASP-style risks (XSS, SQL injection, CSRF, SSRF, IDOR), input validation, session management, API auth (keys, OAuth2, JWT), access control, rate limiting, and file upload and deserialisation risks.",
  },
  {
    type: "p",
    text: "The third module focuses on identity, access, and secrets: authentication factors and MFA, password storage and credential hygiene, SSO and common flows, RBAC and ABAC, service accounts and workload identity, least privilege and just-in-time access, secrets management and key rotation, and delegation and session security.",
  },
  {
    type: "p",
    text: "The fourth module covers cloud and infrastructure security: network segmentation and VPC design, security groups and firewalls and WAF, storage security for buckets and blobs, container and Kubernetes security, infrastructure and policy as code, vulnerability management and patching, endpoint hardening and EDR concepts, and secure configuration baselines.",
  },
  {
    type: "p",
    text: "The final module ties it together with detection, response, and secure delivery: key log sources and what to look for, detection engineering and writing rules, the incident response lifecycle, alert triage and escalation, forensics basics and evidence preservation, secure coding and security-focused code reviews, security testing in CI (SAST, DAST, dependency scanning), and scripting and automation to reduce manual toil.",
  },
  { type: "h2", text: "Who This Is For" },
  {
    type: "p",
    text: "Security practitioners who want to broaden their skills, developers who need to build and review secure applications, IT professionals moving into security roles, and anyone aiming for a career in cybersecurity. A basic understanding of computing and networking, plus familiarity with at least one programming language, will help you get the most from the material.",
  },
  { type: "h2", text: "What You’ll Achieve" },
  {
    type: "p",
    text: "By the end you’ll have a solid foundation in core security and systems, practical web and API security skills, a clear picture of identity and access and secrets management, working knowledge of cloud and infrastructure security, and the ability to contribute to detection, response, and secure delivery. The programme is designed so you can apply the concepts immediately in labs, code reviews, and operational contexts.",
  },
  { type: "h2", text: "Structure and Time" },
  {
    type: "p",
    text: "There are 5 sections (modules) and 38 lessons in total. Each lesson is article-based with clear headings and takeaways. Plan for roughly 80 hours of study and practice. You can follow the order linearly or use individual sections as reference depending on your role and goals.",
  },
]);

// ---------------------------------------------------------------------------
// Module 1: Core Security and Systems Fundamentals
// ---------------------------------------------------------------------------

const module1Lessons = [
  {
    title: "Networking basics (TCP, UDP, HTTP, TLS, DNS)",
    content: toPlateValue([
      { type: "h1", text: "Networking Basics" },
      {
        type: "p",
        text: "Understand the foundational protocols that power modern networks and the internet.",
      },
      { type: "h2", text: "Key Protocols" },
      {
        type: "p",
        text: "TCP – Reliable, connection-oriented delivery. Used for web browsing, email, file transfers.",
      },
      {
        type: "p",
        text: "UDP – Connectionless, best-effort delivery. Used for streaming, DNS, gaming.",
      },
      {
        type: "p",
        text: "HTTP/HTTPS – Application-layer protocol for web traffic. HTTPS adds TLS encryption.",
      },
      {
        type: "p",
        text: "TLS – Encrypts data in transit, providing confidentiality and integrity.",
      },
      {
        type: "p",
        text: "DNS – Translates domain names to IP addresses. A critical dependency for most services.",
      },
      { type: "h2", text: "Why This Matters for Security" },
      {
        type: "p",
        text: "Understanding these protocols helps you identify attack surfaces, secure communications, and detect anomalies.",
      },
    ]),
  },
  {
    title: "Operating system internals and permissions model",
    content: toPlateValue([
      { type: "h1", text: "Operating System Internals and Permissions" },
      {
        type: "p",
        text: "Learn how operating systems enforce access control and isolate processes.",
      },
      { type: "h2", text: "Key Concepts" },
      {
        type: "p",
        text: "Kernel vs user space – The kernel manages hardware and privileges; user processes run with limited rights.",
      },
      {
        type: "p",
        text: "File permissions – Unix-style read/write/execute for owner, group, and others.",
      },
      {
        type: "p",
        text: "Access control lists (ACLs) – Fine-grained permissions beyond owner/group/others.",
      },
      {
        type: "p",
        text: "Mandatory vs discretionary access – MAC enforces policy; DAC lets owners grant access.",
      },
      { type: "h2", text: "Security Implications" },
      {
        type: "p",
        text: "Strong permission models reduce the impact of compromised applications and limit lateral movement.",
      },
    ]),
  },
  {
    title: "Processes, threads and privilege boundaries",
    content: toPlateValue([
      { type: "h1", text: "Processes, Threads, and Privilege Boundaries" },
      {
        type: "p",
        text: "How programs run, share resources, and how privilege is enforced between them.",
      },
      { type: "h2", text: "Definitions" },
      {
        type: "p",
        text: "Process – An instance of a running program with its own memory space.",
      },
      {
        type: "p",
        text: "Thread – A unit of execution within a process; shares memory with other threads.",
      },
      {
        type: "p",
        text: "Privilege boundary – The separation between privileged (kernel, admin) and unprivileged (user) execution.",
      },
      { type: "h2", text: "Security Takeaway" },
      {
        type: "p",
        text: "Attackers often escalate privileges by crossing boundaries. Understanding process isolation and least privilege helps you defend against this.",
      },
    ]),
  },
  {
    title: "Cryptography basics (hashing, symmetric, asymmetric, signatures)",
    content: toPlateValue([
      { type: "h1", text: "Cryptography Basics" },
      {
        type: "p",
        text: "A concise overview of the cryptographic primitives used in security.",
      },
      { type: "h2", text: "Hashing" },
      {
        type: "p",
        text: "One-way functions that produce a fixed-size digest (e.g. SHA-256). Used for integrity, password storage, and indexing.",
      },
      { type: "h2", text: "Symmetric Encryption" },
      {
        type: "p",
        text: "Same key for encrypt and decrypt (e.g. AES). Fast and efficient for bulk data.",
      },
      { type: "h2", text: "Asymmetric Encryption" },
      {
        type: "p",
        text: "Public/private key pairs (e.g. RSA, ECC). Enables key exchange and digital signatures without shared secrets.",
      },
      { type: "h2", text: "Digital Signatures" },
      {
        type: "p",
        text: "Use private keys to sign; public keys to verify. Provides authenticity and non-repudiation.",
      },
      { type: "h2", text: "When to Use What" },
      {
        type: "p",
        text: "Confidentiality → Symmetric or asymmetric encryption. Integrity → Hashing, HMAC, signatures. Authentication → Signatures, challenge-response.",
      },
    ]),
  },
  {
    title: "Threat modeling and trust boundaries",
    content: toPlateValue([
      { type: "h1", text: "Threat Modeling and Trust Boundaries" },
      {
        type: "p",
        text: "Systematic techniques for identifying and addressing security risks.",
      },
      { type: "h2", text: "Threat Modeling" },
      {
        type: "p",
        text: "A structured process to identify assets, threats, vulnerabilities, and countermeasures. Common frameworks: STRIDE, PASTA, OCTAVE.",
      },
      { type: "h2", text: "Trust Boundaries" },
      {
        type: "p",
        text: "Points where data or control crosses from one trust level to another (e.g. internet to DMZ, user input to database). These boundaries are prime targets.",
      },
      { type: "h2", text: "Practical Steps" },
      {
        type: "p",
        text: "1. Define the system and its data flows. 2. Identify trust boundaries. 3. Enumerate threats at each boundary. 4. Prioritize and mitigate.",
      },
    ]),
  },
  {
    title: "Secure design principles (least privilege, defense in depth)",
    content: toPlateValue([
      { type: "h1", text: "Secure Design Principles" },
      {
        type: "p",
        text: "Fundamental principles that should guide security architecture and implementation.",
      },
      { type: "h2", text: "Least Privilege" },
      {
        type: "p",
        text: "Grant only the minimum access required for a task. Apply to users, processes, and services.",
      },
      { type: "h2", text: "Defense in Depth" },
      {
        type: "p",
        text: "Layer multiple controls so that a single failure does not compromise the system. Combine network, host, application, and data-level controls.",
      },
      { type: "h2", text: "Other Principles" },
      {
        type: "p",
        text: "Fail secure – Default to deny when something goes wrong. Separation of duties – Split critical functions across roles. Keep it simple – Complexity increases attack surface and misconfigurations.",
      },
    ]),
  },
  {
    title: "Core security models (CIA triad, STRIDE, kill chain thinking)",
    content: toPlateValue([
      { type: "h1", text: "Core Security Models" },
      {
        type: "p",
        text: "Frameworks that help structure security thinking and design.",
      },
      { type: "h2", text: "CIA Triad" },
      {
        type: "p",
        text: "Confidentiality – Information is not disclosed to unauthorised parties. Integrity – Information is accurate and not altered inappropriately. Availability – Systems and data are accessible when needed.",
      },
      { type: "h2", text: "STRIDE" },
      {
        type: "p",
        text: "A threat categorization model: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.",
      },
      { type: "h2", text: "Kill Chain Thinking" },
      {
        type: "p",
        text: "Understanding attack lifecycle (reconnaissance, weaponisation, delivery, exploitation, etc.) helps design defences at each stage.",
      },
    ]),
  },
];

// ---------------------------------------------------------------------------
// Module 2: Web and API Security
// ---------------------------------------------------------------------------

const module2Lessons = [
  {
    title: "OWASP style web risks (XSS, SQL injection, CSRF, SSRF, IDOR)",
    content: toPlateValue([
      { type: "h1", text: "OWASP-Style Web Risks" },
      {
        type: "p",
        text: "Common web and API vulnerabilities you must understand and defend against.",
      },
      { type: "h2", text: "XSS (Cross-Site Scripting)" },
      {
        type: "p",
        text: "Malicious scripts injected into web pages, executed in victims' browsers. Mitigate with output encoding and Content-Security-Policy.",
      },
      { type: "h2", text: "SQL Injection" },
      {
        type: "p",
        text: "Attacker-controlled input concatenated into SQL. Mitigate with parameterised queries and least-privilege DB accounts.",
      },
      { type: "h2", text: "CSRF (Cross-Site Request Forgery)" },
      {
        type: "p",
        text: "Forces a user's browser to perform unwanted actions on a site where they're authenticated. Use CSRF tokens, SameSite cookies.",
      },
      { type: "h2", text: "SSRF (Server-Side Request Forgery)" },
      {
        type: "p",
        text: "Attacker makes the server issue requests to internal or arbitrary URLs. Validate and restrict all user-supplied URLs.",
      },
      { type: "h2", text: "IDOR (Insecure Direct Object Reference)" },
      {
        type: "p",
        text: "Access to objects by guessing or tampering with IDs. Always enforce authorisation checks on every object access.",
      },
    ]),
  },
  {
    title: "Input validation and output encoding for user data",
    content: toPlateValue([
      { type: "h1", text: "Input Validation and Output Encoding" },
      {
        type: "p",
        text: "Two complementary controls to handle untrusted data safely.",
      },
      { type: "h2", text: "Input Validation" },
      {
        type: "p",
        text: "Validate type, length, format, and range. Use allowlists where possible; block or normalise invalid input. Validate on both client and server; never trust client-side checks alone.",
      },
      { type: "h2", text: "Output Encoding" },
      {
        type: "p",
        text: "Encode data for the context where it is used (HTML, URL, JavaScript, SQL). Use frameworks' built-in encoding; avoid manual string concatenation.",
      },
      { type: "h2", text: "Layered Approach" },
      {
        type: "p",
        text: "Validate at the boundary, encode at the point of use. Defence in depth reduces the impact of mistakes.",
      },
    ]),
  },
  {
    title: "Session management, cookies and secure cookie flags",
    content: toPlateValue([
      { type: "h1", text: "Session Management and Secure Cookies" },
      {
        type: "p",
        text: "How to manage user sessions and store authentication state safely.",
      },
      { type: "h2", text: "Session Basics" },
      {
        type: "p",
        text: "Store session ID server-side; send only the ID to the client (e.g. in a cookie). Use cryptographically random, long session IDs. Invalidate sessions on logout and password change.",
      },
      { type: "h2", text: "Secure Cookie Flags" },
      {
        type: "p",
        text: "HttpOnly – Not accessible via JavaScript; reduces XSS theft. Secure – Sent only over HTTPS. SameSite – Restricts cross-site requests; helps mitigate CSRF.",
      },
      { type: "h2", text: "Best Practices" },
      {
        type: "p",
        text: "Use short session timeouts, bind sessions to IP or user-agent if appropriate, and rotate session IDs on privilege change.",
      },
    ]),
  },
  {
    title: "API authentication patterns (API keys, OAuth2, JWT)",
    content: toPlateValue([
      { type: "h1", text: "API Authentication Patterns" },
      {
        type: "p",
        text: "Common ways to authenticate clients and users to APIs.",
      },
      { type: "h2", text: "API Keys" },
      {
        type: "p",
        text: "Simple tokens for machine-to-machine or low-risk access. Store securely; rotate regularly. Not suitable for end-user auth.",
      },
      { type: "h2", text: "OAuth2" },
      {
        type: "p",
        text: "Delegation framework for authorising third-party access. Supports flows for web apps, mobile, and server-to-server. Prefer Authorization Code (with PKCE) for clients.",
      },
      { type: "h2", text: "JWT (JSON Web Tokens)" },
      {
        type: "p",
        text: "Self-contained tokens with claims and optional signatures. Use short expiry, validate signature and claims, avoid storing sensitive data in payloads.",
      },
      { type: "h2", text: "Choosing a Pattern" },
      {
        type: "p",
        text: "Internal services → API keys or mutual TLS. Third-party integrations → OAuth2. Stateless auth → JWT, with care for revocation and expiry.",
      },
    ]),
  },
  {
    title: "Broken access control and object level authorization",
    content: toPlateValue([
      {
        type: "h1",
        text: "Broken Access Control and Object-Level Authorization",
      },
      {
        type: "p",
        text: "Access control flaws are among the most common and impactful security issues.",
      },
      { type: "h2", text: "Broken Access Control" },
      {
        type: "p",
        text: "Users can perform actions outside their intended permissions. Examples: horizontal privilege escalation, vertical escalation, forced browsing.",
      },
      { type: "h2", text: "Object-Level Authorization (OLA)" },
      {
        type: "p",
        text: "Every request for an object (e.g. a document, order, profile) must be checked against the requesting user's permissions. Missing checks lead to IDOR.",
      },
      { type: "h2", text: "Defensive Measures" },
      {
        type: "p",
        text: "Enforce authorisation on every request. Use a centralised access control layer. Deny by default; grant explicitly. Test with different roles and object IDs.",
      },
    ]),
  },
  {
    title: "Rate limiting, quotas and abuse prevention on endpoints",
    content: toPlateValue([
      { type: "h1", text: "Rate Limiting and Abuse Prevention" },
      {
        type: "p",
        text: "Protect APIs and applications from abuse, enumeration, and denial of service.",
      },
      { type: "h2", text: "Rate Limiting" },
      {
        type: "p",
        text: "Limit the number of requests per client (IP, user, API key) in a time window. Apply to login, signup, and sensitive operations.",
      },
      { type: "h2", text: "Quotas" },
      {
        type: "p",
        text: "Cap usage per tenant or user (e.g. API calls per day). Helps prevent resource exhaustion and cost spikes.",
      },
      { type: "h2", text: "Abuse Prevention" },
      {
        type: "p",
        text: "Throttle or block aggressive scanners. Use CAPTCHA or similar for high-risk endpoints. Monitor for anomalous patterns (e.g. credential stuffing, enumeration).",
      },
    ]),
  },
  {
    title: "File upload handling and deserialization risks",
    content: toPlateValue([
      { type: "h1", text: "File Upload and Deserialization Risks" },
      {
        type: "p",
        text: "Handling file uploads and serialized data introduces distinct attack vectors.",
      },
      { type: "h2", text: "File Upload Risks" },
      {
        type: "p",
        text: "Malicious file types (executables, scripts). Path traversal (../) in filenames. Stored XSS via SVG or HTML. Resource exhaustion with large files.",
      },
      { type: "h2", text: "Mitigations for Uploads" },
      {
        type: "p",
        text: "Validate type (content and extension), store outside webroot, use random names, restrict MIME types, and scan for malware.",
      },
      { type: "h2", text: "Deserialization Risks" },
      {
        type: "p",
        text: "Untrusted serialized data can lead to remote code execution when deserialized with insecure libraries or settings.",
      },
      { type: "h2", text: "Mitigations for Deserialization" },
      {
        type: "p",
        text: "Prefer safe formats (e.g. JSON). Avoid deserializing untrusted data; if required, use strict schemas and hardened parsers.",
      },
    ]),
  },
];

// ---------------------------------------------------------------------------
// Module 3: Identity, Access and Secrets
// ---------------------------------------------------------------------------

const module3Lessons = [
  {
    title: "Authentication factors and strong MFA design",
    content: toPlateValue([
      { type: "h1", text: "Authentication Factors and Strong MFA" },
      {
        type: "p",
        text: "Understanding authentication factors and how to implement robust multi-factor authentication.",
      },
      { type: "h2", text: "Authentication Factors" },
      {
        type: "p",
        text: "Something you know – Password, PIN. Something you have – Token, phone, hardware key. Something you are – Biometrics.",
      },
      { type: "h2", text: "Strong MFA Design" },
      {
        type: "p",
        text: "Combine at least two different factor types. Prefer hardware keys or authenticator apps over SMS. Avoid fallback to single-factor when MFA fails.",
      },
      { type: "h2", text: "Phishing Resistance" },
      {
        type: "p",
        text: "FIDO2/WebAuthn and hardware keys resist phishing because the secret never leaves the device. Push-based MFA is weaker but still better than passwords alone.",
      },
    ]),
  },
  {
    title: "Password storage, credential hygiene and credential stuffing",
    content: toPlateValue([
      { type: "h1", text: "Password Storage and Credential Hygiene" },
      {
        type: "p",
        text: "How to store passwords and defend against credential reuse attacks.",
      },
      { type: "h2", text: "Password Storage" },
      {
        type: "p",
        text: "Use adaptive hashing (e.g. Argon2, bcrypt, scrypt). Salt each password uniquely. Never store plaintext or reversibly encrypted passwords.",
      },
      { type: "h2", text: "Credential Hygiene" },
      {
        type: "p",
        text: "Enforce complexity and length; discourage common passwords. Check new passwords against breach lists. Encourage use of password managers.",
      },
      { type: "h2", text: "Credential Stuffing" },
      {
        type: "p",
        text: "Attackers use leaked credentials from one site to log in elsewhere. Mitigations: MFA, breach checking, rate limiting, and anomaly detection.",
      },
    ]),
  },
  {
    title: "Single sign on concepts and common SSO flows",
    content: toPlateValue([
      { type: "h1", text: "Single Sign-On Concepts and Flows" },
      {
        type: "p",
        text: "How SSO simplifies authentication across multiple applications.",
      },
      { type: "h2", text: "SSO Basics" },
      {
        type: "p",
        text: "Users authenticate once to an identity provider (IdP); the IdP issues tokens or assertions for access to connected applications.",
      },
      { type: "h2", text: "Common Flows" },
      {
        type: "p",
        text: "SAML – XML-based; common in enterprise. OAuth2/OIDC – Modern, REST-friendly. OIDC adds identity layer on top of OAuth2. Kerberos – Ticket-based; used in Windows and some enterprise environments.",
      },
      { type: "h2", text: "Security Considerations" },
      {
        type: "p",
        text: "Protect IdP with strong auth and MFA. Use short-lived tokens and refresh flows. Validate tokens and assertions strictly.",
      },
    ]),
  },
  {
    title: "Role based and attribute based access control models",
    content: toPlateValue([
      { type: "h1", text: "RBAC and ABAC" },
      {
        type: "p",
        text: "Two widely used models for access control.",
      },
      { type: "h2", text: "RBAC (Role-Based Access Control)" },
      {
        type: "p",
        text: "Permissions are assigned to roles; users get roles. Simple and manageable for many organisations. Example: Admin, Developer, Viewer.",
      },
      { type: "h2", text: "ABAC (Attribute-Based Access Control)" },
      {
        type: "p",
        text: "Decisions based on attributes of the user, resource, action, and environment. More flexible but more complex.",
      },
      { type: "h2", text: "When to Use Which" },
      {
        type: "p",
        text: "RBAC – Predictable, role-driven environments. ABAC – Fine-grained, policy-heavy, or dynamic requirements. Hybrid – Use both where appropriate.",
      },
    ]),
  },
  {
    title: "Service accounts, workload identity and machine to machine auth",
    content: toPlateValue([
      { type: "h1", text: "Service Accounts and Machine-to-Machine Auth" },
      {
        type: "p",
        text: "How systems and services authenticate to each other.",
      },
      { type: "h2", text: "Service Accounts" },
      {
        type: "p",
        text: "Dedicated identities for non-human actors (scripts, CI/CD, microservices). Require least privilege and rotation.",
      },
      { type: "h2", text: "Workload Identity" },
      {
        type: "p",
        text: "Cloud-native mechanisms (e.g. IAM roles for service accounts, workload identity federation) to avoid long-lived keys. Credentials are short-lived and scoped.",
      },
      { type: "h2", text: "Machine-to-Machine Auth" },
      {
        type: "p",
        text: "API keys for simple cases. OAuth2 client credentials for server-to-server. mTLS or workload identity where supported.",
      },
    ]),
  },
  {
    title: "Least privilege, just in time and time bound access patterns",
    content: toPlateValue([
      { type: "h1", text: "Least Privilege and Time-Bound Access" },
      {
        type: "p",
        text: "Principles and patterns to minimise standing privilege.",
      },
      { type: "h2", text: "Least Privilege" },
      {
        type: "p",
        text: "Grant only the access needed for the task. Revoke when no longer required.",
      },
      { type: "h2", text: "Just-in-Time (JIT) Access" },
      {
        type: "p",
        text: "Privilege is granted only when requested and approved, for a limited time. Reduces the window for misuse.",
      },
      { type: "h2", text: "Time-Bound Access" },
      {
        type: "p",
        text: "Access expires automatically. Use for temporary elevated rights, break-glass, or time-limited roles.",
      },
    ]),
  },
  {
    title: "Secrets management, vaults and key rotation strategies",
    content: toPlateValue([
      { type: "h1", text: "Secrets Management and Key Rotation" },
      {
        type: "p",
        text: "How to store and rotate credentials and keys securely.",
      },
      { type: "h2", text: "Secrets Management" },
      {
        type: "p",
        text: "Use a dedicated vault (e.g. HashiCorp Vault, cloud-native secrets). Avoid hardcoding secrets in code or config. Encrypt secrets at rest and in transit.",
      },
      { type: "h2", text: "Key Rotation" },
      {
        type: "p",
        text: "Rotate keys and credentials regularly. Automated rotation reduces exposure and operational burden. Plan for zero-downtime rotation where possible.",
      },
    ]),
  },
  {
    title: "Delegation, impersonation and session hijacking risks",
    content: toPlateValue([
      { type: "h1", text: "Delegation, Impersonation, and Session Hijacking" },
      {
        type: "p",
        text: "Risks related to delegated access and session security.",
      },
      { type: "h2", text: "Delegation" },
      {
        type: "p",
        text: "Allowing one principal to act on behalf of another (e.g. OAuth, Kerberos delegation). Scope delegation carefully; avoid overly broad impersonation.",
      },
      { type: "h2", text: "Impersonation" },
      {
        type: "p",
        text: "An attacker assumes another user's identity. Mitigations: strong auth, MFA, audit logging, anomaly detection.",
      },
      { type: "h2", text: "Session Hijacking" },
      {
        type: "p",
        text: "Attacker steals or reuses a valid session (e.g. via XSS, network sniffing, session fixation). Mitigations: HttpOnly/Secure/SameSite cookies, short timeouts, binding to IP or fingerprint, HTTPS everywhere.",
      },
    ]),
  },
];

// ---------------------------------------------------------------------------
// Module 4: Cloud and Infrastructure Security
// ---------------------------------------------------------------------------

const module4Lessons = [
  {
    title: "Network segmentation, VPC design and private connectivity",
    content: toPlateValue([
      { type: "h1", text: "Network Segmentation and VPC Design" },
      {
        type: "p",
        text: "Isolate workloads and limit lateral movement through network design.",
      },
      { type: "h2", text: "Network Segmentation" },
      {
        type: "p",
        text: "Divide the network into zones (e.g. DMZ, app tier, data tier) with controlled traffic between them. Reduces blast radius of compromise.",
      },
      { type: "h2", text: "VPC Design" },
      {
        type: "p",
        text: "Use private subnets for workloads; public subnets only for edge components. Control routing and gateways carefully. Plan CIDR blocks to avoid overlap and support growth.",
      },
      { type: "h2", text: "Private Connectivity" },
      {
        type: "p",
        text: "Use VPC peering, PrivateLink, or VPN to connect environments without exposing traffic to the public internet.",
      },
    ]),
  },
  {
    title: "Security groups, firewalls and basic WAF protections",
    content: toPlateValue([
      { type: "h1", text: "Security Groups, Firewalls, and WAF" },
      {
        type: "p",
        text: "Layered network and application security controls.",
      },
      { type: "h2", text: "Security Groups" },
      {
        type: "p",
        text: "Stateful, instance-level rules (allow/deny by port, protocol, source). Default deny; allow only what is needed.",
      },
      { type: "h2", text: "Firewalls" },
      {
        type: "p",
        text: "Network or host-based. Control traffic between segments. Next-gen firewalls add application awareness and IDS/IPS.",
      },
      { type: "h2", text: "Web Application Firewall (WAF)" },
      {
        type: "p",
        text: "Inspects HTTP/HTTPS traffic to block common attacks (injection, XSS, etc.). Use managed rules and tune for your application to reduce false positives.",
      },
    ]),
  },
  {
    title: "Storage security for buckets, blobs and shared file systems",
    content: toPlateValue([
      { type: "h1", text: "Storage Security" },
      {
        type: "p",
        text: "Securing object storage, blob storage, and shared file systems.",
      },
      { type: "h2", text: "Buckets and Blobs" },
      {
        type: "p",
        text: "Restrict public access; use signed URLs for temporary access. Encrypt at rest (provider-managed or customer-managed keys). Enable versioning and audit logging where available.",
      },
      { type: "h2", text: "Access Control" },
      {
        type: "p",
        text: "Use IAM and bucket policies to enforce least privilege. Avoid overly permissive wildcards. Separate read and write permissions.",
      },
    ]),
  },
  {
    title:
      "Container security and basic Kubernetes security (namespaces, RBAC)",
    content: toPlateValue([
      { type: "h1", text: "Container and Kubernetes Security" },
      {
        type: "p",
        text: "Security considerations for containerised workloads.",
      },
      { type: "h2", text: "Container Security" },
      {
        type: "p",
        text: "Use minimal base images; scan for vulnerabilities. Run as non-root; read-only filesystems where possible. Limit capabilities and avoid privileged mode.",
      },
      { type: "h2", text: "Kubernetes Basics" },
      {
        type: "p",
        text: "Namespaces – Logical isolation; use for multi-tenancy and separation. RBAC – Roles and RoleBindings control who can do what. Audit and minimise cluster-admin usage. Network policies – Restrict pod-to-pod traffic.",
      },
    ]),
  },
  {
    title: "Infrastructure as code and policy as code for security controls",
    content: toPlateValue([
      { type: "h1", text: "Infrastructure as Code and Policy as Code" },
      {
        type: "p",
        text: "Codifying infrastructure and security policy for consistency and auditability.",
      },
      { type: "h2", text: "Infrastructure as Code (IaC)" },
      {
        type: "p",
        text: "Define infrastructure in code (Terraform, Pulumi, CloudFormation). Version control, review, and automate deployment. Reduces drift and manual errors.",
      },
      { type: "h2", text: "Policy as Code" },
      {
        type: "p",
        text: "Encode security rules in code. Use OPA, Checkov, or cloud-native tools to validate IaC and runtime configs before deployment.",
      },
    ]),
  },
  {
    title:
      "Vulnerability management, patching cycles and risk based prioritization",
    content: toPlateValue([
      { type: "h1", text: "Vulnerability Management and Patching" },
      {
        type: "p",
        text: "Systematic approach to identifying and addressing vulnerabilities.",
      },
      { type: "h2", text: "Vulnerability Management" },
      {
        type: "p",
        text: "Discover assets and their software. Scan for known vulnerabilities (CVEs). Assess risk (severity, exploitability, asset criticality). Remediate or accept risk with documentation.",
      },
      { type: "h2", text: "Risk-Based Prioritization" },
      {
        type: "p",
        text: "Focus on high-severity, exploitable vulnerabilities on critical systems first. Use threat intelligence and asset context to prioritise.",
      },
    ]),
  },
  {
    title: "Endpoint hardening and basic EDR style protection concepts",
    content: toPlateValue([
      { type: "h1", text: "Endpoint Hardening and EDR" },
      {
        type: "p",
        text: "Strengthening endpoints and detecting threats on them.",
      },
      { type: "h2", text: "Endpoint Hardening" },
      {
        type: "p",
        text: "Disable unnecessary services and ports. Apply secure configuration baselines (CIS, vendor guidance). Enforce full-disk encryption, screen lock, and device controls.",
      },
      { type: "h2", text: "EDR (Endpoint Detection and Response)" },
      {
        type: "p",
        text: "Monitors process, network, and file activity. Detects malicious behaviour and lateral movement. Provides visibility and response capabilities (isolate, contain, remediate).",
      },
    ]),
  },
  {
    title:
      "Secure configuration baselines for operating systems and cloud services",
    content: toPlateValue([
      { type: "h1", text: "Secure Configuration Baselines" },
      {
        type: "p",
        text: "Standardised secure configurations for OS and cloud services.",
      },
      { type: "h2", text: "Operating Systems" },
      {
        type: "p",
        text: "Use benchmarks from CIS, NIST, or vendors. Disable unused features, harden services, configure logging and audit. Automate with tools like Ansible or Puppet.",
      },
      { type: "h2", text: "Cloud Services" },
      {
        type: "p",
        text: "CIS benchmarks and cloud provider best practices. Enable logging, encryption, and access controls. Restrict default and overly permissive policies.",
      },
    ]),
  },
];

// ---------------------------------------------------------------------------
// Module 5: Detection, Response and Secure Delivery
// ---------------------------------------------------------------------------

const module5Lessons = [
  {
    title: "Key log sources and what to look for in them",
    content: toPlateValue([
      { type: "h1", text: "Key Log Sources" },
      {
        type: "p",
        text: "Where to find security-relevant data and what to look for.",
      },
      { type: "h2", text: "Common Sources" },
      {
        type: "p",
        text: "Authentication logs – Failed logins, privilege changes, new accounts. Network logs – Firewall, proxy, DNS, flow data. Application logs – Errors, access, business events. Endpoint logs – Process creation, file changes, PowerShell. Cloud audit logs – API calls, config changes, access.",
      },
      { type: "h2", text: "What to Look For" },
      {
        type: "p",
        text: "Anomalies and outliers. Known-bad patterns (IOCs, rules). Privilege escalation and lateral movement. Data exfiltration and destructive activity.",
      },
    ]),
  },
  {
    title: "Detection engineering basics and writing useful rules",
    content: toPlateValue([
      { type: "h1", text: "Detection Engineering Basics" },
      {
        type: "p",
        text: "How to build and tune detection rules effectively.",
      },
      { type: "h2", text: "Rule Design" },
      {
        type: "p",
        text: "Focus on behaviour, not just IOCs. Reduce false positives through precise conditions. Document assumptions and context. Test rules against historical and synthetic data.",
      },
      { type: "h2", text: "Tuning and Feedback" },
      {
        type: "p",
        text: "Review alerts; tune or retire rules that don't add value. Incorporate analyst and incident feedback. Balance sensitivity and noise.",
      },
    ]),
  },
  {
    title: "Incident response lifecycle from detection to lessons learned",
    content: toPlateValue([
      { type: "h1", text: "Incident Response Lifecycle" },
      {
        type: "p",
        text: "Structured approach from detection through closure.",
      },
      { type: "h2", text: "Phases" },
      {
        type: "p",
        text: "Preparation – Plans, playbooks, contacts, tools. Detection – Identify potential incidents. Analysis – Triage, scope, and understand impact. Containment – Limit damage (short-term and long-term). Eradication – Remove threat actor and their access. Recovery – Restore normal operations safely. Lessons Learned – Post-incident review, update playbooks and controls.",
      },
    ]),
  },
  {
    title: "Alert triage, severity, escalation paths and ownership",
    content: toPlateValue([
      { type: "h1", text: "Alert Triage and Escalation" },
      {
        type: "p",
        text: "Turn raw alerts into actionable incidents.",
      },
      { type: "h2", text: "Triage" },
      {
        type: "p",
        text: "Confirm the alert is a true positive. Assess scope and impact. Assign severity and owner. Route to the right team or escalate.",
      },
      { type: "h2", text: "Severity" },
      {
        type: "p",
        text: "Use a consistent scale (e.g. Critical, High, Medium, Low, Informational). Consider impact (confidentiality, integrity, availability) and urgency.",
      },
    ]),
  },
  {
    title: "Forensics basics, timelines and preserving evidence safely",
    content: toPlateValue([
      { type: "h1", text: "Forensics Basics" },
      {
        type: "p",
        text: "Collecting and preserving evidence for investigation and potential legal use.",
      },
      { type: "h2", text: "Evidence Preservation" },
      {
        type: "p",
        text: "Avoid modifying original systems when possible. Create forensic copies (images) before analysis. Document chain of custody. Use write blockers and hashing to preserve integrity.",
      },
      { type: "h2", text: "Timelines" },
      {
        type: "p",
        text: "Build timelines of events from logs, file metadata, and artifacts. Correlate across sources to understand the attack sequence.",
      },
    ]),
  },
  {
    title: "Secure coding habits and doing security focused code reviews",
    content: toPlateValue([
      { type: "h1", text: "Secure Coding and Security-Focused Code Reviews" },
      {
        type: "p",
        text: "Building security into the development process.",
      },
      { type: "h2", text: "Secure Coding Habits" },
      {
        type: "p",
        text: "Validate and encode input and output. Use parameterised queries; avoid dynamic SQL. Apply least privilege. Handle errors safely (no information leakage). Keep dependencies updated.",
      },
      { type: "h2", text: "Security-Focused Code Reviews" },
      {
        type: "p",
        text: "Look for OWASP Top 10 and domain-specific risks. Check authentication, authorization, and data handling. Verify crypto usage and key management.",
      },
    ]),
  },
  {
    title: "Security testing in CI pipelines (SAST, DAST, dependency scanning)",
    content: toPlateValue([
      { type: "h1", text: "Security Testing in CI Pipelines" },
      {
        type: "p",
        text: "Automated security checks as part of the build and deployment process.",
      },
      { type: "h2", text: "SAST (Static Application Security Testing)" },
      {
        type: "p",
        text: "Scans source code for vulnerabilities. Integrate early; fix findings before merge. Tune to reduce false positives.",
      },
      { type: "h2", text: "DAST (Dynamic Application Security Testing)" },
      {
        type: "p",
        text: "Tests running applications (e.g. web apps, APIs). Finds runtime issues like misconfigurations and some injection flaws.",
      },
      { type: "h2", text: "Dependency Scanning" },
      {
        type: "p",
        text: "Identifies vulnerable libraries in dependencies. Use Software Composition Analysis (SCA) tools. Block or flag high-severity issues before deployment.",
      },
    ]),
  },
  {
    title:
      "Using scripting and automation to glue tools and reduce manual toil",
    content: toPlateValue([
      { type: "h1", text: "Security Automation and Scripting" },
      {
        type: "p",
        text: "Reduce manual work and human error through automation.",
      },
      { type: "h2", text: "Use Cases" },
      {
        type: "p",
        text: "Orchestrating scans and feeding results into ticketing. Automating containment (e.g. disable user, isolate host). Enriching alerts with context from other systems. Generating reports and dashboards.",
      },
      { type: "h2", text: "Integration" },
      {
        type: "p",
        text: "Connect SIEM, ticketing, SOAR, and asset management. Use APIs and event-driven workflows. Document runbooks and automate repetitive steps.",
      },
    ]),
  },
];

// ---------------------------------------------------------------------------
// IDs and section/lesson data
// ---------------------------------------------------------------------------

const PATHWAY_ID = "pth-cybersecurity-programme";
const COURSE_ID = "crs-cybersecurity-programme";

const sectionData = [
  {
    id: "sec-cyber-1",
    title: "Core Security and Systems Fundamentals",
    order: 1,
    lessons: module1Lessons,
  },
  {
    id: "sec-cyber-2",
    title: "Web and API Security",
    order: 2,
    lessons: module2Lessons,
  },
  {
    id: "sec-cyber-3",
    title: "Identity, Access and Secrets",
    order: 3,
    lessons: module3Lessons,
  },
  {
    id: "sec-cyber-4",
    title: "Cloud and Infrastructure Security",
    order: 4,
    lessons: module4Lessons,
  },
  {
    id: "sec-cyber-5",
    title: "Detection, Response and Secure Delivery",
    order: 5,
    lessons: module5Lessons,
  },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

export async function seedCybersecurityProgramme() {
  console.log("  [cybersecurity-programme] Resolving creator...");
  const [creator] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(inArray(user.role, ["admin", "instructor"]))
    .limit(1);

  if (!creator) {
    throw new Error(
      "No admin or instructor user found. Seed users first (e.g. seed-users-feedback-reports)."
    );
  }

  console.log(
    `  [cybersecurity-programme] Using creator: ${creator.name} (${creator.id})`
  );

  console.log("  [cybersecurity-programme] Inserting pathway...");
  await db
    .insert(pathway)
    .values({
      id: PATHWAY_ID,
      title: "Cybersecurity Programme",
      description:
        "A comprehensive programme covering core security fundamentals, web and API security, identity and access management, cloud and infrastructure security, and detection, response, and secure delivery. Designed to build end-to-end cybersecurity capability from foundations to operational security.",
      slug: "cybersecurity-programme",
      difficulty: "intermediate",
      status: "published",
      createdBy: creator.id,
    })
    .onConflictDoNothing();

  console.log("  [cybersecurity-programme] Inserting course...");
  await db
    .insert(course)
    .values({
      id: COURSE_ID,
      title: "Cybersecurity Programme",
      description:
        "A structured course covering the full spectrum of cybersecurity: from core security fundamentals and web/API security, through identity and secrets management, to cloud infrastructure security, and finally detection, response, and secure delivery practices.",
      summary: courseSummary,
      slug: "cybersecurity-programme-course",
      difficulty: "intermediate",
      status: "published",
      estimatedDuration: 4800, // minutes (~80 hours)
      createdBy: creator.id,
    })
    .onConflictDoNothing();

  // Ensure summary is set (for new inserts and when re-running seed)
  await db
    .update(course)
    .set({ summary: courseSummary })
    .where(eq(course.id, COURSE_ID));

  console.log("  [cybersecurity-programme] Linking pathway to course...");
  await db
    .insert(pathwayCourse)
    .values({
      pathwayId: PATHWAY_ID,
      courseId: COURSE_ID,
      order: 1,
    })
    .onConflictDoNothing();

  console.log("  [cybersecurity-programme] Adding course instructor...");
  await db
    .insert(courseInstructor)
    .values({
      courseId: COURSE_ID,
      userId: creator.id,
      role: "main",
      addedBy: creator.id,
    })
    .onConflictDoNothing();

  let lessonIndex = 0;
  for (const sec of sectionData) {
    console.log(`  [cybersecurity-programme] Inserting section: ${sec.title}`);
    await db
      .insert(section)
      .values({
        id: sec.id,
        courseId: COURSE_ID,
        title: sec.title,
        order: sec.order,
      })
      .onConflictDoNothing();

    for (let i = 0; i < sec.lessons.length; i++) {
      lessonIndex += 1;
      const lec = sec.lessons[i];
      const lessonId = `lsn-cyber-${lessonIndex}`;
      await db
        .insert(lesson)
        .values({
          id: lessonId,
          sectionId: sec.id,
          title: lec.title,
          order: i + 1,
          type: "text",
          estimatedDuration: 10,
          content: lec.content,
        })
        .onConflictDoNothing();
    }
  }

  console.log("  [cybersecurity-programme] Done. 5 sections, 38 lessons.");
}

async function main() {
  console.log("Seeding Cybersecurity Programme...\n");
  await seedCybersecurityProgramme();
  console.log("\nSeed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
