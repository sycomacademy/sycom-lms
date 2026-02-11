"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  enrollments: {
    label: "Enrollments",
    theme: {
      light: "var(--chart-1)",
      dark: "var(--chart-1)",
    },
  },
};

const data = [
  { month: "Aug", enrollments: 186 },
  { month: "Sep", enrollments: 305 },
  { month: "Oct", enrollments: 412 },
  { month: "Nov", enrollments: 528 },
  { month: "Dec", enrollments: 641 },
  { month: "Jan", enrollments: 789 },
  { month: "Feb", enrollments: 912 },
];

export function DashboardOverviewChart() {
  return (
    <ChartContainer className="h-64 w-full" config={chartConfig}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickLine={false}
          tickMargin={8}
        />
        <YAxis axisLine={false} tickLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="enrollments"
          fill="var(--color-enrollments)"
          fillOpacity={0.3}
          stroke="var(--color-enrollments)"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  );
}
