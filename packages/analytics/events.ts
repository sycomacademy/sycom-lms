/**
 * Analytics event names following the convention: category:event_name
 * Categories: auth, course, org, system
 */
export const analyticsEvents = {
  // Auth
  signIn: "auth:login_success",
  signInFailed: "auth:login_failed",
  signOut: "auth:sign_out",
  signUp: "auth:signup_completed",
  signUpFailed: "auth:signup_failed",
  passwordResetRequested: "auth:password_reset_requested",
  passwordResetRequestedFailed: "auth:password_reset_requested_failed",
  passwordResetCompleted: "auth:password_reset_completed",
  oauthSignInStarted: "auth:oauth_sign_in_started",
  oauthSignInFailed: "auth:oauth_sign_in_failed",
  oauthSignInSuccess: "auth:oauth_sign_in_success",

  // Course
  lessonStarted: "course:lesson_started",
  lessonCompleted: "course:lesson_completed",
  quizSubmitted: "course:quiz_submitted",

  // Org
  memberInvited: "org:member_invited",

  // System
  healthCheckBlocked: "system:health_check_blocked",
  healthDependenciesNotOk: "system:health_dependencies_not_ok",
} as const;

export type AnalyticsEventName =
  (typeof analyticsEvents)[keyof typeof analyticsEvents];
