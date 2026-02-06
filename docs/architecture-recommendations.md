# LMS Architecture Recommendations

## Executive Summary

**Recommendation: Use Neon Postgres (Database) + Drizzle ORM for core data, with optional headless CMS for content authoring**

Your existing stack (Next.js + Neon Postgres + Drizzle ORM) is well-suited for an LMS. Use the database for structured learning data and user progress. Consider adding a headless CMS later for non-technical content authors.

---

## 1. CMS vs Database: Recommendation

### **Use Database (Neon Postgres + Drizzle ORM) ✅**

**Why:**
- You already have Neon Postgres and Drizzle ORM configured
- LMS data is highly relational (pathways → modules → sections → lessons)
- Need complex queries (progress tracking, enrollments, prerequisites)
- User-generated data (progress, submissions, quiz answers)
- Real-time features (completion tracking, analytics)

**When to add Headless CMS:**
- Non-technical content authors need to edit content
- Rich media management (videos, images) at scale
- Multi-channel content delivery (web + mobile app)
- Content versioning and workflow approvals

**Hybrid Approach (Best of Both):**
- **Database**: Structure, relationships, user data, progress
- **Headless CMS**: Rich content (article body, video metadata, descriptions)
- **CDN/Storage**: Video files, images (S3, Cloudflare R2, Vercel Blob)

---

## 2. What to Hardcode vs Store in Database

### ✅ **Hardcode (Static/Config)**

**Navigation & Site Structure:**
- Navbar links (Blog, Courses, Pathway)
- Footer links and content
- Site-wide settings (contact info, social links)
- Route definitions
- Page layouts and component structure

**Design System:**
- UI components (already in `components/ui/`)
- Theme tokens and colors
- Typography scales
- Spacing system

**Static Content:**
- Homepage hero text (unless you want A/B testing)
- Legal pages (Terms, Privacy Policy) - unless frequently updated
- FAQ answers (unless user-generated)

**Why:** These change infrequently and don't need database queries. Keep them in code for performance and simplicity.

---

### 🗄️ **Store in Database (Dynamic/User Data)**

#### **Core Learning Content** (High Priority)

```typescript
// Schema structure
pathways
  ├── id, title, description, slug
  ├── estimated_duration, level, certifications[]
  └── courses[] (many-to-many)

courses
  ├── id, title, description, slug
  ├── category, level, price, duration
  ├── instructor_id, thumbnail_url
  └── modules[] (one-to-many)

modules
  ├── id, course_id, title, order
  └── sections[] (one-to-many)

sections
  ├── id, module_id, title, order
  └── lessons[] (one-to-many)

lessons
  ├── id, section_id, title, order
  ├── type: 'article' | 'video' | 'image' | 'quiz' | 'mixed'
  ├── content (JSON or text)
  ├── duration, video_url, article_content
  └── quiz_questions[] (if type is quiz)

quiz_questions
  ├── id, lesson_id, question_text
  ├── type: 'multiple_choice' | 'multiselect' | 'text'
  ├── options[] (JSON)
  └── correct_answer (JSON)
```

**Why:** This is your core product. Needs versioning, relationships, and dynamic queries.

#### **User Data & Progress** (Critical)

```typescript
users
  ├── id, email, name, role
  └── enrollments[]

enrollments
  ├── id, user_id, course_id, pathway_id
  ├── enrolled_at, completed_at
  └── progress[]

progress
  ├── id, user_id, lesson_id
  ├── completed_at, score (for quizzes)
  └── time_spent
```

**Why:** Essential for tracking learning progress, certificates, and analytics.

#### **Content Metadata** (Medium Priority)

```typescript
blog_posts
  ├── id, title, slug, content
  ├── author_id, published_at, featured_image
  └── tags[]

instructors
  ├── id, name, bio, photo_url
  └── courses[]

certifications
  ├── id, name, issuer, description
  └── pathways[]
```

**Why:** Dynamic content that changes frequently and needs relationships.

---

### 🔄 **Consider CMS Later** (Optional)

**Rich Content Bodies:**
- Long-form article content (markdown/rich text)
- Video descriptions and transcripts
- Course descriptions (if non-technical authors)

**Media Assets:**
- Video files (use CDN/storage, not database)
- Images and thumbnails
- PDFs and downloadable resources

