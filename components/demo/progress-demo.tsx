"use client";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";

export function ProgressDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Progress Bars</h3>
        <div className="space-y-4">
          <Progress value={25}>
            <ProgressLabel>Course Progress</ProgressLabel>
            <ProgressValue />
          </Progress>
          <Progress value={65}>
            <ProgressLabel>Module Completion</ProgressLabel>
            <ProgressValue />
          </Progress>
          <Progress value={90}>
            <ProgressLabel>Exam Readiness</ProgressLabel>
            <ProgressValue />
          </Progress>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Circular Progress</h3>
        <div className="flex items-center gap-8">
          {[25, 50, 75, 100].map((value) => {
            const percentage = value;
            const circumference = 2 * Math.PI * 36; // radius = 36 (half of 72px size)
            const offset = circumference - (percentage / 100) * circumference;
            return (
              <div className="flex flex-col items-center gap-2" key={value}>
                <div className="relative flex size-20 items-center justify-center">
                  <svg
                    className="size-20 -rotate-90 transform"
                    viewBox="0 0 80 80"
                  >
                    <title>Progress: {value}%</title>
                    <circle
                      className="stroke-current text-muted"
                      cx="40"
                      cy="40"
                      fill="none"
                      r="36"
                      strokeDasharray={circumference}
                      strokeDashoffset={0}
                      strokeWidth="8"
                    />
                    <circle
                      className="stroke-current text-primary transition-all"
                      cx="40"
                      cy="40"
                      fill="none"
                      r="36"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeWidth="8"
                    />
                  </svg>
                  <div className="absolute flex size-16 items-center justify-center rounded-full bg-background">
                    <span className="font-semibold text-sm">{value}%</span>
                  </div>
                </div>
                <span className="text-muted-foreground text-xs">
                  Module {value / 25}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
