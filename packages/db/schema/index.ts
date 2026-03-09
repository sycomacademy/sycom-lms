import {
  account,
  accountRelations,
  cohort,
  cohort_member,
  cohort_memberRelations,
  cohortRelations,
  invitation,
  invitationRelations,
  member,
  memberRelations,
  organization,
  organizationRelations,
  organizationRoleEnum,
  passkey,
  passkeyRelations,
  scimProvider,
  scimProviderRelations,
  session,
  sessionRelations,
  ssoProvider,
  ssoProviderRelations,
  twoFactor,
  twoFactorRelations,
  user,
  userRelations,
  userRoleEnum,
  verification,
} from "./auth";
import { blogPost, blogPostRelations } from "./blog";
import {
  category,
  categoryRelations,
  course,
  courseCategory,
  courseCategoryRelations,
  courseInstructor,
  courseInstructorRelations,
  courseRelations,
  lesson,
  lessonRelations,
  section,
  sectionRelations,
} from "./course";
import {
  cohortLessonSettings,
  cohortLessonSettingsRelations,
  cohortSectionSettings,
  cohortSectionSettingsRelations,
  courseAssignment,
  courseAssignmentRelations,
  enrollment,
  enrollmentRelations,
  lessonProgress,
  lessonProgressRelations,
} from "./enrollment";
import {
  orgCourseEntitlement,
  orgCourseEntitlementRelations,
} from "./entitlement";
import {
  feedback,
  feedbackRelations,
  report,
  reportRelations,
} from "./feedback";
import { profile, profileRelations } from "./profile";
import { publicInvite, publicInviteRelations } from "./public-invite";
import {
  mediaAsset,
  storageEntityTypeEnum,
  storageFolderEnum,
  storageResourceTypeEnum,
} from "./storage";

const schema = {
  userRoleEnum,
  organizationRoleEnum,
  account,
  accountRelations,
  cohort,
  cohortRelations,
  cohort_member,
  cohort_memberRelations,
  invitation,
  invitationRelations,
  member,
  memberRelations,
  organization,
  organizationRelations,
  passkey,
  passkeyRelations,
  twoFactor,
  twoFactorRelations,
  scimProvider,
  scimProviderRelations,
  session,
  sessionRelations,
  ssoProvider,
  ssoProviderRelations,
  user,
  userRelations,
  verification,

  // public invites
  publicInvite,
  publicInviteRelations,

  // profile
  profile,
  profileRelations,

  // feedback
  feedback,
  feedbackRelations,

  // report
  report,
  reportRelations,

  // storage
  mediaAsset,
  storageEntityTypeEnum,
  storageFolderEnum,
  storageResourceTypeEnum,

  // blog
  blogPost,
  blogPostRelations,

  // course (authoring)
  category,
  categoryRelations,
  course,
  courseRelations,
  courseCategory,
  courseCategoryRelations,
  courseInstructor,
  courseInstructorRelations,
  section,
  sectionRelations,
  lesson,
  lessonRelations,

  // enrollment (delivery + learning)
  courseAssignment,
  courseAssignmentRelations,
  enrollment,
  enrollmentRelations,
  lessonProgress,
  lessonProgressRelations,
  cohortSectionSettings,
  cohortSectionSettingsRelations,
  cohortLessonSettings,
  cohortLessonSettingsRelations,

  // entitlements (org course access)
  orgCourseEntitlement,
  orgCourseEntitlementRelations,
};

export { schema };
