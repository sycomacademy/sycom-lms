/**
 * Analytics event names following the convention: category:event_name
 * Categories: auth, enrollment, course, org, settings, system
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
  passkeySignInStarted: "auth:passkey_sign_in_started",
  passkeySignInSuccess: "auth:passkey_sign_in_success",
  passkeySignInFailed: "auth:passkey_sign_in_failed",
  ssoSignInSuccess: "auth:sso_sign_in_success",

  // Enrollment (student learning flow)
  enrollmentCourseStarted: "enrollment:course_started",
  enrollmentLessonCompleted: "enrollment:lesson_completed",
  enrollmentCourseCompleted: "enrollment:course_completed",
  enrollmentLessonTimeSpent: "enrollment:lesson_time_spent",

  // Course (creator/admin actions)
  courseCreated: "course:created",
  courseDeleted: "course:deleted",
  coursePublished: "course:published",
  courseUnpublished: "course:unpublished",
  courseLessonAdded: "course:lesson_added",
  courseLessonDeleted: "course:lesson_deleted",
  courseCocreatorAdded: "course:cocreator_added",
  courseCocreatorRemoved: "course:cocreator_removed",

  // Org
  memberInvited: "org:member_invited",

  // Settings
  settingsPasswordChanged: "settings:password_changed",
  settings2faEnabled: "settings:2fa_enabled",
  settings2faDisabled: "settings:2fa_disabled",
  settingsPasskeyRegistered: "settings:passkey_registered",
  settingsPasskeyRemoved: "settings:passkey_removed",
  settingsOauthLinked: "settings:oauth_linked",
  settingsOauthUnlinked: "settings:oauth_unlinked",

  // System
  healthCheckBlocked: "system:health_check_blocked",
  healthDependenciesNotOk: "system:health_dependencies_not_ok",
} as const;

export type AnalyticsEventName =
  (typeof analyticsEvents)[keyof typeof analyticsEvents];
