"use client";

import { CheckIcon, ClockIcon, StarIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BadgesDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="ghost">Ghost</Badge>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-medium text-sm">With Icons</h3>
        <div className="flex flex-wrap gap-2">
          <Badge>
            <StarIcon />
            Featured
          </Badge>
          <Badge variant="secondary">
            <ClockIcon />
            40h
          </Badge>
          <Badge variant="outline">
            <UsersIcon />
            1,234 Students
          </Badge>
          <Badge variant="outline">
            <CheckIcon />
            Completed
          </Badge>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Course Status</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">In Progress</Badge>
          <Badge>New</Badge>
          <Badge variant="secondary">Popular</Badge>
          <Badge variant="destructive">Enrollment Closed</Badge>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Categories</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">CompTIA</Badge>
          <Badge variant="outline">ISC2</Badge>
          <Badge variant="outline">Cybersecurity</Badge>
          <Badge variant="outline">Networking</Badge>
        </div>
      </div>
    </div>
  );
}
