"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  total: {
    label: "Users joined",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function formatTooltipDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function AdminSignupsChart({
  data,
}: {
  data: { date: string; label: string; total: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User growth</CardTitle>
        <CardDescription>
          Accounts created across the last 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="aspect-auto h-64 w-full"
          config={chartConfig}
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
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
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload as
                      | { date?: string }
                      | undefined;
                    return item?.date ? formatTooltipDate(item.date) : null;
                  }}
                />
              }
              cursor={false}
            />
            <Area
              dataKey="total"
              fill="var(--color-total)"
              fillOpacity={0.2}
              stroke="var(--color-total)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
