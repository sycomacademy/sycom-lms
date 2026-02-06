import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getAllCourses } from "@/packages/db/queries/course";
import { CoursesContent } from "./courses-content";

export default async function CoursesPage() {
  const courses = await getAllCourses();

  return (
    <>
      <Header />
      <main>
        <CoursesContent courses={courses} />
      </main>
      <Footer />
    </>
  );
}
