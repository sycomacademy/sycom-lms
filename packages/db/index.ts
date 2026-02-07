import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/packages/env/server";
import { account, session, user, verification } from "./schema/auth";
import { author, blogPost } from "./schema/blog";
import {
  course,
  courseLesson,
  courseModule,
  courseReview,
  courseSection,
  quizQuestion,
} from "./schema/course";
import { enrollment, wishlist } from "./schema/enrollment";
import { faq } from "./schema/faq";
import { feature } from "./schema/feature";
import { fileMetadata } from "./schema/file-metadata";
import { instructor } from "./schema/instructor";
import { pathway, pathwayCourse } from "./schema/pathway";
import { profile } from "./schema/profile";
import { lessonProgress, quizAttempt } from "./schema/progress";
import { testimonial } from "./schema/testimonial";

// import ws from "ws";
// neonConfig.webSocketConstructor = ws;
// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
// neonConfig.poolQueryViaFetch = true;

const sql = neon(env.DATABASE_URL);
export const schema = {
  user,
  session,
  account,
  verification,
  profile,
  instructor,
  course,
  courseModule,
  courseSection,
  courseLesson,
  courseReview,
  quizQuestion,
  enrollment,
  wishlist,
  lessonProgress,
  quizAttempt,
  pathway,
  pathwayCourse,
  author,
  blogPost,
  faq,
  feature,
  fileMetadata,
  testimonial,
};
export const db = drizzle(sql, { schema });
