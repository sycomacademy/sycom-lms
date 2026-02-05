const stats = [
  { value: "13+", label: "Years Experience" },
  { value: "70+", label: "Enterprise Clients" },
  { value: "20+", label: "Security Engineers" },
  { value: "99.9%", label: "Uptime SLA" },
];

export function StatsBar() {
  return (
    <section className="bg-primary py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div className="text-center" key={stat.label}>
              <p className="mb-1 font-bold text-4xl text-primary-foreground">
                {stat.value}
              </p>
              <p className="text-primary-foreground/80 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
