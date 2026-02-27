export const analyticsEvents = {
  signIn: "user_signed_in",
  signInFailed: "user_sign_in_failed",
  signOut: "user_signed_out",
  signUp: "user_signed_up",
  signUpFailed: "user_sign_up_failed",
  passwordResetRequested: "password_reset_requested",
  passwordResetCompleted: "password_reset_completed",
  oauthSignInStarted: "oauth_sign_in_started",
  oauthSignInFailed: "oauth_sign_in_failed",
  healthCheckBlocked: "health_check_blocked",
  healthDependenciesNotOk: "health_dependencies_not_ok",
} as const;

export type AnalyticsEventName =
  (typeof analyticsEvents)[keyof typeof analyticsEvents];
