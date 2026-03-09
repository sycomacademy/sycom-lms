import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import type { Route } from "next";
import { FacebookLogo } from "@/components/icons/logos/facebook";
import { InstagramLogo } from "@/components/icons/logos/instagram";
import { LinkedinLogo } from "@/components/icons/logos/linkedin";
import { TwitterLogo } from "@/components/icons/logos/twitter";
import { Link } from "@/components/layout/foresight-link";
import { getQueryClient, trpc } from "@/packages/trpc/server";
import { Separator } from "../ui/separator";
import { ModeSwitcher } from "./mode-switcher";

const socialLinks = [
  { href: "https://twitter.com/sycomacademy", label: "Twitter" },
  { href: "https://www.instagram.com/sycomacademy/", label: "Instagram" },
  {
    href: "https://www.linkedin.com/company/sycom-solutions",
    label: "LinkedIn",
  },
  { href: "https://www.facebook.com/sycomacademy/", label: "Facebook" },
];

const iconClass = "size-4";

function SocialIcon({ label }: { label: string }) {
  switch (label) {
    case "Twitter":
      return <TwitterLogo className={iconClass} />;
    case "Instagram":
      return <InstagramLogo className={iconClass} />;
    case "LinkedIn":
      return <LinkedinLogo className={iconClass} colorScheme="grayscale" />;
    case "Facebook":
      return <FacebookLogo className={iconClass} />;
    default:
      return null;
  }
}

export async function Footer() {
  const queryClient = getQueryClient();
  const { posts } = await queryClient.fetchQuery(
    trpc.blog.listPublic.queryOptions({ limit: 5, offset: 0 })
  );

  const { courses } = await queryClient.fetchQuery(
    trpc.course.listPublic.queryOptions({ limit: 5, offset: 0 })
  );

  return (
    <footer className="relative w-full overflow-hidden bg-primary">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-semibold text-lg text-primary-foreground">
              Sycom Academy
            </h3>
            <p className="font-sans text-primary-foreground/80 text-sm leading-relaxed">
              Industry-leading cybersecurity training built by Sycom Solutions.
              13+ years of protecting organizations.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-semibold text-lg text-primary-foreground">
              Popular Courses
            </h3>
            <nav className="flex flex-col gap-2.5">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <Link
                    className="block font-sans text-primary-foreground/80 text-sm transition-colors hover:text-primary-foreground"
                    href={`/courses/${course.slug}` as Route}
                    key={course.id}
                  >
                    {course.title}
                  </Link>
                ))
              ) : (
                <p className="font-sans text-primary-foreground/60 text-sm">
                  No published courses yet.
                </p>
              )}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-semibold text-lg text-primary-foreground">
              Recent Posts
            </h3>
            <nav className="flex flex-col gap-3">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Link
                    className="group block"
                    href={`/blog/${post.slug}` as Route}
                    key={post.id}
                  >
                    <h4 className="font-sans text-primary-foreground text-sm transition-colors group-hover:text-primary-foreground/80">
                      {post.title}
                    </h4>
                    <time className="mt-1 block font-sans text-primary-foreground/60 text-xs">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "Draft"}
                    </time>
                  </Link>
                ))
              ) : (
                <p className="font-sans text-primary-foreground/60 text-sm">
                  No published posts yet.
                </p>
              )}
            </nav>
          </div>

          <div className="mt-4">
            <h4 className="mb-3 font-sans font-semibold text-primary-foreground text-sm">
              Contact details
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary-foreground/80" />
                <span className="font-sans text-primary-foreground/80 text-sm">
                  2 Infirmary St, Leeds LS1 2JP, United Kingdom
                </span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="size-4 shrink-0 text-primary-foreground/80" />
                <a
                  className="font-sans text-primary-foreground/80 text-sm transition-colors hover:text-primary-foreground"
                  href="tel:+441133280244"
                >
                  +44-113-328-0244
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MailIcon className="size-4 shrink-0 text-primary-foreground/80" />
                <a
                  className="font-sans text-primary-foreground/80 text-sm transition-colors hover:text-primary-foreground"
                  href="mailto:info@sycom.academy"
                >
                  info@sycom.academy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-muted">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row sm:px-8">
          <p className="font-sans text-muted-foreground text-sm">
            {new Date().getFullYear()} © Copyright Sycom Solutions
          </p>
          <div className="flex items-center gap-4">
            <ModeSwitcher />
            <Separator
              className="h-4 w-px shrink-0 bg-muted-foreground/40"
              orientation="vertical"
            />
            <div className="flex items-center gap-2">
              {socialLinks.map((item) => (
                <a
                  aria-label={item.label}
                  className="flex size-8 items-center justify-center bg-muted text-muted-foreground transition-colors hover:bg-muted-foreground/10 hover:text-foreground"
                  href={item.href}
                  key={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <SocialIcon label={item.label} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
