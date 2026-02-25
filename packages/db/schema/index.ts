import {
  account,
  passkey,
  session,
  twoFactor,
  user,
  verification,
} from "./auth";
import { author, blogPost } from "./blog";
import {
  category,
  course,
  courseCategory,
  courseInstructor,
  enrollment,
  lesson,
  lessonCompletion,
  pathway,
  pathwayCourse,
  section,
} from "./course";
import { faq } from "./faq";
import { feature } from "./feature";
import { feedback } from "./feedback";
import { files, uploadSessions } from "./files";
import { profile } from "./profile";
import { report } from "./report";

export const schema = {
  account,
  author,
  blogPost,
  category,
  course,
  courseCategory,
  courseInstructor,
  enrollment,
  faq,
  feedback,
  feature,
  files,
  lesson,
  lessonCompletion,
  pathway,
  pathwayCourse,
  profile,
  report,
  section,
  session,
  passkey,
  twoFactor,
  uploadSessions,
  user,
  verification,
};
