"use client";

import { AwardIcon, BookOpenIcon, ClockIcon, TargetIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileStatsDemo() {
  const stats = [
    {
      title: "Courses Completed",
      value: "12",
      icon: AwardIcon,
      change: "+3 this month",
    },
    {
      title: "Hours Learned",
      value: "342",
      icon: ClockIcon,
      change: "+45 this month",
    },
    {
      title: "Current Courses",
      value: "5",
      icon: BookOpenIcon,
      change: "2 in progress",
    },
    {
      title: "Certifications",
      value: "3",
      icon: TargetIcon,
      change: "CompTIA Security+",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-muted-foreground text-sm">
                {stat.title}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-semibold text-2xl">{stat.value}</div>
              <p className="text-muted-foreground text-xs">{stat.change}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
