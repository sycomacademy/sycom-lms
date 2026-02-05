import { Calendar, Clock, Monitor, Users } from "lucide-react";

const courseDetails = [
  {
    icon: Clock,
    label: "Duration",
    value: "40 Hours",
  },
  {
    icon: Calendar,
    label: "Schedule",
    value: "Weekdays & Weekends",
  },
  {
    icon: Monitor,
    label: "Format",
    value: "Online & In-Person",
  },
  {
    icon: Users,
    label: "Class Size",
    value: "Max 15 Students",
  },
];

export function CourseInfo() {
  return (
    <section className="bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="rounded-lg border border-border bg-background p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courseDetails.map((detail) => (
              <div className="flex items-center gap-4" key={detail.label}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <detail.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    {detail.label}
                  </p>
                  <p className="font-semibold text-foreground">
                    {detail.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
