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
} from "./schema/course";
import { faq } from "./schema/faq";
import { feature } from "./schema/feature";
import { instructor } from "./schema/instructor";
import { pathway, pathwayCourse } from "./schema/pathway";
import { profile } from "./schema/profile";
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
  pathway,
  pathwayCourse,
  author,
  blogPost,
  faq,
  feature,
  testimonial,
};
export const db = drizzle(sql, { schema });
