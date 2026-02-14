import { account, session, user, verification } from "./auth";
import { feedback } from "./feedback";
import { files, uploadSessions } from "./files";
import { profile } from "./profile";
import { report } from "./report";

export const schema = {
  account,
  feedback,
  files,
  profile,
  report,
  session,
  uploadSessions,
  user,
  verification,
};