**Why:** CMS excels at rich text editing and media management, but adds complexity. Start with database + markdown, add CMS when content team grows.

---

## 3. How Other Cybersecurity LMS Platforms Store Data

### **Industry Patterns:**

#### **1. Moodle (Open Source LMS)**
- **Database**: PostgreSQL/MySQL with ~200 tables
- **Structure**: Courses → Sections → Activities (lessons, quizzes, assignments)
- **Key Tables**: `mdl_course`, `mdl_course_modules`, `mdl_quiz`, `mdl_quiz_attempts`
- **Approach**: Pure database, no CMS

#### **2. Adobe Learning Manager**
- **Architecture**: Multi-server cloud architecture
- **Storage**: Database for structure + CDN for media
- **Security**: Defense-in-depth with encrypted passwords, role-based access
- **Approach**: Database + external storage for media

#### **3. Pluralsight / Cybrary**
- **Structure**: Paths → Courses → Modules → Lessons
- **Storage**: Database for metadata + CDN for video streaming
- **Content**: Video-first with transcripts and quizzes
- **Approach**: Database + video CDN (AWS CloudFront, etc.)

#### **4. Modern Headless LMS (e.g., built with Strapi)**
- **CMS**: Strapi/Contentful for content authoring
- **Database**: Still uses database for user data and progress
- **Hybrid**: CMS for content, database for relationships and user data

**Common Pattern:** Database for structure + relationships, CDN for media, optional CMS for authoring.

---

## 4. Recommended Database Schema (Drizzle ORM)

### **Core Tables**

```typescript
// lib/db/schema.ts
import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Pathways
export const pathways = pgTable("pathways", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  estimatedDuration: integer("estimated_duration"), // minutes
  level: text("level"), // 'beginner' | 'intermediate' | 'advanced'
  certifications: jsonb("certifications"), // array of certification names
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: text("category"), // 'comptia' | 'isc2' | etc.
  level: text("level"),
  price: integer("price"), // in pence/cents
  duration: integer("duration"), // minutes
  instructorId: integer("instructor_id").references(() => instructors.id),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pathway-Course relationship (many-to-many)
export const pathwayCourses = pgTable("pathway_courses", {
  id: serial("id").primaryKey(),
  pathwayId: integer("pathway_id").references(() => pathways.id),
  courseId: integer("course_id").references(() => courses.id),
  order: integer("order").notNull(),
});

// Modules
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

// Sections
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

// Lessons
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").references(() => sections.id),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  type: text("type").notNull(), // 'article' | 'video' | 'image' | 'quiz' | 'mixed'
  content: jsonb("content"), // flexible JSON for different lesson types
  duration: integer("duration"), // minutes
  videoUrl: text("video_url"),
  articleContent: text("article_content"), // markdown or HTML
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quiz Questions
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id),
  questionText: text("question_text").notNull(),
  type: text("type").notNull(), // 'multiple_choice' | 'multiselect' | 'text'
  options: jsonb("options").notNull(), // array of { id, label, isCorrect }
  correctAnswer: jsonb("correct_answer").notNull(),
  order: integer("order").notNull(),
});

// Users (if not using Better Auth's user table)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").default("student"), // 'student' | 'instructor' | 'admin'
});

// Enrollments
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  pathwayId: integer("pathway_id").references(() => pathways.id),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Progress Tracking
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  lessonId: integer("lesson_id").references(() => lessons.id),
  completedAt: timestamp("completed_at"),
  score: integer("score"), // for quizzes
  timeSpent: integer("time_spent"), // seconds
});

// Instructors
export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
});

// Blog Posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"), // markdown
  excerpt: text("excerpt"),
  authorId: integer("author_id").references(() => users.id),
  featuredImageUrl: text("featured_image_url"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const pathwayRelations = relations(pathways, ({ many }) => ({
  pathwayCourses: many(pathwayCourses),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
  instructor: one(instructors, {
    fields: [courses.instructorId],
    references: [instructors.id],
  }),
  modules: many(modules),
  pathwayCourses: many(pathwayCourses),
  enrollments: many(enrollments),
}));

export const moduleRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  sections: many(sections),
}));

export const sectionRelations = relations(sections, ({ one, many }) => ({
  module: one(modules, {
    fields: [sections.moduleId],
    references: [modules.id],
  }),
  lessons: many(lessons),
}));

export const lessonRelations = relations(lessons, ({ one, many }) => ({
  section: one(sections, {
    fields: [lessons.sectionId],
    references: [sections.id],
  }),
  quizQuestions: many(quizQuestions),
  progress: many(progress),
}));
```

