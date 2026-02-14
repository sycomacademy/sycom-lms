import { account, session, user, verification } from "./auth";
import { feedback } from "./feedback";
import { files, uploadSessions } from "./files";
import { profile } from "./profile";

export const schema = {
  account,
  feedback,
  files,
  profile,
  session,
  uploadSessions,
  user,
  verification,
};
