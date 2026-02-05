"use client";

import { Card, CardContent } from "@/components/ui/card";

export function StatsCardDemo() {
  const stats = [
    { value: "13", label: "Years Experience", suffix: "+" },
    { value: "70", label: "Enterprise Clients", suffix: "+" },
    { value: "20", label: "Security Engineers", suffix: "+" },
    { value: "5000", label: "Certified Students", suffix: "+" },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card className="text-center" key={stat.label}>
          <CardContent className="p-6">
            <p className="mb-1 font-bold text-4xl text-primary">
              {stat.value}
              {stat.suffix && <span className="text-2xl">{stat.suffix}</span>}
            </p>
            <p className="text-muted-foreground text-sm">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
