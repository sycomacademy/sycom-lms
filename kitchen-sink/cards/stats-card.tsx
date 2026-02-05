import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  value: string;
  label: string;
  suffix?: string;
}

export function StatCard({ value, label, suffix }: StatCardProps) {
  return (
    <Card className="border-border bg-card text-center">
      <CardContent className="p-6">
        <p className="mb-1 font-bold text-4xl text-primary">
          {value}
          {suffix && <span className="text-2xl">{suffix}</span>}
        </p>
        <p className="text-muted-foreground text-sm">{label}</p>
      </CardContent>
    </Card>
  );
}

export function StatCardDemo() {
  const stats = [
    { value: "13", label: "Years Experience", suffix: "+" },
    { value: "70", label: "Enterprise Clients", suffix: "+" },
    { value: "20", label: "Security Engineers", suffix: "+" },
    { value: "5000", label: "Certified Students", suffix: "+" },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
