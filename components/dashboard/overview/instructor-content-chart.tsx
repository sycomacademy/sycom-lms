"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  courses: {
    label: "Courses",
    color: "var(--chart-1)",
  },
  posts: {
    label: "Posts",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function InstructorContentChart({
  data,
}: {
  data: { label: string; courses: number; posts: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content pipeline</CardTitle>
        <CardDescription>
          Draft and published items across courses and blog posts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="aspect-auto h-64 w-full"
          config={chartConfig}
        >
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="dashed" />}
              cursor={false}
            />
            <Bar dataKey="courses" fill="var(--color-courses)" radius={0} />
            <Bar dataKey="posts" fill="var(--color-posts)" radius={0} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
