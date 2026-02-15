import { account, session, user, verification } from "./auth";
import {
  course,
  courseInstructor,
  enrollment,
  lesson,
  lessonCompletion,
  pathway,
  pathwayCourse,
  section,
} from "./course";
import { feedback } from "./feedback";
import { files, uploadSessions } from "./files";
import { profile } from "./profile";
import { report } from "./report";

export const schema = {
  account,
  course,
  courseInstructor,
  enrollment,
  feedback,
  files,
  lesson,
  lessonCompletion,
  pathway,
  pathwayCourse,
  profile,
  report,
  section,
  session,
  uploadSessions,
  user,
  verification,
};
