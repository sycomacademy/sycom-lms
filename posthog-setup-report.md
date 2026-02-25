<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Sycom LMS project. The following changes were made:

- **`instrumentation-client.ts`** (new) — Initialises PostHog client-side using the Next.js 15.3+ `instrumentation-client` convention. Enables automatic pageview tracking, session replay, and unhandled exception capture via `capture_exceptions: true`. Requests are routed through the EU-region reverse proxy to reduce ad-blocker interception.
- **`lib/posthog-server.ts`** (new) — Singleton server-side PostHog client using `posthog-node`, configured with `flushAt: 1` and `flushInterval: 0` for immediate event flushing, which is essential for short-lived Next.js server functions and Server Actions.
- **`next.config.ts`** (edited) — Added EU-region reverse proxy rewrites (`/ingest/*` → `https://eu.i.posthog.com/*`) and `skipTrailingSlashRedirect: true` to support PostHog's trailing-slash API requests without redirect loops.
- **`components/auth/sign-in-form.tsx`** (edited) — Calls `posthog.identify()` and captures `user_signed_in` on successful login; captures `user_sign_in_failed` with the error message on failure.
- **`components/auth/sign-up-form.tsx`** (edited) — Calls `posthog.identify()` and captures `user_signed_up` with name and email on successful registration.
- **`components/auth/forgot-password-form.tsx`** (edited) — Captures `password_reset_requested` after a successful password-reset email request.
- **`components/dashboard/courses/create-course-form.tsx`** (edited) — Captures `course_created` on instructor course creation success, including course ID, title, slug, difficulty, and category count.
- **`components/dashboard/library/library-list.tsx`** (edited) — Captures `course_enrolled` on successful course enrollment (with course ID); captures `library_searched` when a user enters a non-empty search query.
- **`components/dashboard/feedback-form.tsx`** (edited) — Captures `feedback_submitted` on successful feedback submission, including message length.
- **`components/dashboard/support/actions.ts`** (edited) — Server-side: captures `report_submitted` (with report type and screenshot flag) on success; captures `report_submission_failed` (with error message) on failure. Uses `distinct_id` from the authenticated session to correlate server events with client-side events.

| Event name | Description | File |
|---|---|---|
| `user_signed_up` | User successfully creates a new account | `components/auth/sign-up-form.tsx` |
| `user_signed_in` | User successfully signs in with email/password | `components/auth/sign-in-form.tsx` |
| `user_sign_in_failed` | User's sign-in attempt fails | `components/auth/sign-in-form.tsx` |
| `password_reset_requested` | User requests a password reset email | `components/auth/forgot-password-form.tsx` |
| `course_created` | Instructor successfully creates a new course | `components/dashboard/courses/create-course-form.tsx` |
| `course_enrolled` | User successfully enrolls in a course from the library | `components/dashboard/library/library-list.tsx` |
| `library_searched` | User performs a search in the course library | `components/dashboard/library/library-list.tsx` |
| `feedback_submitted` | User submits in-app feedback | `components/dashboard/feedback-form.tsx` |
| `report_submitted` | User submits a support report (server-side) | `components/dashboard/support/actions.ts` |
| `report_submission_failed` | Support report submission fails on the server (server-side) | `components/dashboard/support/actions.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- 📊 **Dashboard — Analytics basics**: https://eu.posthog.com/project/131830/dashboard/540561
- 🔽 **User Acquisition Funnel** (Sign Up → Sign In → Course Enroll): https://eu.posthog.com/project/131830/insights/fYyFfc72
- 📈 **Sign-ups & Sign-ins Over Time**: https://eu.posthog.com/project/131830/insights/y6o6C5HM
- 📈 **Course Activity: Enrollments & Creations**: https://eu.posthog.com/project/131830/insights/c0iDgZNH
- ⚠️ **Error & Failure Events**: https://eu.posthog.com/project/131830/insights/EuhhyPOi
- 📊 **User Engagement: Feedback & Support Reports**: https://eu.posthog.com/project/131830/insights/YDd0j01z

### Agent skill

We've left an agent skill folder in your project at `.cursor/skills/posthog-integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