---

## 5. Implementation Phases

### **Phase 1: MVP (Database Only)**
1. ✅ Set up Drizzle schema (as above)
2. ✅ Create migrations
3. ✅ Build API routes (tRPC or Next.js API routes)
4. ✅ Seed initial data (courses, pathways)
5. ✅ Build course listing and detail pages

**Storage:** Database for everything, markdown files for article content (or JSONB)

### **Phase 2: Content Management**
1. Build admin dashboard for content authors
2. Add rich text editor (TipTap, Lexical)
3. Add video upload (Vercel Blob or S3)
4. Add image management

**Storage:** Database + CDN/storage for media

### **Phase 3: Scale (Optional CMS)**
1. Evaluate headless CMS (Strapi, Payload CMS)
2. Migrate content authoring to CMS
3. Keep database for structure and user data
4. Sync CMS content to database via webhooks

**Storage:** Hybrid (CMS for authoring, database for runtime)

---

## 6. Specific Recommendations for Your Stack

### **Current Setup:**
- ✅ Next.js 16 (App Router)
- ✅ Neon Postgres
- ✅ Drizzle ORM
- ✅ Better Auth (for authentication)

### **Recommended Additions:**

1. **tRPC** (already in dependencies)
   - Type-safe API layer
   - Perfect for complex queries (pathway → courses → modules → lessons)

2. **Vercel Blob** or **Cloudflare R2**
   - For video and image storage
   - CDN delivery

3. **Markdown for Articles**
   - Store article content as markdown in database
   - Render with `react-markdown` or `MDX`
   - Simple, no CMS needed initially

4. **Admin Dashboard** (Future)
   - Build custom admin with your UI components
   - Or use Payload CMS (self-hosted, TypeScript-first)

---

## 7. Decision Matrix

| Feature | Hardcode | Database | CMS |
|---------|----------|----------|-----|
| Navbar/Footer | ✅ | ❌ | ❌ |
| Course structure | ❌ | ✅ | ❌ |
| Lesson content | ❌ | ✅ | ⚠️ Later |
| User progress | ❌ | ✅ | ❌ |
| Video files | ❌ | ❌ | ✅ CDN |
| Blog posts | ❌ | ✅ | ⚠️ Later |
| Site config | ✅ | ❌ | ❌ |
| Quiz questions | ❌ | ✅ | ❌ |

---

## 8. Next Steps

1. **Start with Database**
   - Create Drizzle schema (use example above)
   - Generate migrations: `bunx drizzle-kit generate`
   - Seed initial data

2. **Build Core Pages**
   - `/courses` - list from database
   - `/courses/[slug]` - detail from database
   - `/pathway/[slug]` - show courses in pathway

3. **Add Progress Tracking**
   - Track lesson completion
   - Show progress indicators

4. **Add Content Management Later**
   - Build admin dashboard when needed
   - Or integrate CMS when content team grows

---

## Summary

**Start simple:** Database (Neon + Drizzle) for everything. This gives you:
- Full control over data structure
- Complex queries and relationships
- User progress tracking
- No vendor lock-in

**Add CMS later** if:
- Non-technical authors need to edit content
- You need content versioning/workflows
- Multi-channel delivery (web + mobile)

Your current stack is perfect for an LMS. Focus on building the core learning experience first, optimize for content management later.

---

## Migration Status

**Mock DB to Neon Postgres migration: Complete**

All data previously stored in the `mock-db/` directory has been migrated to Neon Postgres via Drizzle ORM schemas, migrations, and a seed script. The `mock-db/` directory has been removed.

**Current schema**: `instructor`, `course` (with modules/sections/lessons/reviews), `pathway` (with junction table), `author`, `blog_post`, `faq`, `feature`, `testimonial` — all in `packages/db/schema/`.

**Data fetching**: All pages use React Server Components with direct database queries from `packages/db/queries/`. No client-side data fetching waterfalls for initial page loads.

**Image storage**: URLs stored as `text` columns in Postgres. Files currently served from `/public/images/`. Production recommendation: Vercel Blob, Cloudflare R2, or AWS S3.
