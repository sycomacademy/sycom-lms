import { BookOpenIcon, UserCheckIcon, UsersIcon } from "lucide-react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const activities = [
  {
    id: "1",
    type: "completion",
    message: "Alex completed Introduction to React",
    time: "2 hours ago",
    icon: UserCheckIcon,
  },
  {
    id: "2",
    type: "enrollment",
    message: "24 new enrollments in Data Fundamentals",
    time: "5 hours ago",
    icon: UsersIcon,
  },
  {
    id: "3",
    type: "course",
    message: "New course published: Advanced TypeScript",
    time: "Yesterday",
    icon: BookOpenIcon,
  },
  {
    id: "4",
    type: "completion",
    message: "Sam completed Module 3 of Node.js Basics",
    time: "Yesterday",
    icon: UserCheckIcon,
  },
  {
    id: "5",
    type: "enrollment",
    message: "12 new enrollments in API Design",
    time: "2 days ago",
    icon: UsersIcon,
  },
] as const;

export function RecentActivity() {
  return (
    <>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Latest updates across the platform</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-64">
          <ul className="flex flex-col gap-4">
            {activities.map(({ id, message, time, icon: Icon }) => (
              <li className="flex gap-3 text-sm" key={id}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </span>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <p className="text-foreground text-sm leading-snug">
                    {message}
                  </p>
                  <p className="text-muted-foreground text-xs">{time}</p>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </>
  );
}
