import { BlogPreview } from "@/components/landing/blog-preview";
import { CoursesPreview } from "@/components/landing/courses-preview";
import { Cta } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Partners } from "@/components/landing/partners";
import { Stats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getQueryClient, trpc } from "@/packages/trpc/server";

export default async function HomePage() {
  const queryClient = getQueryClient();

  const [{ posts }, { courses }] = await Promise.all([
    queryClient.fetchQuery(
      trpc.blog.listPublic.queryOptions({ limit: 3, offset: 0 })
    ),
    queryClient.fetchQuery(
      trpc.course.listPublic.queryOptions({ limit: 3, offset: 0 })
    ),
  ]);

  return (
    <div>
      <Header />
      <Hero />
      <Partners />
      <Stats />
      <Features />
      <HowItWorks />
      <CoursesPreview courses={courses} />
      <Testimonials />
      <BlogPreview posts={posts} />
      <Faq />
      <Cta />
      <Footer />
    </div>
  );
}
