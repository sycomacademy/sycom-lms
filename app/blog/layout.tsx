import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
