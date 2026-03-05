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
import { feedback, feedbackRelations } from "./feedback";
import { profile, profileRelations } from "./profile";
import { report, reportRelations } from "./report";
import {
  mediaAsset,
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
  storageFolderEnum,
  storageResourceTypeEnum,
};

export { schema };
