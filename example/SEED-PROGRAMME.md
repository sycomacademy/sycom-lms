# Programme Seed: Workflows & Edge Cases

Run the programme seed to populate example orgs, people, courses, cohorts, enrollments, and progress:

```bash
bun run db:seed
bun run db:seed:programme
```

## Seeded Data

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 7 | admin, creator, 5 students |
| Orgs | 2 + Platform | Acme Security Academy, TechCorp Training |
| Cohorts | 3 | Acme General, Acme Advanced Track, TechCorp General |
| Courses | 3 | Intro Cybersecurity, Network Essentials, Web Security |
| Enrollments | 3 | Alice, Bob, Eve in Intro Security |
| Lesson completions | 1 | Alice completed first lesson of Intro |

### Users & Roles

| Email | Platform Role | Acme | TechCorp |
|-------|---------------|------|----------|
| admin@seed.example.com | platform_admin | org_owner | — |
| creator@seed.example.com | content_creator | org_admin | org_owner |
| alice@seed.example.com | platform_student | org_teacher | — |
| bob@seed.example.com | platform_student | org_student | — |
| carol@seed.example.com | platform_student | — | org_teacher |
| dave@seed.example.com | platform_student | org_student | — |
| eve@seed.example.com | platform_student | — | org_student |

All seed users are also members of the **Platform** org (General cohort).

## Sign-in for Seed Users

Seed users have **no password** by default. To sign in:

1. Go to **Forgot password** and enter a seed email (e.g. `admin@seed.example.com`).
2. Check your inbox (or mail logs if using a dev SMTP) for the reset link.
3. Set a password and sign in.

Alternatively, create new users via **Admin > Users** and use those for testing.

---

## Workflows You Can Test

### 1. Org switching and org-scoped dashboard

**Flow:** Sign in as a user who belongs to multiple orgs (e.g. `admin` or `creator`).

1. Use the **org switcher** in the sidebar to switch between Platform, Acme Security, and TechCorp.
2. When you switch to Acme or TechCorp, you are redirected to `/dashboard/org/{org-slug}`.
3. Verify the Overview shows the correct member and cohort counts for that org.

**Edge case:** If you sign in as a user with only Platform membership (e.g. a fresh sign-up), you won’t see Acme/TechCorp in the switcher until you’re invited or added.

### 2. People management

**Flow:** Sign in as `admin@seed.example.com` or `creator@seed.example.com`, switch to Acme.

1. Go to **People**. You should see Alice, Bob, Dave, and yourself.
2. As org_owner/org_admin, you can change roles (e.g. Bob: org_student → org_teacher).
3. Invite a new member via **Invite member** (requires email sending to be configured).

**Edge case:** Org teachers see only cohorts they belong to. If Carol (org_teacher in TechCorp) is in no cohort, she sees an empty Cohorts list until added to one.

### 3. Cohorts and course assignment

**Flow:** Sign in as Acme admin/creator, go to **Cohorts**.

1. Expand **General** and **Advanced Track**. General has Intro Security + Network Basics; Advanced has Web Security.
2. Use **Assign course** to add another published course to a cohort.
3. Use **×** to unassign a course.
4. Teachers can see cohort members and assigned courses for cohorts they’re in.

**Edge case:** A cohort with no assigned courses shows an empty list. Assigning requires at least one **published** course to exist.

### 4. Course progress and lesson completion

**Flow:** Sign in as `alice@seed.example.com`, switch to Platform (or Acme).

1. Alice is enrolled in Intro Security and has completed the first lesson.
2. Go to the course/journey area and confirm progress is reflected.
3. Complete more lessons to test progress updates.

**Edge case:** Bob and Eve are enrolled but have no completions. Enrollments exist without cohort assignment; cohort assignment controls which org members see the course in their org context.

### 5. Platform admin overview

**Flow:** Sign in as `admin@seed.example.com` **without** switching to an org (or with Platform selected).

1. As platform_admin with no org context, you see the Admin Overview.
2. Use Admin sections to manage users, organizations, feedback, reports.
3. Create a new org via Admin > Organizations; the owner email must match an existing user.

**Edge case:** content_creator cannot create orgs; only platform_admin can. `allowUserToCreateOrganization` restricts this.

### 6. Teacher vs student visibility

**Flow:** Compare views as teacher vs student.

- **Alice** (org_teacher in Acme): Can see all cohorts she’s in, manage cohort members for those cohorts.
- **Bob** (org_student in Acme): Limited to student view; no cohort management.
- **Carol** (org_teacher in TechCorp): Sees TechCorp cohorts she’s in; if in none, Cohorts is empty.

---

## Edge Cases to Watch For

### Auth & sessions

- **No active org:** Some flows assume `activeOrganizationId` is set. Session hooks set Platform when it’s null; if that fails, you may be redirected unexpectedly.
- **Seed users without account:** Seed users exist in `user` but may have no `account` row. “Forgot password” creates the account when they set a password.

### Orgs and members

- **Platform org:** Slug `platform` is special. Redirects avoid sending users to `/dashboard/org/platform`; they stay on `/dashboard`.
- **Duplicate membership:** A user can be in multiple orgs with different roles. Switching orgs changes `activeOrganizationId` and the effective org context.
- **Cohort without members:** Empty cohorts are valid. Teachers in no cohort see an empty Cohorts list.

### Courses and cohorts

- **Unassigned courses:** Courses exist globally. Org-specific behavior comes from `cohort_course`; a course not assigned to any cohort won’t appear in org cohort UI.
- **Draft vs published:** Only published courses appear in “Assign course”. Draft courses are hidden from assignment.
- **Category dependency:** The programme seed relies on a `cybersecurity` category. Run `db:seed` first so categories exist.

### Enrollments and progress

- **Enrollment vs cohort:** Enrollments link users to courses. Cohort assignment links courses to org cohorts. Both can exist independently.
- **Lesson completion uniqueness:** One completion per (user, lesson). Re-running the seed uses `onConflictDoNothing` to avoid duplicates.

### Idempotency

- The seed is idempotent: fixed IDs and `onConflictDoNothing` mean you can run it multiple times without creating duplicates.
- Changing seed data (e.g. new emails) can create additional rows; consider clearing seed data before re-seeding if you want a clean state.
